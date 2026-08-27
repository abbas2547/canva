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
export const runtime = "nodejs";

function getPaymentConfigurationStatus() {
  const environment = process.env.CASHFREE_ENVIRONMENT?.trim();
  const apiVersion = process.env.CASHFREE_API_VERSION?.trim() || "2023-08-01";
  const missing: string[] = [];

  if (!process.env.CASHFREE_APP_ID?.trim()) missing.push("CASHFREE_APP_ID");
  if (!process.env.CASHFREE_SECRET_KEY?.trim()) missing.push("CASHFREE_SECRET_KEY");
  if (environment !== "sandbox" && environment !== "production") {
    missing.push("CASHFREE_ENVIRONMENT");
  }

  return {
    environment: environment === "sandbox" || environment === "production" ? environment : "invalid",
    apiVersion,
    missing,
  };
}

export async function POST(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const configuration = getPaymentConfigurationStatus();
    if (configuration.missing.length > 0) {
      console.error("Cashfree payment configuration is incomplete:", {
        missing: configuration.missing,
        environment: configuration.environment,
        apiVersion: configuration.apiVersion,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Payment service is not configured for this deployment.",
        },
        { status: 503 }
      );
    }

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
    const configuredNotifyUrl = process.env.CASHFREE_WEBHOOK_URL?.trim();
    const notifyUrl =
      configuredNotifyUrl && configuredNotifyUrl.endsWith("/api/payments/webhook")
        ? configuredNotifyUrl
        : !isLocalOrigin
          ? `${origin}/api/payments/webhook`
          : undefined;
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
    if (
      error instanceof Error &&
      error.message.startsWith("Firebase Admin configuration is incomplete")
    ) {
      console.error("Payment authentication configuration is incomplete:", {
        environment: process.env.CASHFREE_ENVIRONMENT || "missing",
        missingFirebaseAdminVariables: [
          !process.env.FIREBASE_PROJECT_ID ? "FIREBASE_PROJECT_ID" : null,
          !process.env.FIREBASE_CLIENT_EMAIL ? "FIREBASE_CLIENT_EMAIL" : null,
          !process.env.FIREBASE_PRIVATE_KEY ? "FIREBASE_PRIVATE_KEY" : null,
        ].filter((variable): variable is string => variable !== null),
      });
      return NextResponse.json(
        { success: false, error: "Payment authentication is not configured for this deployment." },
        { status: 503 }
      );
    }
    if (
      error instanceof Error &&
      /private key|credential|service account/i.test(error.message)
    ) {
      console.error("Firebase Admin payment credential error:", {
        message: error.message,
        projectId: process.env.FIREBASE_PROJECT_ID || "missing",
        hasClientEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL?.trim()),
        hasPrivateKey: Boolean(process.env.FIREBASE_PRIVATE_KEY?.trim()),
      });
      return NextResponse.json(
        { success: false, error: "Payment authentication credentials are invalid." },
        { status: 503 }
      );
    }
    if (
      error instanceof Error &&
      typeof error.message === "string" &&
      (error.message.includes("Firebase ID token") || error.message.includes("auth/"))
    ) {
      return NextResponse.json(
        { success: false, error: "Your session could not be verified. Please sign in again." },
        { status: 401 }
      );
    }
    console.error("Payment order creation error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      environment: process.env.CASHFREE_ENVIRONMENT || "missing",
      apiVersion: process.env.CASHFREE_API_VERSION || "2023-08-01",
      hasAppId: Boolean(process.env.CASHFREE_APP_ID?.trim()),
      hasSecretKey: Boolean(process.env.CASHFREE_SECRET_KEY?.trim()),
    });
    return NextResponse.json(
      { success: false, error: "Unable to prepare secure checkout." },
      { status: 500 }
    );
  }
}
