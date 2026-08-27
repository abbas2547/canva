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
        order_meta: {
          return_url: `${origin}/pricing?payment=complete&order_id=${encodeURIComponent(orderId)}`,
          notify_url:
            process.env.CASHFREE_WEBHOOK_URL ||
            `${origin}/api/payments/webhook`,
        },
        order_note: `${plan.name} subscription for Mini Canva AI`,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const providerError = await response
        .json()
        .catch(() => ({}) as { code?: unknown; message?: unknown });
      console.error("Cashfree order creation failed:", {
        status: response.status,
        code: typeof providerError.code === "string" ? providerError.code : undefined,
        environment: process.env.CASHFREE_ENVIRONMENT,
      });
      return NextResponse.json(
        {
          success: false,
          error:
            response.status === 401
              ? "Cashfree rejected the configured credentials. Check that CASHFREE_ENVIRONMENT matches the keys."
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
