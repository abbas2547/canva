"use client";

import { useState } from "react";
import { Copy, Maximize2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useEditorStore } from "@/store/editorStore";
import { useDesignSync } from "@/hooks/useDesignSync";
import { duplicateDesign, updateDesign } from "@/lib/db-operations";
import { MAGIC_RESIZE_PRESETS, resizeCanvasObjects } from "@/lib/magic-resize";
import { useRouter } from "next/navigation";

type ResizeMode = "current" | "duplicate";

export default function MagicResizePanel() {
  const { user, subscriptionPlan } = useAuth();
  const router = useRouter();
  const { flushSave } = useDesignSync();
  const canvasWidth = useEditorStore((state) => state.canvasWidth);
  const canvasHeight = useEditorStore((state) => state.canvasHeight);
  const [width, setWidth] = useState(canvasWidth);
  const [height, setHeight] = useState(canvasHeight);
  const [mode, setMode] = useState<ResizeMode>("duplicate");
  const [working, setWorking] = useState(false);

  const resize = async () => {
    if (!user) {
      toast.error("Please sign in to use Magic Resize.");
      return;
    }
    if (subscriptionPlan === "free") {
      toast.error("Magic Resize is available on Pro and Business plans.");
      return;
    }
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || width > 10000 || height > 10000) {
      toast.error("Enter dimensions between 1 and 10000 pixels.");
      return;
    }
    const canvas = useEditorStore.getState().canvas;
    const designId = useEditorStore.getState().designId;
    if (!canvas || !designId) {
      toast.error("Design is not ready.");
      return;
    }
    if (width === canvasWidth && height === canvasHeight) {
      toast.error("Choose a different canvas size.");
      return;
    }

    try {
      setWorking(true);
      const token = await user.getIdToken();
      const authorization = await fetch("/api/magic-resize/authorize", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const result = (await authorization.json()) as { success?: boolean; error?: string };
      if (!authorization.ok || !result.success) throw new Error(result.error || "Magic Resize is unavailable.");

      if (mode === "duplicate") {
        flushSave();
        const duplicate = await duplicateDesign(designId, user.uid);
        resizeCanvasObjects(canvas, width, height);
        const json = JSON.stringify(canvas.toJSON());
        const pages = duplicate.pages.map((page) =>
          page.id === duplicate.activePageId ? { ...page, json } : page
        );
        await updateDesign(duplicate.id, {
          width,
          height,
          pages,
        });
        toast.success("Duplicated and resized design.");
        router.push(`/editor/${duplicate.id}`);
      } else {
        if (!window.confirm("Resize the current design? The original dimensions will be changed.")) return;
        resizeCanvasObjects(canvas, width, height);
        useEditorStore.getState().setCanvasSize(width, height);
        useEditorStore.getState().saveHistory();
        flushSave();
        toast.success("Design resized.");
      }
    } catch (error) {
      console.error("Magic Resize error:", error);
      toast.error(error instanceof Error ? error.message : "Magic Resize failed.");
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-3">
      <div className="mb-4 flex items-center gap-2">
        <Maximize2 size={16} className="text-indigo-600" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Magic Resize</h3>
          <p className="text-[11px] text-slate-500">Keep every element editable.</p>
        </div>
      </div>
      <div className="space-y-2">
        {MAGIC_RESIZE_PRESETS.map((preset) => (
          <button key={preset.name} type="button" onClick={() => { setWidth(preset.width); setHeight(preset.height); }} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-xs transition ${width === preset.width && height === preset.height ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
            <span className="font-medium">{preset.name}</span>
            <span className="font-mono text-slate-400">{preset.width}×{preset.height}</span>
          </button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="text-[11px] text-slate-500">Width<input type="number" min="1" max="10000" value={width} onChange={(event) => setWidth(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500" /></label>
        <label className="text-[11px] text-slate-500">Height<input type="number" min="1" max="10000" value={height} onChange={(event) => setHeight(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500" /></label>
      </div>
      <div className="mt-4 space-y-2">
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-800"><input type="radio" checked={mode === "duplicate"} onChange={() => setMode("duplicate")} className="mt-0.5" /><span><strong className="block">Duplicate and resize</strong>Keep the original design unchanged.</span><Copy size={15} className="ml-auto shrink-0" /></label>
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700"><input type="radio" checked={mode === "current"} onChange={() => setMode("current")} className="mt-0.5" /><span><strong className="block">Resize current design</strong>Change this design after confirmation.</span><RefreshCw size={15} className="ml-auto shrink-0 text-slate-400" /></label>
      </div>
      <button type="button" onClick={() => void resize()} disabled={working || subscriptionPlan === "free"} className="mt-4 w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{working ? "Resizing..." : "Resize design"}</button>
      {subscriptionPlan === "free" && <p className="mt-2 text-center text-[11px] text-slate-500">Upgrade to Pro or Business to use Magic Resize.</p>}
    </div>
  );
}
