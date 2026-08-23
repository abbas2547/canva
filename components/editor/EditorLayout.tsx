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
} from "lucide-react";

import { useEditorStore } from "@/store/editorStore";
import { useEffect, useCallback } from "react";

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
import { useDesignSync } from "@/hooks/useDesignSync";

function ToolPanel() {
  const activeTool = useEditorStore(
    (state) => state.activeTool
  );

  const setActiveTool = useEditorStore(
    (state) => state.setActiveTool
  );

  const panelData: Record<
    string,
    {
      title: string;
      icon: React.ElementType;
      description: string;
    }
  > = {
    templates: {
      title: "Templates",
      icon: LayoutTemplate,
      description: "Start with a ready-made design.",
    },
    uploads: {
      title: "Uploads",
      icon: Upload,
      description: "Upload images to your design.",
    },
    text: {
      title: "Text",
      icon: Type,
      description: "Add headings and typography.",
    },
    elements: {
      title: "Elements",
      icon: Shapes,
      description: "Add shapes and design elements.",
    },
    images: {
      title: "Pexels Photos",
      icon: ImageIcon,
      description: "Search and add photos from Pexels.",
    },
    frames: {
      title: "Frames",
      icon: Frame,
      description: "Add image frames.",
    },
    stickers: {
      title: "Stickers",
      icon: Smile,
      description: "Add decorative stickers.",
    },
    background: {
      title: "Background",
      icon: Palette,
      description: "Change your canvas background.",
    },
    layers: {
      title: "Layers",
      icon: Layers3,
      description: "Manage your design layers.",
    },
    settings: {
      title: "Settings",
      icon: Settings2,
      description: "Configure your design.",
    },
  };

  const current =
    panelData[activeTool] ??
    panelData.templates;

  const Icon = current.icon;

  const renderPanel = () => {
    switch (activeTool) {
      case "templates":
        return <TemplatesPanel />;
      case "uploads":
        return <UploadsPanel />;
      case "text":
        return <TextPanel />;
      case "elements":
        return <ElementsPanel />;
      case "pexels":
        return <ImagesPanel />;
      case "frames":
        return <FramesPanel />;
      case "stickers":
        return <StickersPanel />;
      case "background":
        return <BackgroundPanel />;
      case "layers":
        return <LayersPanel />;
      case "settings":
        return (
          <SettingsPanel />
        );
      default:
        return <TemplatesPanel />;
    }
  };

  return (
    <aside
      className="
        hidden
        w-[300px]
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-slate-200
        bg-white
        lg:flex
      "
    >
      {/* HEADER */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            {current.title}
          </h2>
          <p className="mt-0.5 truncate text-[11px] text-slate-500">
            {current.description}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        {renderPanel()}
      </div>
    </aside>
  );
}

function SettingsPanel() {
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
        {/* Canvas Size */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Canvas Size
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Width</label>
              <input
                type="number"
                value={canvasWidth}
                onChange={(e) =>
                  setCanvasSize(Number(e.target.value), canvasHeight)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">Height</label>
              <input
                type="number"
                value={canvasHeight}
                onChange={(e) =>
                  setCanvasSize(canvasWidth, Number(e.target.value))
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Presets */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Quick Presets
          </h3>
          <div className="space-y-1.5">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setCanvasSize(preset.width, preset.height);
                  saveHistory();
                }}
                className={`w-full flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition ${
                  canvasWidth === preset.width && canvasHeight === preset.height
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="font-medium">{preset.name}</span>
                <span className="font-mono text-slate-400">
                  {preset.width}×{preset.height}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditorLayout({ initialDesignId }: { initialDesignId?: string }) {
  const { setDesignId } = useEditorStore();
  const showLeftSidebar = useEditorStore((state) => state.showLeftSidebar);
  const showRightSidebar = useEditorStore((state) => state.showRightSidebar);
  const setShowRightSidebar = useEditorStore((state) => state.setShowRightSidebar);
  const rightPanel = useEditorStore((state) => state.rightPanel);
  const setRightPanel = useEditorStore((state) => state.setRightPanel);
  const showAIChat = useEditorStore((state) => state.showAIChat);
  const setShowAIChat = useEditorStore((state) => state.setShowAIChat);
  const canvas = useEditorStore((state) => state.canvas);
  const { autoSave, loadDesign } = useDesignSync();

  // Initialize design ID from props if provided
  useEffect(() => {
    if (initialDesignId) {
      setDesignId(initialDesignId);
      loadDesign(initialDesignId);
    }
  }, [initialDesignId, setDesignId, loadDesign]);

  // Auto-save when canvas changes
  useEffect(() => {
    if (!canvas) return;

    const handleObjectModified = () => {
      autoSave();
    };

    canvas.on("object:modified", handleObjectModified);
    canvas.on("object:added", handleObjectModified);
    canvas.on("object:removed", handleObjectModified);

    return () => {
      canvas.off("object:modified", handleObjectModified);
      canvas.off("object:added", handleObjectModified);
      canvas.off("object:removed", handleObjectModified);
    };
  }, [canvas, autoSave]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      const store = useEditorStore.getState();
      if (store.isDirty()) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">

      {/* TOPBAR */}

      <div className="shrink-0">
        <EditorTopbar />
      </div>

      {/* EDITOR */}

      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* LEFT ICON SIDEBAR - desktop only */}

        {showLeftSidebar && (
        <div
          className="
            hidden
            w-[88px]
            shrink-0
            flex-col
            overflow-hidden
            border-r
            border-slate-200
            bg-white
            lg:flex
          "
        >
          <EditorSidebar />
        </div>
        )}

        {/* TOOL PANEL - desktop only */}

        {showLeftSidebar && (
        <div className="hidden lg:flex">
          <ToolPanel />
        </div>
        )}

        {/* CANVAS */}

        <main
          className="
            min-h-0
            min-w-0
            flex-1
            overflow-hidden
          "
        >
          <CanvasWorkspace />
        </main>

        {/* AI / PROPERTIES PANEL - desktop */}

        {showRightSidebar && (
        <aside
          className="
            hidden
            w-[340px]
            shrink-0
            overflow-hidden
            border-l
            border-slate-200
            bg-white
            lg:flex
            lg:flex-col
          "
        >
          {/* Panel Toggle */}
          <div className="flex shrink-0 border-b border-slate-200">
            <button
              type="button"
              onClick={() => { setRightPanel("properties"); }}
              className={`flex-1 py-2.5 text-xs font-semibold transition ${
                rightPanel === "properties"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Properties
            </button>
            <button
              type="button"
              onClick={() => { setRightPanel("ai"); setShowAIChat(true); }}
              className={`flex-1 py-2.5 text-xs font-semibold transition ${
                rightPanel === "ai"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              AI Assistant
            </button>
          </div>
          {rightPanel === "ai" && showAIChat ? (
            <AIPanel />
          ) : (
            <PropertyPanel />
          )}
        </aside>
        )}

      </div>

      {/* MOBILE LEFT PANEL OVERLAY */}
      {showLeftSidebar && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => useEditorStore.getState().setShowLeftSidebar(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl flex flex-col">
            <ToolPanel />
          </div>
        </div>
      )}

      {/* MOBILE RIGHT PANEL OVERLAY */}
      {showRightSidebar && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => useEditorStore.getState().setShowRightSidebar(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[320px] bg-white shadow-2xl flex flex-col">
            <div className="flex shrink-0 border-b border-slate-200">
              <button
                type="button"
                onClick={() => { setRightPanel("properties"); }}
                className={`flex-1 py-2.5 text-xs font-semibold transition ${
                  rightPanel === "properties"
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Properties
              </button>
              <button
                type="button"
                onClick={() => { setRightPanel("ai"); setShowAIChat(true); }}
                className={`flex-1 py-2.5 text-xs font-semibold transition ${
                  rightPanel === "ai"
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                AI Assistant
              </button>
            </div>
            {rightPanel === "ai" && showAIChat ? (
              <AIPanel />
            ) : (
              <PropertyPanel />
            )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM TOOLBAR */}
      <div className="shrink-0 border-t border-slate-200 bg-white flex items-center justify-around py-2 px-1 lg:hidden">
        <button
          type="button"
          onClick={() => useEditorStore.getState().setShowLeftSidebar(!showLeftSidebar)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="text-[9px] font-medium">Tools</span>
        </button>
        <button
          type="button"
          onClick={() => useEditorStore.getState().undo()}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h10a5 5 0 015 5v2M3 10l5-5M3 10l5 5" /></svg>
          <span className="text-[9px] font-medium">Undo</span>
        </button>
        <button
          type="button"
          onClick={() => useEditorStore.getState().redo()}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10H11a5 5 0 00-5 5v2M21 10l-5-5M21 10l-5 5" /></svg>
          <span className="text-[9px] font-medium">Redo</span>
        </button>
        <button
          type="button"
          onClick={() => useEditorStore.getState().setShowRightSidebar(!showRightSidebar)}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          <span className="text-[9px] font-medium">Props</span>
        </button>
      </div>

    </div>
  );
}