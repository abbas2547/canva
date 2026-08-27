import { NextResponse } from "next/server";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { getAdminServices } from "@/lib/firebase-admin";
import { PAID_PLANS, PaidPlanId } from "@/lib/cashfree";

export const dynamic = "force-dynamic";

function isValidSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null
) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret || !timestamp || !signature) return false;
  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber) || Math.abs(Date.now() - timestampNumber) > 5 * 60 * 1000) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-webhook-signature");
  const timestamp = request.headers.get("x-webhook-timestamp");

  if (!isValidSignature(rawBody, timestamp, signature)) {
    return NextResponse.json({ success: false, error: "Invalid webhook." }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as {
      type?: string;
      data?: {
        order?: { order_id?: string; order_amount?: number };
        payment?: { payment_status?: string; cf_payment_id?: string };
      };
    };
    const orderId = payload.data?.order?.order_id;
    if (!orderId || !/^mca_[a-zA-Z0-9_]+$/.test(orderId)) {
      return NextResponse.json({ success: true });
    }

    const status = payload.data?.payment?.payment_status;
    const mappedStatus =
      status === "SUCCESS"
        ? "active"
        : status === "FAILED" || status === "USER_DROPPED"
          ? "failed"
          : "pending";
    const { adminDb } = getAdminServices();
    const paymentRef = adminDb.collection("payments").doc(orderId);
    const eventId =
      request.headers.get("x-webhook-id") ||
      createHash("sha256").update(rawBody).digest("hex");
    const eventRef = adminDb.collection("paymentEvents").doc(eventId);
    const userRefById = (userId: string) => adminDb.collection("users").doc(userId);

    await adminDb.runTransaction(async (transaction) => {
      const [eventSnapshot, paymentSnapshot] = await Promise.all([
        transaction.get(eventRef),
        transaction.get(paymentRef),
      ]);
      if (eventSnapshot.exists || !paymentSnapshot.exists) return;

      const payment = paymentSnapshot.data() as {
        userId?: string;
        planId?: PaidPlanId;
        amount?: number;
        status?: string;
      };
      const plan = payment.planId ? PAID_PLANS[payment.planId] : undefined;
      const webhookAmount = payload.data?.order?.order_amount;
      if (
        !payment.userId ||
        !plan ||
        payment.amount !== plan.amount ||
        (webhookAmount !== undefined && webhookAmount !== plan.amount)
      ) {
        return;
      }

      if (payment.status !== "active" && mappedStatus === "active") {
        transaction.set(
          userRefById(payment.userId),
          {
            role: "premium",
            subscriptionPlan: plan.id,
            subscriptionStatus: "active",
            subscriptionStartDate: new Date().toISOString(),
            subscriptionEndDate: null,
            paymentOrderId: orderId,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      if (payment.status !== "active") {
        transaction.set(
          paymentRef,
          {
            status: mappedStatus,
            paymentReference: payload.data?.payment?.cf_payment_id || null,
            webhookType: payload.type || null,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      transaction.create(eventRef, {
        eventId,
        orderId,
        type: payload.type || null,
        receivedAt: new Date().toISOString(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cashfree webhook processing error:", error);
    return NextResponse.json({ success: false, error: "Webhook processing failed." }, { status: 500 });
  }
}
