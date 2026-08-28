import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";
import type { ShareMember, ShareRole, ShareVisibility } from "@/types/sharing";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeSharing(data: Record<string, unknown>) {
  const raw = data.sharing;
  const sharing = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const visibility: ShareVisibility =
    sharing.visibility === "link" || sharing.visibility === "specific" ? sharing.visibility : data.isPublic === true ? "link" : "private";
  const members = Array.isArray(sharing.members)
    ? sharing.members.flatMap((member): ShareMember[] => {
        if (!member || typeof member !== "object") return [];
        const value = member as Record<string, unknown>;
        const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
        const role: ShareRole = value.role === "editor" ? "editor" : "viewer";
        return email && email.length <= 320 ? [{ email, role }] : [];
      }).slice(0, 50)
    : [];
  return { visibility, members };
}

export async function GET(request: Request, { params }: { params: Promise<{ designId: string }> }) {
  try {
    const user = await verifyPaymentUser(request);
    const { designId } = await params;
    const { adminDb } = getAdminServices();
    const snapshot = await adminDb.collection("designs").doc(designId).get();
    if (!snapshot.exists) return NextResponse.json({ error: "Design not found." }, { status: 404 });
    const data = snapshot.data() || {};
    if (data.userId !== user.uid) return NextResponse.json({ error: "Only the owner can manage sharing." }, { status: 403 });
    return NextResponse.json({ sharing: normalizeSharing(data) });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Share settings fetch error:", error);
    return NextResponse.json({ error: "Unable to load sharing settings." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ designId: string }> }) {
  try {
    const user = await verifyPaymentUser(request);
    const { designId } = await params;
    const body = await request.json() as { visibility?: unknown; members?: unknown };
    const visibility = body.visibility === "link" || body.visibility === "specific" ? body.visibility : "private";
    const members = Array.isArray(body.members)
      ? body.members.flatMap((member): ShareMember[] => {
          if (!member || typeof member !== "object") return [];
          const value = member as Record<string, unknown>;
          const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
          const role: ShareRole = value.role === "editor" ? "editor" : "viewer";
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320 ? [{ email, role }] : [];
        }).slice(0, 50)
      : [];
    const { adminDb } = getAdminServices();
    const ref = adminDb.collection("designs").doc(designId);
    const snapshot = await ref.get();
    if (!snapshot.exists) return NextResponse.json({ error: "Design not found." }, { status: 404 });
    if (snapshot.data()?.userId !== user.uid) return NextResponse.json({ error: "Only the owner can manage sharing." }, { status: 403 });
    await ref.update({
      isPublic: visibility === "link",
      sharing: { visibility, members, memberEmails: members.map((member) => member.email) },
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ success: true, sharing: { visibility, members } });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Share settings update error:", error);
    return NextResponse.json({ error: "Unable to update sharing settings." }, { status: 500 });
  }
}
