"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Plus, Users, UserPlus, Trash2, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserDesigns } from "@/lib/db-operations";
import { useRouter } from "next/navigation";
import type { Workspace, WorkspaceMember, WorkspaceRole } from "@/types/workspace";
import type { DesignDocument } from "@/types/design";
import toast from "react-hot-toast";

export default function WorkspacePage() {
  const { user, loading, subscriptionPlan } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selected, setSelected] = useState<Workspace | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("viewer");
  const [busy, setBusy] = useState(false);
  const [workspaceDesigns, setWorkspaceDesigns] = useState<DesignDocument[]>([]);
  const [myDesigns, setMyDesigns] = useState<DesignDocument[]>([]);

  const request = async (url: string, options: RequestInit = {}) => {
    if (!user) throw new Error("Authentication required.");
    const token = await user.getIdToken();
    const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
    const data = await response.json().catch(() => ({})) as { error?: string; workspaces?: Workspace[]; workspace?: Workspace; member?: WorkspaceMember; designs?: DesignDocument[] };
    if (!response.ok) throw new Error(data.error || "Workspace request failed.");
    return data;
  };

  useEffect(() => {
    if (!loading && !user) router.replace("/login?from=/workspace");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || subscriptionPlan !== "business") return;
    request("/api/workspaces").then((data) => {
      const list = data.workspaces || [];
      setWorkspaces(list);
      setSelected(list[0] || null);
    }).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load workspaces."));
  }, [user, subscriptionPlan]);

  useEffect(() => {
    if (!selected) {
      setWorkspaceDesigns([]);
      return;
    }
    request(`/api/workspaces/${selected.id}/designs`).then((data) => setWorkspaceDesigns((data.designs || []) as DesignDocument[])).catch((error) => toast.error(error instanceof Error ? error.message : "Unable to load workspace designs."));
  }, [selected]);

  useEffect(() => {
    if (!user) return;
    getUserDesigns(user.uid).then(setMyDesigns).catch((error) => console.error("Workspace design picker error:", error));
  }, [user?.uid]);

  const attachDesign = async (designId: string, attached: boolean) => {
    if (!selected) return;
    try {
      await request(`/api/workspaces/${selected.id}/designs`, { method: "PATCH", body: JSON.stringify({ designId, attached }) });
      const design = myDesigns.find((item) => item.id === designId);
      if (attached && design) setWorkspaceDesigns((current) => [...current.filter((item) => item.id !== designId), { ...design, workspaceId: selected.id }]);
      if (!attached) setWorkspaceDesigns((current) => current.filter((item) => item.id !== designId));
      toast.success(attached ? "Design attached to workspace." : "Design detached.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to update workspace design."); }
  };

  const createWorkspace = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await request("/api/workspaces", { method: "POST", body: JSON.stringify({ name }) });
      if (data.workspace) {
        setWorkspaces((current) => [...current, data.workspace as Workspace]);
        setSelected(data.workspace);
        setName("");
      }
      toast.success("Workspace created.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create workspace."); } finally { setBusy(false); }
  };

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    try {
      const data = await request(`/api/workspaces/${selected.id}/members`, { method: "POST", body: JSON.stringify({ email, role }) });
      if (data.member) {
        const updated = { ...selected, members: [...selected.members, data.member] };
        setSelected(updated);
        setWorkspaces((current) => current.map((workspace) => workspace.id === updated.id ? updated : workspace));
      }
      setEmail("");
      toast.success("Member invited.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to invite member."); } finally { setBusy(false); }
  };

  const remove = async (memberEmail: string) => {
    if (!selected || !window.confirm("Remove this member from the workspace?")) return;
    try {
      await request(`/api/workspaces/${selected.id}/members`, { method: "DELETE", body: JSON.stringify({ email: memberEmail }) });
      const updated = { ...selected, members: selected.members.filter((member) => member.email !== memberEmail) };
      setSelected(updated);
      setWorkspaces((current) => current.map((workspace) => workspace.id === updated.id ? updated : workspace));
      toast.success("Member removed.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to remove member."); }
  };

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={30} /></div>;
  if (subscriptionPlan !== "business") return <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4"><div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Crown className="mx-auto text-amber-500" size={32} /><h1 className="mt-4 text-2xl font-bold text-slate-900">Business workspaces</h1><p className="mt-2 text-sm text-slate-500">Upgrade to Business to create workspaces and collaborate with your team.</p><button onClick={() => router.push("/pricing")} className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white">View Business plan</button></div></div>;

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8"><div className="mx-auto max-w-6xl">
    <div className="mb-8 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-slate-900">Team workspaces</h1><p className="mt-1 text-sm text-slate-500">Create shared spaces and manage member access.</p></div><button onClick={() => router.push("/dashboard")} className="text-sm font-medium text-indigo-600">Back to designs</button></div>
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-4"><h2 className="mb-3 text-sm font-semibold text-slate-900">Your workspaces</h2>{workspaces.map((workspace) => <button key={workspace.id} onClick={() => setSelected(workspace)} className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${selected?.id === workspace.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}><Users size={16} />{workspace.name}</button>)}<form onSubmit={createWorkspace} className="mt-4 border-t border-slate-100 pt-4"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="New workspace name" maxLength={80} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" /><button disabled={busy || !name.trim()} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} />Create workspace</button></form></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">{selected ? <><div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><h2 className="text-xl font-bold text-slate-900">{selected.name}</h2><p className="mt-1 text-sm text-slate-500">{selected.members.length} member{selected.members.length === 1 ? "" : "s"}</p></div></div><form onSubmit={invite} className="mt-5 flex flex-col gap-2 sm:flex-row"><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Invite by email" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500" /><select value={role} onChange={(event) => setRole(event.target.value as WorkspaceRole)} className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm"><option value="viewer">Viewer</option><option value="editor">Editor</option><option value="admin">Admin</option></select><button disabled={busy || !email.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><UserPlus size={16} />Invite</button></form><div className="mt-6 space-y-2">{selected.members.map((member) => <div key={member.email} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"><div><p className="text-sm font-medium text-slate-800">{member.email}</p><p className="text-xs capitalize text-slate-400">{member.role}{member.uid ? "" : " · pending"}</p></div>{member.role !== "owner" && <button onClick={() => void remove(member.email)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${member.email}`}><Trash2 size={16} /></button>}</div>)}</div><div className="mt-8 border-t border-slate-100 pt-5"><h3 className="text-sm font-semibold text-slate-900">Shared designs</h3>{workspaceDesigns.length === 0 ? <p className="mt-3 text-sm text-slate-500">No designs are attached to this workspace yet.</p> : <div className="mt-3 space-y-2">{workspaceDesigns.map((design) => <button key={design.id} onClick={() => router.push(`/editor/${design.id}`)} className="flex w-full items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-left hover:bg-slate-50"><span className="text-sm font-medium text-slate-700">{design.title}</span><span className="text-xs text-slate-400">{design.width}×{design.height}</span></button>)}</div>}<div className="mt-4 border-t border-slate-100 pt-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Attach your designs</p><div className="max-h-40 space-y-2 overflow-y-auto">{myDesigns.filter((design) => !workspaceDesigns.some((shared) => shared.id === design.id)).slice(0, 20).map((design) => <div key={design.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="truncate text-sm text-slate-700">{design.title}</span><button onClick={() => void attachDesign(design.id, true)} className="ml-3 shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-700">Attach</button></div>)}</div></div></div></> : <div className="py-16 text-center text-sm text-slate-500">Create a workspace to start collaborating.</div>}</section>
    </div>
  </div></main>;
}
