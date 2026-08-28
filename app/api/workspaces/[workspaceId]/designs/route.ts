import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase-admin";
import { verifyPaymentUser } from "@/lib/payment-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function access(request: Request, workspaceId: string) {
  const user = await verifyPaymentUser(request);
  const { adminDb } = getAdminServices();
  const workspace = await adminDb.collection("workspaces").doc(workspaceId).get();
  if (!workspace.exists) return { error: "Workspace not found.", status: 404 as const };
  const data = workspace.data() || {};
  const members = Array.isArray(data.members) ? data.members as Array<{ uid?: string; role?: string }> : [];
  const member = members.find((item) => item.uid === user.uid);
  if (!member) return { error: "You are not a member of this workspace.", status: 403 as const };
  return { user, adminDb, workspace, member };
}

export async function GET(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await params;
    const result = await access(request, workspaceId);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    const snapshot = await result.adminDb.collection("designs").where("workspaceId", "==", workspaceId).limit(100).get();
    return NextResponse.json({ designs: snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Workspace designs list error:", error);
    return NextResponse.json({ error: "Unable to load workspace designs." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await params;
    const result = await access(request, workspaceId);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.status });
    if (!["owner", "admin", "editor"].includes(result.member.role || "")) return NextResponse.json({ error: "You do not have permission to manage workspace designs." }, { status: 403 });
    const body = await request.json() as { designId?: unknown; attached?: unknown };
    const designId = typeof body.designId === "string" ? body.designId : "";
    const designRef = result.adminDb.collection("designs").doc(designId);
    const design = await designRef.get();
    if (!design.exists) return NextResponse.json({ error: "Design not found." }, { status: 404 });
    if (body.attached === false) {
      if (design.data()?.userId !== result.user.uid && result.member.role !== "owner" && result.member.role !== "admin") return NextResponse.json({ error: "Only the design owner or workspace admin can detach it." }, { status: 403 });
      await designRef.update({ workspaceId: null, updatedAt: new Date().toISOString() });
    } else {
      if (design.data()?.userId !== result.user.uid && result.member.role !== "owner" && result.member.role !== "admin") return NextResponse.json({ error: "Only the design owner or workspace admin can attach it." }, { status: 403 });
      await designRef.update({ workspaceId, updatedAt: new Date().toISOString() });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "AUTHENTICATION_REQUIRED") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    console.error("Workspace design update error:", error);
    return NextResponse.json({ error: "Unable to update workspace design." }, { status: 500 });
  }
}
