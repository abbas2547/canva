import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminServices } from "@/lib/firebase-admin";
import {
  PAID_PLANS,
  createCashfreeOrderId,
  getCashfreeBaseUrl,
  getCashfreeHeaders,
  normalizeCustomerPhone,
  isValidCustomerPhone,
} from "@/lib/cashfree";
import { verifyPaymentUser } from "@/lib/payment-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const body = (await request.json()) as { planId?: unknown; customerPhone?: unknown };
    const planId = body.planId;

    if (planId !== "pro" && planId !== "business") {
      return NextResponse.json({ success: false, error: "Invalid plan selected." }, { status: 400 });
    }

    const plan = PAID_PLANS[planId];
    const customerPhone = normalizeCustomerPhone(body.customerPhone);
    if (!isValidCustomerPhone(customerPhone)) {
      return NextResponse.json(
        { success: false, error: "A valid customer phone number is required." },
        { status: 400 }
      );
    }

    const orderId = createCashfreeOrderId(user.uid);
    const origin = new URL(request.url).origin;
    const requestHost = new URL(request.url).hostname;
    const isLocalOrigin =
      requestHost === "localhost" ||
      requestHost === "127.0.0.1" ||
      requestHost === "::1";
    const returnUrl =
      process.env.CASHFREE_RETURN_URL?.trim() ||
      (!isLocalOrigin
        ? `${origin}/pricing?payment=complete&order_id=${encodeURIComponent(orderId)}`
        : undefined);
    const notifyUrl =
      process.env.CASHFREE_WEBHOOK_URL?.trim() ||
      (!isLocalOrigin ? `${origin}/api/payments/webhook` : undefined);
    const orderMeta =
      returnUrl || notifyUrl
        ? {
            ...(returnUrl ? { return_url: returnUrl } : {}),
            ...(notifyUrl ? { notify_url: notifyUrl } : {}),
          }
        : undefined;
    const response = await fetch(`${getCashfreeBaseUrl()}/pg/orders`, {
      method: "POST",
      headers: {
        ...getCashfreeHeaders(),
        "x-idempotency-key": orderId,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: plan.amount,
        order_currency: plan.currency,
        customer_details: {
          customer_id: user.uid,
          customer_name: user.name || "Mini Canva User",
          customer_email: user.email || undefined,
          customer_phone: customerPhone,
        },
        ...(orderMeta ? { order_meta: orderMeta } : {}),
        order_note: `${plan.name} subscription for Mini Canva AI`,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const providerBody = await response.text();
      let providerError: { code?: unknown; message?: unknown; type?: unknown } = {};
      try {
        const parsed = JSON.parse(providerBody) as unknown;
        if (typeof parsed === "object" && parsed !== null) {
          providerError = parsed as {
            code?: unknown;
            message?: unknown;
            type?: unknown;
          };
        }
      } catch {
        // Keep the provider response out of the client when it is not JSON.
      }
      const providerMessage =
        typeof providerError.message === "string" ? providerError.message : "";
      console.error("Cashfree order creation failed:", {
        status: response.status,
        code: typeof providerError.code === "string" ? providerError.code : undefined,
        type: typeof providerError.type === "string" ? providerError.type : undefined,
        message: providerMessage || undefined,
        environment: process.env.CASHFREE_ENVIRONMENT,
        apiVersion: process.env.CASHFREE_API_VERSION || "2023-08-01",
      });
      return NextResponse.json(
        {
          success: false,
          error:
            response.status === 401
              ? "Cashfree rejected the configured credentials. Check that CASHFREE_ENVIRONMENT matches the keys."
              : response.status === 403
                ? "Cashfree rejected this merchant account or request. Check the live Cashfree account configuration."
                : providerMessage
                  ? `Cashfree rejected the order: ${providerMessage}`
              : "Unable to prepare secure checkout.",
        },
        { status: 502 }
      );
    }

    const order = (await response.json()) as {
      payment_session_id?: string;
      order_id?: string;
    };
    if (!order.payment_session_id || order.order_id !== orderId) {
      console.error("Cashfree returned an invalid order response.");
      return NextResponse.json(
        { success: false, error: "Unable to prepare secure checkout." },
        { status: 502 }
      );
    }

    const { adminDb } = getAdminServices();
    await adminDb.collection("payments").doc(orderId).set({
      orderId,
      userId: user.uid,
      planId: plan.id,
      planName: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      status: "created",
      customerPhone,
      paymentSessionId: order.payment_session_id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      orderId,
      paymentSessionId: order.payment_session_id,
      environment: process.env.CASHFREE_ENVIRONMENT,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    console.error("Payment order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to prepare secure checkout." },
      { status: 500 }
    );
  }
}
