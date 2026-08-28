import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { getAllTemplates } from "@/data/templates";
import { normalizeSubscriptionPlan, getTemplateLimit } from "@/lib/subscription";
import { verifyPaymentUser } from "@/lib/payment-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const body = (await request.json()) as { templateId?: unknown };
    const templateId = typeof body.templateId === "string" ? body.templateId : "";
    const templateIndex = getAllTemplates().findIndex((template) => template.id === templateId);

    if (templateIndex < 0) {
      return NextResponse.json({ success: false, error: "Template not found." }, { status: 404 });
    }

    const { adminDb } = getAdminServices();
    const userSnapshot = await adminDb.collection("users").doc(user.uid).get();
    const plan = normalizeSubscriptionPlan(userSnapshot.data()?.subscriptionPlan);
    if (templateIndex >= getTemplateLimit(plan)) {
      return NextResponse.json(
        { success: false, error: "Upgrade your plan to use this template." },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    console.error("Template authorization error:", error);
    return NextResponse.json({ success: false, error: "Unable to authorize template." }, { status: 500 });
  }
}
