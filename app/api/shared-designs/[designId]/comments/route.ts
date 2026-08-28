import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";
import type { DesignComment } from "@/types/comment";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getAccess(request: Request, designId: string, requireUser = false) {
  const { adminDb } = getAdminServices();
  const design = await adminDb.collection("designs").doc(designId).get();
  if (!design.exists) return { error: "Design not found.", status: 404 as const };
  const data = design.data() || {};
  const sharing = data.sharing && typeof data.sharing === "object" ? data.sharing as Record<string, unknown> : {};
  const visibility = sharing.visibility === "specific" ? "specific" : data.isPublic === true ? "link" : "private";
  let user: Awaited<ReturnType<typeof verifyPaymentUser>> | null = null;
  try { user = await verifyPaymentUser(request); } catch (error) {
    if (requireUser) return { error: "Authentication required.", status: 401 as const };
  }
  const email = (user?.email || "").toLowerCase();
  const members = Array.isArray(sharing.members) ? sharing.members.filter((item) => item && typeof item === "object") as Record<string, unknown>[] : [];
  const member = members.find((item) => String(item.email || "").toLowerCase() === email);
  const isOwner = user?.uid === data.userId;
  const allowed = Boolean(isOwner || visibility === "link" || (visibility === "specific" && member));
  if (!isOwner && user && typeof data.workspaceId === "string") {
    const workspaceSnapshot = await adminDb.collection("workspaces").doc(data.workspaceId).get();
    const workspaceMembers = workspaceSnapshot.data()?.members;
    if (Array.isArray(workspaceMembers) && workspaceMembers.some((item) => item && typeof item === "object" && (item as Record<string, unknown>).uid === user.uid)) {
      return { db: adminDb, design, data, user, isOwner, member };
    }
  }
  if (!allowed) return { error: "You do not have access to this design.", status: 403 as const };
  return { db: adminDb, design, data, user, isOwner, member };
}

export async function GET(request: Request, { params }: { params: Promise<{ designId: string }> }) {
  try {
    const { designId } = await params;
    const access = await getAccess(request, designId);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });
    const snapshot = await access.db.collection("designs").doc(designId).collection("comments").orderBy("createdAt", "asc").limit(200).get();
    const comments = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as DesignComment[];
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Comments list error:", error);
    return NextResponse.json({ error: "Unable to load comments." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ designId: string }> }) {
  try {
    const { designId } = await params;
    const access = await getAccess(request, designId, true);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });
    const body = await request.json() as { text?: unknown; parentId?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";
    if (!text || text.length > 1000) return NextResponse.json({ error: "Comment must be between 1 and 1000 characters." }, { status: 400 });
    const parentId = typeof body.parentId === "string" && body.parentId.length < 100 ? body.parentId : null;
    if (parentId) {
      const parent = await access.db.collection("designs").doc(designId).collection("comments").doc(parentId).get();
      if (!parent.exists) return NextResponse.json({ error: "Parent comment not found." }, { status: 404 });
    }
    const now = new Date().toISOString();
    const ref = access.db.collection("designs").doc(designId).collection("comments").doc();
    const comment: DesignComment = { id: ref.id, authorId: access.user!.uid, authorEmail: access.user!.email || "", text, parentId, resolved: false, createdAt: now, updatedAt: now };
    await ref.set(comment);
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Comment creation error:", error);
    return NextResponse.json({ error: "Unable to add comment." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ designId: string }> }) {
  try {
    const { designId } = await params;
    const access = await getAccess(request, designId, true);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });
    const body = await request.json() as { commentId?: unknown; resolved?: unknown };
    const commentId = typeof body.commentId === "string" ? body.commentId : "";
    const ref = access.db.collection("designs").doc(designId).collection("comments").doc(commentId);
    const comment = await ref.get();
    if (!comment.exists) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    if (!access.isOwner && comment.data()?.authorId !== access.user!.uid) return NextResponse.json({ error: "Only the owner or comment author can resolve comments." }, { status: 403 });
    await ref.update({ resolved: body.resolved === true, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment update error:", error);
    return NextResponse.json({ error: "Unable to update comment." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ designId: string }> }) {
  try {
    const { designId } = await params;
    const access = await getAccess(request, designId, true);
    if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });
    const commentId = new URL(request.url).searchParams.get("commentId") || "";
    const ref = access.db.collection("designs").doc(designId).collection("comments").doc(commentId);
    const comment = await ref.get();
    if (!comment.exists) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    if (comment.data()?.authorId !== access.user!.uid && !access.isOwner) return NextResponse.json({ error: "You can only delete your own comments." }, { status: 403 });
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comment deletion error:", error);
    return NextResponse.json({ error: "Unable to delete comment." }, { status: 500 });
  }
}
