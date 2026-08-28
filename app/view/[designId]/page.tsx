"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Loader2, ExternalLink, ArrowLeft, Download, MessageCircle, Send, Check, Trash2 } from "lucide-react";
import * as fabric from "fabric";
import Link from "next/link";
import { auth } from "@/lib/firebaseClient";
import type { DesignComment } from "@/types/comment";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";

interface DesignData {
  id: string;
  title: string;
  width: number;
  height: number;
  isPublic: boolean;
  pages: { id: string; name: string; json: string }[];
  thumbnail: string | null;
  views: number;
}

export default function ViewDesignPage() {
  const { designId } = useParams<{ designId: string }>();
  const [design, setDesign] = useState<DesignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [comments, setComments] = useState<DesignComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!designId) return;

    const fetchDesign = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`/api/shared-designs/${designId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await response.json() as { design?: DesignData; canEdit?: boolean; error?: string };
        if (!response.ok || !data.design) {
          setError(response.status === 403 ? "This design is private" : data.error || "Design not found");
          return;
        }
        setDesign(data.design);
        setCanEdit(data.canEdit === true);
      } catch (loadError) {
        console.error("Shared design load error:", loadError);
        setError("Failed to load design");
      } finally {
        setLoading(false);
      }
    };

    fetchDesign();
  }, [designId]);

  useEffect(() => {
    if (!designId || !design) return;
    const commentsQuery = query(
      collection(db, "designs", designId, "comments"),
      orderBy("createdAt", "asc"),
      limit(200)
    );
    return onSnapshot(
      commentsQuery,
      (snapshot) => {
        setComments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as DesignComment[]);
        setCommentsError(null);
      },
      (listenerError) => {
        console.error("Comments listener error:", listenerError);
        setCommentsError("Comments are unavailable for this design.");
      }
    );
  }, [designId, design]);

  const commentRequest = async (url: string, options: RequestInit = {}) => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Sign in to comment on this design.");
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const data = await response.json() as { comment?: DesignComment; error?: string };
    if (!response.ok) throw new Error(data.error || "Comment request failed.");
    return data;
  };

  const addComment = async () => {
    const text = commentText.trim();
    if (!text || !designId) return;
    try {
      const data = await commentRequest(`/api/shared-designs/${designId}/comments`, { method: "POST", body: JSON.stringify({ text, parentId: replyTo }) });
      if (data.comment) setComments((current) => [...current, data.comment as DesignComment]);
      setCommentText("");
      setReplyTo(null);
    } catch (commentError) {
      setCommentsError(commentError instanceof Error ? commentError.message : "Unable to add comment.");
    }
  };

  const resolveComment = async (comment: DesignComment) => {
    if (!designId) return;
    try {
      await commentRequest(`/api/shared-designs/${designId}/comments`, { method: "PATCH", body: JSON.stringify({ commentId: comment.id, resolved: !comment.resolved }) });
      setComments((current) => current.map((item) => item.id === comment.id ? { ...item, resolved: !comment.resolved } : item));
    } catch (commentError) {
      setCommentsError(commentError instanceof Error ? commentError.message : "Unable to update comment.");
    }
  };

  const deleteComment = async (comment: DesignComment) => {
    if (!designId) return;
    try {
      await commentRequest(`/api/shared-designs/${designId}/comments?commentId=${encodeURIComponent(comment.id)}`, { method: "DELETE" });
      setComments((current) => current.filter((item) => item.id !== comment.id && item.parentId !== comment.id));
    } catch (commentError) {
      setCommentsError(commentError instanceof Error ? commentError.message : "Unable to delete comment.");
    }
  };

  useEffect(() => {
    if (!design || !canvasRef.current) return;

    let cancelled = false;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: design.width,
      height: design.height,
      selection: false,
      renderOnAddRemove: true,
    });

    fabricRef.current = canvas;

    const page = design.pages?.find((p) => p.id === design.pages[0]?.id) || design.pages?.[0];
    if (page?.json) {
      try {
        const json =
          typeof page.json === "string"
            ? JSON.parse(page.json)
            : page.json;
        canvas.loadFromJSON(json).then(() => {
          if (cancelled) return;
          canvas.requestRenderAll();
          const container = canvasRef.current?.parentElement;
          if (container) {
            const maxWidth = container.clientWidth - 40;
            const scale = Math.min(maxWidth / design.width, 1);
            canvas.setZoom(scale);
            canvas.setDimensions({
              width: design.width * scale,
              height: design.height * scale,
            });
            canvas.requestRenderAll();
          }
        });
      } catch {
        // JSON parse error — design won't render but no setState needed
      }
    }

    return () => {
      cancelled = true;
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [design]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const dataURL = fabricRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    const link = document.createElement("a");
    link.download = `${design?.title || "design"}.png`;
    link.href = dataURL;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={32} />
          <p className="text-slate-500">Loading design...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{error}</h1>
          <p className="text-slate-500 mb-6">
            {error === "This design is private"
              ? "The owner hasn't made this design public yet."
              : "The design you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <ArrowLeft size={18} />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="font-semibold text-slate-900">{design?.title}</h1>
              <p className="text-xs text-slate-500">
                {design?.width} × {design?.height}px · Public
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && <Link href={`/editor/${designId}`} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"><ExternalLink size={16} />Edit</Link>}
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex items-center justify-center p-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
        <section className="mx-auto mb-10 w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Comments</h2>
            <span className="text-xs text-slate-400">{comments.length}</span>
          </div>
          {commentsError && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{commentsError}</p>}
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {comments.length === 0 ? <p className="py-4 text-sm text-slate-400">No comments yet.</p> : comments.filter((comment) => !comment.parentId).map((comment) => (
              <div key={comment.id} className={`rounded-lg border p-3 ${comment.resolved ? "border-emerald-100 bg-emerald-50/40" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-500">{comment.authorEmail}</p><p className={`mt-1 text-sm text-slate-800 ${comment.resolved ? "line-through opacity-60" : ""}`}>{comment.text}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => setReplyTo(comment.id)} className="px-2 text-xs font-medium text-indigo-600">Reply</button>{auth.currentUser?.uid === comment.authorId && <button type="button" onClick={() => void deleteComment(comment)} className="p-1 text-slate-400 hover:text-red-600" aria-label="Delete comment"><Trash2 size={14} /></button>}<button type="button" onClick={() => void resolveComment(comment)} className="p-1 text-slate-400 hover:text-emerald-600" aria-label="Resolve comment"><Check size={14} /></button></div></div>
                {comments.filter((reply) => reply.parentId === comment.id).map((reply) => <div key={reply.id} className="ml-5 mt-3 border-l-2 border-indigo-100 pl-3"><p className="text-xs font-medium text-slate-500">{reply.authorEmail}</p><p className="mt-1 text-sm text-slate-700">{reply.text}</p></div>)}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-end gap-2"><div className="min-w-0 flex-1">{replyTo && <button type="button" onClick={() => setReplyTo(null)} className="mb-1 text-xs text-slate-500">Cancel reply</button>}<textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder={replyTo ? "Write a reply..." : "Add a comment..."} maxLength={1000} rows={2} className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500" /></div><button type="button" onClick={() => void addComment()} disabled={!commentText.trim()} className="rounded-lg bg-indigo-600 p-3 text-white disabled:opacity-40" aria-label="Add comment"><Send size={16} /></button></div>
        </section>
      </div>
    </div>
  );
}
