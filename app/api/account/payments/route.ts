import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const { adminDb } = getAdminServices();
    const snapshot = await adminDb.collection("payments").where("userId", "==", user.uid).limit(100).get();
    const payments = snapshot.docs.map((item) => {
      const data = item.data();
      const createdAt = data.createdAt && typeof data.createdAt.toDate === "function"
        ? data.createdAt.toDate().toISOString()
        : typeof data.createdAt === "string" ? data.createdAt : null;
      return {
        orderId: item.id,
        planName: typeof data.planName === "string" ? data.planName : data.planId || "Plan",
        planId: data.planId || null,
        amount: typeof data.amount === "number" ? data.amount : 0,
        currency: typeof data.currency === "string" ? data.currency : "INR",
        status: typeof data.status === "string" ? data.status : "unknown",
        paymentReference: typeof data.paymentReference === "string" ? data.paymentReference : null,
        createdAt,
      };
    }).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return NextResponse.json({ payments });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Account payment history error:", error);
    return NextResponse.json({ error: "Unable to load payment history." }, { status: 500 });
  }
}
