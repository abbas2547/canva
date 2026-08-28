import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ designId: string }> }) {
  try {
    const { designId } = await params;
    const { adminDb } = getAdminServices();
    const snapshot = await adminDb.collection("designs").doc(designId).get();
    if (!snapshot.exists) return NextResponse.json({ error: "Design not found." }, { status: 404 });
    const data = snapshot.data() || {};
    const rawSharing = data.sharing && typeof data.sharing === "object" ? data.sharing as Record<string, unknown> : {};
    const visibility = rawSharing.visibility === "specific" ? "specific" : data.isPublic === true ? "link" : "private";
    const owner = data.userId as string;
    let requesterUid = "";
    let requesterEmail = "";
    try {
      const requester = await verifyPaymentUser(request);
      requesterUid = requester.uid;
      requesterEmail = (requester.email || "").toLowerCase();
    } catch {
      // Anonymous users may still access link-shared designs.
    }
    const isOwner = requesterUid === owner;
    const member = Array.isArray(rawSharing.members)
      ? rawSharing.members.find((item) => item && typeof item === "object" && (item as Record<string, unknown>).email === requesterEmail) as Record<string, unknown> | undefined
      : undefined;
    const allowed = isOwner || visibility === "link" || (visibility === "specific" && Boolean(member));
    let workspaceRole: string | null = null;
    if (!isOwner && typeof data.workspaceId === "string" && requesterUid) {
      const workspaceSnapshot = await adminDb.collection("workspaces").doc(data.workspaceId).get();
      const workspaceMember = workspaceSnapshot.data()?.members;
      if (Array.isArray(workspaceMember)) {
        const matchingMember = workspaceMember.find((item) => item && typeof item === "object" && (item as Record<string, unknown>).uid === requesterUid) as Record<string, unknown> | undefined;
        workspaceRole = typeof matchingMember?.role === "string" ? matchingMember.role : null;
      }
    }
    const workspaceAllowed = Boolean(workspaceRole);
    if (!allowed && !workspaceAllowed) return NextResponse.json({ error: "You do not have access to this design." }, { status: 403 });
    if (!isOwner) {
      await snapshot.ref.update({ views: (Number(data.views) || 0) + 1 }).catch((error) => console.error("Shared design view update error:", error));
    }
    return NextResponse.json({
      design: {
        id: snapshot.id,
        title: data.title || "Untitled design",
        width: data.width,
        height: data.height,
        pages: data.pages || [],
        thumbnail: data.thumbnail || null,
        views: data.views || 0,
      },
      canEdit: isOwner || member?.role === "editor" || workspaceRole === "owner" || workspaceRole === "admin" || workspaceRole === "editor",
    });
  } catch (error) {
    console.error("Shared design fetch error:", error);
    return NextResponse.json({ error: "Unable to load shared design." }, { status: 500 });
  }
}
