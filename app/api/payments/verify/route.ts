import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { getCashfreeBaseUrl, getCashfreeHeaders, PAID_PLANS, PaidPlanId } from "@/lib/cashfree";
import { verifyPaymentUser } from "@/lib/payment-auth";

export const dynamic = "force-dynamic";

async function activatePayment(
  orderId: string,
  userId: string,
  paymentStatus: "active" | "failed" | "pending",
  paymentReference?: string
) {
  const { adminDb } = getAdminServices();
  const paymentRef = adminDb.collection("payments").doc(orderId);
  const userRef = adminDb.collection("users").doc(userId);

  await adminDb.runTransaction(async (transaction) => {
    const paymentSnapshot = await transaction.get(paymentRef);
    if (!paymentSnapshot.exists) throw new Error("PAYMENT_NOT_FOUND");
    const payment = paymentSnapshot.data() as {
      userId?: string;
      planId?: PaidPlanId;
      amount?: number;
      status?: string;
    };
    if (payment.userId !== userId || !payment.planId || !PAID_PLANS[payment.planId]) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    if (paymentStatus === "active" && payment.status !== "active") {
      transaction.set(
        userRef,
        {
          role: "premium",
          subscriptionPlan: payment.planId,
          subscriptionStatus: "active",
          subscriptionStartDate: new Date().toISOString(),
          subscriptionEndDate: null,
          paymentOrderId: orderId,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    transaction.set(
      paymentRef,
      {
        status: paymentStatus,
        paymentReference: paymentReference || null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  });
}

export async function POST(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const body = (await request.json()) as { orderId?: unknown };
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    if (!orderId || !/^mca_[a-zA-Z0-9_]+$/.test(orderId)) {
      return NextResponse.json({ success: false, error: "Invalid order." }, { status: 400 });
    }

    const { adminDb } = getAdminServices();
    const paymentSnapshot = await adminDb.collection("payments").doc(orderId).get();
    if (!paymentSnapshot.exists || paymentSnapshot.data()?.userId !== user.uid) {
      return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
    }

    const payment = paymentSnapshot.data() as { planId?: PaidPlanId; amount?: number };
    const plan = payment.planId ? PAID_PLANS[payment.planId] : undefined;
    if (!plan || payment.amount !== plan.amount) {
      return NextResponse.json({ success: false, error: "Payment configuration mismatch." }, { status: 409 });
    }

    const orderResponse = await fetch(`${getCashfreeBaseUrl()}/pg/orders/${encodeURIComponent(orderId)}`, {
      headers: getCashfreeHeaders(),
      cache: "no-store",
    });
    if (!orderResponse.ok) {
      return NextResponse.json({ success: false, status: "pending" }, { status: 202 });
    }

    const order = (await orderResponse.json()) as {
      order_status?: string;
      order_amount?: number;
    };
    if (order.order_amount !== plan.amount) {
      return NextResponse.json({ success: false, error: "Payment amount mismatch." }, { status: 409 });
    }

    if (order.order_status !== "PAID") {
      const status = order.order_status === "EXPIRED" || order.order_status === "CANCELLED" ? "failed" : "pending";
      await activatePayment(orderId, user.uid, status);
      return NextResponse.json({ success: false, status }, { status: status === "pending" ? 202 : 402 });
    }

    const paymentsResponse = await fetch(
      `${getCashfreeBaseUrl()}/pg/orders/${encodeURIComponent(orderId)}/payments`,
      { headers: getCashfreeHeaders(), cache: "no-store" }
    );
    const payments = paymentsResponse.ok
      ? ((await paymentsResponse.json()) as Array<{ payment_status?: string; cf_payment_id?: string }>)
      : [];
    const successfulPayment = payments.find((item) => item.payment_status === "SUCCESS");
    if (!successfulPayment) {
      return NextResponse.json({ success: false, status: "pending" }, { status: 202 });
    }

    await activatePayment(orderId, user.uid, "active", successfulPayment.cf_payment_id);
    return NextResponse.json({ success: true, status: "active", planId: plan.id });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "PAYMENT_NOT_FOUND") {
      return NextResponse.json({ success: false, error: "Payment not found." }, { status: 404 });
    }
    console.error("Payment verification error:", error);
    return NextResponse.json({ success: false, error: "Payment verification failed." }, { status: 500 });
  }
}
