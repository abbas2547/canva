import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";
import { getEffectiveSubscription, hasFeature } from "@/lib/subscription";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const { adminDb } = getAdminServices();
    const snapshot = await adminDb.collection("workspaces").where("memberIds", "array-contains", user.uid).limit(50).get();
    const workspaces = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    return NextResponse.json({ workspaces });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Workspace list error:", error);
    return NextResponse.json({ error: "Unable to load workspaces." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await verifyPaymentUser(request);
    const { adminDb } = getAdminServices();
    const userSnapshot = await adminDb.collection("users").doc(user.uid).get();
    const plan = getEffectiveSubscription(userSnapshot.data() || {}).effectivePlan;
    if (!hasFeature(plan, "teamWorkspace")) return NextResponse.json({ error: "Team workspaces are available on the Business plan.", code: "UPGRADE_REQUIRED" }, { status: 403 });
    const body = await request.json() as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name || name.length > 80) return NextResponse.json({ error: "Workspace name must be between 1 and 80 characters." }, { status: 400 });
    const id = `workspace_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const owner = { uid: user.uid, email: (user.email || "").toLowerCase(), role: "owner" as const };
    await adminDb.collection("workspaces").doc(id).set({ id, name, ownerId: user.uid, members: [owner], memberIds: [user.uid], createdAt: now, updatedAt: now });
    return NextResponse.json({ workspace: { id, name, ownerId: user.uid, members: [owner], createdAt: now, updatedAt: now } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Workspace creation error:", error);
    return NextResponse.json({ error: "Unable to create workspace." }, { status: 500 });
  }
}
