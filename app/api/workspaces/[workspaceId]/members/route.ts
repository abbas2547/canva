import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";
import type { WorkspaceMember, WorkspaceRole } from "@/types/workspace";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getWorkspace(workspaceId: string) {
  const { adminDb } = getAdminServices();
  const ref = adminDb.collection("workspaces").doc(workspaceId);
  const snapshot = await ref.get();
  return { ref, snapshot };
}

function canManage(member: WorkspaceMember | undefined) {
  return member?.role === "owner" || member?.role === "admin";
}

export async function POST(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const user = await verifyPaymentUser(request);
    const { workspaceId } = await params;
    const { ref, snapshot } = await getWorkspace(workspaceId);
    if (!snapshot.exists) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    const data = snapshot.data() || {};
    const members = Array.isArray(data.members) ? data.members as WorkspaceMember[] : [];
    const actor = members.find((member) => member.uid === user.uid);
    if (!canManage(actor)) return NextResponse.json({ error: "Only workspace owners and admins can invite members." }, { status: 403 });
    const body = await request.json() as { email?: unknown; role?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role: WorkspaceRole = body.role === "admin" || body.role === "editor" || body.role === "viewer" ? body.role : "viewer";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return NextResponse.json({ error: "Enter a valid member email." }, { status: 400 });
    if (members.some((member) => member.email === email)) return NextResponse.json({ error: "That person is already a member." }, { status: 409 });
    const { adminAuth } = getAdminServices();
    let uid: string | null = null;
    try { uid = (await adminAuth.getUserByEmail(email)).uid; } catch (error) {
      const code = typeof error === "object" && error !== null && "code" in error ? String((error as { code?: unknown }).code) : "";
      if (code !== "auth/user-not-found") throw error;
    }
    const nextMember: WorkspaceMember = { uid, email, role };
    await ref.update({ members: [...members, nextMember], memberIds: [...new Set([...(Array.isArray(data.memberIds) ? data.memberIds as string[] : []), ...(uid ? [uid] : [])])], updatedAt: new Date().toISOString() });
    return NextResponse.json({ member: nextMember });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Workspace invite error:", error);
    return NextResponse.json({ error: "Unable to invite member." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const user = await verifyPaymentUser(request);
    const { workspaceId } = await params;
    const { ref, snapshot } = await getWorkspace(workspaceId);
    if (!snapshot.exists) return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    const data = snapshot.data() || {};
    const members = Array.isArray(data.members) ? data.members as WorkspaceMember[] : [];
    const actor = members.find((member) => member.uid === user.uid);
    if (!canManage(actor)) return NextResponse.json({ error: "Only workspace owners and admins can remove members." }, { status: 403 });
    const body = await request.json() as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const target = members.find((member) => member.email === email);
    if (!target) return NextResponse.json({ error: "Member not found." }, { status: 404 });
    if (target.role === "owner") return NextResponse.json({ error: "The workspace owner cannot be removed." }, { status: 400 });
    const nextMembers = members.filter((member) => member.email !== email);
    await ref.update({ members: nextMembers, memberIds: nextMembers.flatMap((member) => member.uid ? [member.uid] : []), updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Workspace member removal error:", error);
    return NextResponse.json({ error: "Unable to remove member." }, { status: 500 });
  }
}
