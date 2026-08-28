import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";
import { getEffectiveSubscription, hasFeature } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getKitLimit(plan: "free" | "pro" | "business"): number {
  if (plan === "business") return 5;
  if (plan === "pro") return 1;
  return 0;
}

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function cleanColors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((color): color is string => typeof color === "string")
    .map((color) => color.trim().toLowerCase())
    .filter((color) => /^#[0-9a-f]{6}$/i.test(color))
    .slice(0, 12);
}

export async function GET(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const { adminDb } = getAdminServices();
    const userSnapshot = await adminDb.collection("users").doc(user.uid).get();
    const plan = getEffectiveSubscription(userSnapshot.data() || {}).effectivePlan;
    if (!hasFeature(plan, "brandKit")) {
      return NextResponse.json({ success: false, error: "Brand Kit is available on the Pro plan." }, { status: 403 });
    }
    const snapshot = await adminDb.collection("users").doc(user.uid).collection("brandKits").get();
    return NextResponse.json({
      success: true,
      brandKits: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    console.error("Brand kit fetch error:", error);
    return NextResponse.json({ success: false, error: "Unable to load brand kits." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const body = (await request.json()) as {
      id?: unknown;
      name?: unknown;
      logoUrl?: unknown;
      colors?: unknown;
      primaryFont?: unknown;
      secondaryFont?: unknown;
    };
    const name = cleanString(body.name, 80);
    if (!name) return NextResponse.json({ success: false, error: "Brand name is required." }, { status: 400 });

    const { adminDb } = getAdminServices();
    const userSnapshot = await adminDb.collection("users").doc(user.uid).get();
    const plan = getEffectiveSubscription(userSnapshot.data() || {}).effectivePlan;
    if (!hasFeature(plan, "brandKit")) {
      return NextResponse.json({ success: false, error: "Brand Kit is available on the Pro plan." }, { status: 403 });
    }
    const kitsRef = adminDb.collection("users").doc(user.uid).collection("brandKits");
    const kitId = cleanString(body.id, 80) || `brand_${Date.now()}`;
    const kitRef = kitsRef.doc(kitId);
    const existing = await kitRef.get();
    if (!existing.exists && (await kitsRef.limit(getKitLimit(plan) + 1).get()).size >= getKitLimit(plan)) {
      return NextResponse.json({ success: false, error: "Upgrade your plan to add a Brand Kit." }, { status: 403 });
    }

    const now = new Date().toISOString();
    const data = {
      name,
      logoUrl: cleanString(body.logoUrl, 2000),
      colors: cleanColors(body.colors),
      primaryFont: cleanString(body.primaryFont, 100) || "Arial",
      secondaryFont: cleanString(body.secondaryFont, 100) || "Arial",
      updatedAt: now,
      ...(existing.exists ? {} : { createdAt: now }),
    };
    await kitRef.set(data, { merge: true });
    return NextResponse.json({ success: true, brandKit: { id: kitId, ...data } });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    console.error("Brand kit save error:", error);
    return NextResponse.json({ success: false, error: "Unable to save Brand Kit." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) return NextResponse.json({ success: false, error: "Brand Kit ID is required." }, { status: 400 });
    const { adminDb } = getAdminServices();
    const userSnapshot = await adminDb.collection("users").doc(user.uid).get();
    const plan = getEffectiveSubscription(userSnapshot.data() || {}).effectivePlan;
    if (!hasFeature(plan, "brandKit")) {
      return NextResponse.json({ success: false, error: "Brand Kit is available on the Pro plan." }, { status: 403 });
    }
    await adminDb.collection("users").doc(user.uid).collection("brandKits").doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }
    console.error("Brand kit delete error:", error);
    return NextResponse.json({ success: false, error: "Unable to delete Brand Kit." }, { status: 500 });
  }
}
