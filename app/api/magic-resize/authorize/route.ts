import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";
import { normalizeSubscriptionPlan } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const { adminDb } = getAdminServices();
    const snapshot = await adminDb.collection("users").doc(user.uid).get();
    const plan = normalizeSubscriptionPlan(snapshot.data()?.subscriptionPlan);
    if (plan === "free") {
      return NextResponse.json(
        { success: false, error: "Magic Resize is available on Pro and Business plans." },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    console.error("Magic Resize authorization error:", error);
    return NextResponse.json({ success: false, error: "Unable to authorize Magic Resize." }, { status: 500 });
  }
}
