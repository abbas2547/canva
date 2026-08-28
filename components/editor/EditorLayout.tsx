"use client";

import {
  LayoutTemplate,
  Upload,
  Type,
  Shapes,
  Image as ImageIcon,
  Frame,
  Smile,
  Palette,
  Layers3,
  Settings2,
  Download,
  Share2,
  Undo2,
  Redo2,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Wand2,
  SlidersHorizontal,
  Crop,
  BriefcaseBusiness,
} from "lucide-react";

import { useEditorStore } from "@/store/editorStore";
import { exportDesignDataURL } from "@/lib/export-image";
import { useEffect, useCallback, useState } from "react";

import EditorSidebar from "./EditorSidebar";
import EditorTopbar from "./EditorTopbar";
import CanvasWorkspace from "./CanvasWorkspace";
import AIPanel from "./AIPanel";
import ImagesPanel from "./panels/ImagesPanel";
import PropertyPanel from "./PropertyPanel";
import TemplatesPanel from "./panels/TemplatesPanel";
import UploadsPanel from "./panels/UploadsPanel";
import TextPanel from "./panels/TextPanel";
import ElementsPanel from "./panels/ElementsPanel";
import FramesPanel from "./panels/FramesPanel";
import StickersPanel from "./panels/StickersPanel";
import BackgroundPanel from "./panels/BackgroundPanel";
import LayersPanel from "./panels/LayersPanel";
import FiltersPanel from "./panels/FiltersPanel";
import AdjustmentsPanel from "./panels/AdjustmentsPanel";
import CropRotatePanel from "./panels/CropRotatePanel";
import { useDesignSync } from "@/hooks/useDesignSync";
import ShareModal from "./ShareModal";
import BrandKitPanel from "./BrandKitPanel";
import MagicResizePanel from "./MagicResizePanel";

/* =========================================================
   MOBILE TOOL PANEL - renders inline content (no hidden)
   ========================================================= */
function MobileToolPanel({ onClose }: { onClose: () => void }) {
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);

  const panelData: Record<string, { title: string; icon: React.ElementType; description: string }> = {
    templates: { title: "Templates", icon: LayoutTemplate, description: "Start with a ready-made design." },
    uploads: { title: "Uploads", icon: Upload, description: "Upload images to your design." },
    text: { title: "Text", icon: Type, description: "Add headings and typography." },
    elements: { title: "Elements", icon: Shapes, description: "Add shapes and design elements." },
    pexels: { title: "Pexels Photos", icon: ImageIcon, description: "Search and add photos from Pexels." },
    frames: { title: "Frames", icon: Frame, description: "Add image frames." },
    filters: { title: "Filters", icon: Wand2, description: "Apply photo filters and effects." },
    adjustments: { title: "Adjustments", icon: SlidersHorizontal, description: "Fine-tune image properties." },
    crop: { title: "Crop & Rotate", icon: Crop, description: "Crop, rotate, and flip images." },
    stickers: { title: "Stickers", icon: Smile, description: "Add decorative stickers." },
    background: { title: "Background", icon: Palette, description: "Change your canvas background." },
    layers: { title: "Layers", icon: Layers3, description: "Manage your design layers." },
    settings: { title: "Settings", icon: Settings2, description: "Configure your design." },
    brandkit: { title: "Brand Kit", icon: BriefcaseBusiness, description: "Apply your saved brand styles." },
  };

  const tools = [
    { id: "templates", label: "Templates", icon: LayoutTemplate, color: "text-violet-500", bg: "bg-violet-50" },
    { id: "uploads", label: "Uploads", icon: Upload, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "text", label: "Text", icon: Type, color: "text-emerald-500", bg: "bg-emerald-50" },
    { id: "elements", label: "Elements", icon: Shapes, color: "text-amber-500", bg: "bg-amber-50" },
    { id: "pexels", label: "Photos", icon: ImageIcon, color: "text-cyan-500", bg: "bg-cyan-50" },
    { id: "frames", label: "Frames", icon: Frame, color: "text-pink-500", bg: "bg-pink-50" },
    { id: "filters", label: "Filters", icon: Wand2, color: "text-purple-500", bg: "bg-purple-50" },
    { id: "adjustments", label: "Adjust", icon: SlidersHorizontal, color: "text-teal-500", bg: "bg-teal-50" },
    { id: "crop", label: "Crop", icon: Crop, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "stickers", label: "Stickers", icon: Smile, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "background", label: "BG", icon: Palette, color: "text-rose-500", bg: "bg-rose-50" },
    { id: "layers", label: "Layers", icon: Layers3, color: "text-indigo-500", bg: "bg-indigo-50" },
    { id: "settings", label: "Settings", icon: Settings2, color: "text-slate-500", bg: "bg-slate-50" },
    { id: "brandkit", label: "Brand Kit", icon: BriefcaseBusiness, color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  const current = panelData[activeTool] ?? panelData.templates;
  const Icon = current.icon;

  const renderPanel = () => {
    switch (activeTool) {
      case "templates": return <TemplatesPanel />;
      case "uploads": return <UploadsPanel />;
      case "text": return <TextPanel />;
      case "elements": return <ElementsPanel />;
      case "pexels": return <ImagesPanel />;
      case "frames": return <FramesPanel />;
      case "filters": return <FiltersPanel />;
      case "adjustments": return <AdjustmentsPanel />;
      case "crop": return <CropRotatePanel />;
      case "stickers": return <StickersPanel />;
      case "background": return <BackgroundPanel />;
      case "layers": return <LayersPanel />;
      case "settings": return <MagicResizePanel />;
      case "brandkit": return <BrandKitPanel />;
      default: return <TemplatesPanel />;
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Tool tabs - horizontal scrollable */}
      <div className="shrink-0 border-b border-slate-200">
        <div className="flex overflow-x-auto scrollbar-none px-2 py-2 gap-1">
          {tools.map((tool) => {
            const ToolIcon = tool.icon;
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium transition ${
                  active
                    ? `${tool.bg} ${tool.color}`
                    : "text-slate-400 active:bg-slate-100"
                }`}
              >
                <ToolIcon size={18} strokeWidth={active ? 2.2 : 1.6} />
                <span>{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-900">{current.title}</h2>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{current.description}</p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 active:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {renderPanel()}
      </div>
    </div>
  );
}

function MobileSettingsPanel() {
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const saveHistory = useEditorStore((s) => s.saveHistory);

  const presets = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "YouTube Thumbnail", width: 1280, height: 720 },
    { name: "Facebook Post", width: 1200, height: 630 },
    { name: "Twitter Post", width: 1200, height: 675 },
    { name: "Presentation 16:9", width: 1920, height: 1080 },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Canvas Size</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Width</label>
              <input
                type="number"
                value={canvasWidth}
                onChange={(e) => setCanvasSize(Number(e.target.value), canvasHeight)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Height</label>
              <input
                type="number"
                value={canvasHeight}
                onChange={(e) => setCanvasSize(canvasWidth, Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Presets</h3>
          <div className="space-y-1.5">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => { setCanvasSize(preset.width, preset.height); saveHistory(); }}
                className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-xs transition ${
                  canvasWidth === preset.width && canvasHeight === preset.height
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 active:bg-slate-50"
                }`}
              >
                <span className="font-medium">{preset.name}</span>
                <span className="font-mono text-slate-400">{preset.width}×{preset.height}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DESKTOP TOOL PANEL
   ========================================================= */
function DesktopToolPanel() {
  const activeTool = useEditorStore((state) => state.activeTool);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);

  const panelData: Record<string, { title: string; icon: React.ElementType; description: string }> = {
    templates: { title: "Templates", icon: LayoutTemplate, description: "Start with a ready-made design." },
    uploads: { title: "Uploads", icon: Upload, description: "Upload images to your design." },
    text: { title: "Text", icon: Type, description: "Add headings and typography." },
    elements: { title: "Elements", icon: Shapes, description: "Add shapes and design elements." },
    pexels: { title: "Pexels Photos", icon: ImageIcon, description: "Search and add photos from Pexels." },
    frames: { title: "Frames", icon: Frame, description: "Add image frames." },
    filters: { title: "Filters", icon: Wand2, description: "Apply photo filters and effects." },
    adjustments: { title: "Adjustments", icon: SlidersHorizontal, description: "Fine-tune image properties." },
    crop: { title: "Crop & Rotate", icon: Crop, description: "Crop, rotate, and flip images." },
    stickers: { title: "Stickers", icon: Smile, description: "Add decorative stickers." },
    background: { title: "Background", icon: Palette, description: "Change your canvas background." },
    layers: { title: "Layers", icon: Layers3, description: "Manage your design layers." },
    settings: { title: "Settings", icon: Settings2, description: "Configure your design." },
    brandkit: { title: "Brand Kit", icon: BriefcaseBusiness, description: "Apply your saved brand styles." },
  };

  const current = panelData[activeTool] ?? panelData.templates;
  const Icon = current.icon;

  const renderPanel = () => {
    switch (activeTool) {
      case "templates": return <TemplatesPanel />;
      case "uploads": return <UploadsPanel />;
      case "text": return <TextPanel />;
      case "elements": return <ElementsPanel />;
      case "pexels": return <ImagesPanel />;
      case "frames": return <FramesPanel />;
      case "filters": return <FiltersPanel />;
      case "adjustments": return <AdjustmentsPanel />;
      case "crop": return <CropRotatePanel />;
      case "stickers": return <StickersPanel />;
      case "background": return <BackgroundPanel />;
      case "layers": return <LayersPanel />;
      case "settings": return <MagicResizePanel />;
      case "brandkit": return <BrandKitPanel />;
      default: return <TemplatesPanel />;
    }
  };

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white lg:flex">
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">{current.title}</h2>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">{current.description}</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">{renderPanel()}</div>
    </aside>
  );
}

function DesktopSettingsPanel() {
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const saveHistory = useEditorStore((s) => s.saveHistory);

  const presets = [
    { name: "Instagram Post", width: 1080, height: 1080 },
    { name: "Instagram Story", width: 1080, height: 1920 },
    { name: "YouTube Thumbnail", width: 1280, height: 720 },
    { name: "YouTube Banner", width: 2560, height: 1440 },
    { name: "Facebook Post", width: 1200, height: 630 },
    { name: "Twitter Post", width: 1200, height: 675 },
    { name: "Presentation 16:9", width: 1920, height: 1080 },
    { name: "Presentation 4:3", width: 1440, height: 1080 },
    { name: "A4 Portrait", width: 794, height: 1123 },
    { name: "A4 Landscape", width: 1123, height: 794 },
    { name: "Poster", width: 800, height: 1200 },
    { name: "Business Card", width: 1050, height: 600 },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Canvas Size</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Width</label>
              <input type="number" value={canvasWidth} onChange={(e) => setCanvasSize(Number(e.target.value), canvasHeight)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Height</label>
              <input type="number" value={canvasHeight} onChange={(e) => setCanvasSize(canvasWidth, Number(e.target.value))} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Quick Presets</h3>
          <div className="space-y-1.5">
            {presets.map((preset) => (
              <button key={preset.name} onClick={() => { setCanvasSize(preset.width, preset.height); saveHistory(); }} className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition ${canvasWidth === preset.width && canvasHeight === preset.height ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                <span className="font-medium">{preset.name}</span>
                <span className="font-mono text-slate-400">{preset.width}×{preset.height}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN LAYOUT
   ========================================================= */
export default function EditorLayout({ initialDesignId }: { initialDesignId?: string }) {
  const { setDesignId } = useEditorStore();
  const showLeftSidebar = useEditorStore((state) => state.showLeftSidebar);
  const showRightSidebar = useEditorStore((state) => state.showRightSidebar);
  const setShowRightSidebar = useEditorStore((state) => state.setShowRightSidebar);
  const setShowLeftSidebar = useEditorStore((state) => state.setShowLeftSidebar);
  const rightPanel = useEditorStore((state) => state.rightPanel);
  const setRightPanel = useEditorStore((state) => state.setRightPanel);
  const showAIChat = useEditorStore((state) => state.showAIChat);
  const setShowAIChat = useEditorStore((state) => state.setShowAIChat);
  const canvas = useEditorStore((state) => state.canvas);
  const { autoSave, loadDesign, saveDesign, flushSave, isLoading, loadError } = useDesignSync();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const designId = useEditorStore((state) => state.designId);

  useEffect(() => {
    if (initialDesignId) {
      setDesignId(initialDesignId);
      loadDesign(initialDesignId);
    }
  }, [initialDesignId, setDesignId, loadDesign]);

  useEffect(() => {
    if (!canvas) return;

    const handleObjectModified = () => {
      autoSave();
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("text:changed", handleObjectModified);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("text:changed", handleObjectModified);
    };
  }, [canvas, autoSave]);

  // Safety net: if anything is still dirty, persist it within 10s no matter what
  useEffect(() => {
    const interval = setInterval(() => {
      const store = useEditorStore.getState();
      if (store.designId && store.canvas && store.isDirty()) {
        autoSave();
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Panels (filters, adjustments, background, crop…) all funnel through
  // saveHistory() — use it as a catch-all autosave trigger
  const historyIndex = useEditorStore((state) => state.historyIndex);
  useEffect(() => {
    if (!useEditorStore.getState().canvas || !useEditorStore.getState().designId) return;
    autoSave();
  }, [historyIndex, autoSave]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      void flushSave();
      const store = useEditorStore.getState();
      if (store.isDirty()) { e.preventDefault(); }
    };
    window.addEventListener("beforeunload", handler);

    // Save immediately when leaving the editor (dashboard/home navigation)
    // or when the tab goes to the background
    const onHidden = () => { if (document.visibilityState === "hidden") void flushSave(); };
    document.addEventListener("visibilitychange", onHidden);

    return () => {
      window.removeEventListener("beforeunload", handler);
      document.removeEventListener("visibilitychange", onHidden);
      void flushSave();
    };
  }, [flushSave]);

  const handleMobileExport = useCallback(() => {
    if (!canvas) return;
    try {
      const dataURL = exportDesignDataURL(canvas, { format: "png", multiplier: 2, quality: 1 });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "design.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [canvas]);

  return (
    <div className="editor-shell relative flex h-dvh w-full flex-col overflow-hidden bg-white">

      {/* TOPBAR */}
      <div className="shrink-0">
        <EditorTopbar />
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-[180] flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-lg">
            Loading design…
          </div>
        </div>
      )}

      {loadError && !isLoading && (
        <div className="absolute left-1/2 top-16 z-[180] flex -translate-x-1/2 items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 shadow-lg">
          <span>{loadError}</span>
          {initialDesignId && (
            <button
              type="button"
              onClick={() => loadDesign(initialDesignId)}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* EDITOR BODY */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* LEFT ICON SIDEBAR - desktop only */}
        {showLeftSidebar && (
          <div className="hidden w-[88px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white lg:flex">
            <EditorSidebar />
          </div>
        )}

        {/* TOOL PANEL - desktop only */}
        {showLeftSidebar && (
          <div className="hidden lg:flex">
            <DesktopToolPanel />
          </div>
        )}

        {/* CANVAS */}
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <CanvasWorkspace />
        </main>

        {/* RIGHT PANEL - desktop */}
        {showRightSidebar && (
          <aside className="hidden w-[340px] shrink-0 overflow-hidden border-l border-slate-200 bg-white lg:flex lg:flex-col">
            <div className="flex shrink-0 border-b border-slate-200">
              <button type="button" onClick={() => setRightPanel("properties")} className={`flex-1 py-2.5 text-xs font-semibold transition ${rightPanel === "properties" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:text-slate-700"}`}>
                Properties
              </button>
              <button type="button" onClick={() => { setRightPanel("ai"); setShowAIChat(true); }} className={`flex-1 py-2.5 text-xs font-semibold transition ${rightPanel === "ai" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 hover:text-slate-700"}`}>
                AI Assistant
              </button>
            </div>
            {rightPanel === "ai" && showAIChat ? <AIPanel /> : <PropertyPanel />}
          </aside>
        )}
      </div>

      {/* =================================================
          MOBILE LEFT PANEL OVERLAY - full height slide-in
      ================================================= */}
      {showLeftSidebar && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLeftSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[360px] bg-white shadow-2xl flex flex-col animate-slide-in-left">
            <MobileToolPanel onClose={() => setShowLeftSidebar(false)} />
          </div>
        </div>
      )}

      {/* =================================================
          MOBILE RIGHT PANEL OVERLAY
      ================================================= */}
      {showRightSidebar && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRightSidebar(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-[380px] bg-white shadow-2xl flex flex-col animate-slide-in-right">
            <div className="flex shrink-0 items-center border-b border-slate-200">
              <button type="button" onClick={() => setRightPanel("properties")} className={`flex-1 py-3 text-xs font-semibold transition ${rightPanel === "properties" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 active:bg-slate-50"}`}>
                Properties
              </button>
              <button type="button" onClick={() => { setRightPanel("ai"); setShowAIChat(true); }} className={`flex-1 py-3 text-xs font-semibold transition ${rightPanel === "ai" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50" : "text-slate-500 active:bg-slate-50"}`}>
                AI Assistant
              </button>
              <button onClick={() => setShowRightSidebar(false)} className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 active:bg-slate-100">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {rightPanel === "ai" && showAIChat ? <AIPanel /> : <PropertyPanel />}
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MOBILE BOTTOM TOOLBAR - Canva-style
      ================================================= */}
      <div className="shrink-0 border-t border-slate-200 bg-white lg:hidden safe-area-bottom">
        <div className="flex items-center justify-between px-1 py-1">
          {/* Left: Back + Tools */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => useEditorStore.getState().setShowLeftSidebar(true)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-600 active:bg-slate-100 transition"
            >
              <LayoutTemplate size={20} />
              <span className="text-[9px] font-medium">Tools</span>
            </button>
          </div>

          {/* Center: Quick actions */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => useEditorStore.getState().undo()}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-slate-600 active:bg-slate-100 transition"
            >
              <Undo2 size={18} />
              <span className="text-[9px] font-medium">Undo</span>
            </button>
            <button
              type="button"
              onClick={() => useEditorStore.getState().redo()}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-slate-600 active:bg-slate-100 transition"
            >
              <Redo2 size={18} />
              <span className="text-[9px] font-medium">Redo</span>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => useEditorStore.getState().setShowRightSidebar(!showRightSidebar)}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-slate-600 active:bg-slate-100 transition"
            >
              <Settings2 size={18} />
              <span className="text-[9px] font-medium">Props</span>
            </button>
            <button
              type="button"
              onClick={handleMobileExport}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-indigo-600 active:bg-indigo-50 transition"
            >
              <Download size={18} />
              <span className="text-[9px] font-medium">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* SHARE MODAL */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} designId={designId} />
    </div>
  );
}
