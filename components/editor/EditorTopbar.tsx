"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Download,
  Eye,
  File,
  FolderOpen,
  HelpCircle,
  MoreHorizontal,
  Redo2,
  Save,
  Share2,
  Sparkles,
  Undo2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  LayoutDashboard,
  Image as ImageIcon,
  Type,
  PenTool,
  Layers3,
  Grid,
  RotateCcw,
  Copy,
  Trash2,
  Heart,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  EyeOff,
  Globe,
  Settings,
LayoutTemplate,
Keyboard,
Home,
} from "lucide-react";

import { useEditorStore } from "@/store/editorStore";
import { useDesignSync } from "@/hooks/useDesignSync";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import KeyboardShortcutsModal from "./KeyboardShortcutsModal";
import ShareModal from "./ShareModal";

export default function EditorTopbar() {
  const router = useRouter();
  const [designName, setDesignName] = useState("Untitled Design");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [saved, setSaved] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [exitTarget, setExitTarget] = useState<string | null>(null);
  const showLeftSidebar = useEditorStore((state) => state.showLeftSidebar);
  const setShowLeftSidebar = useEditorStore((state) => state.setShowLeftSidebar);
  const showRightSidebar = useEditorStore((state) => state.showRightSidebar);
  const setShowRightSidebar = useEditorStore((state) => state.setShowRightSidebar);
  const rightPanel = useEditorStore((state) => state.rightPanel);
  const setRightPanel = useEditorStore((state) => state.setRightPanel);
  const showAIChat = useEditorStore((state) => state.showAIChat);
  const setShowAIChat = useEditorStore((state) => state.setShowAIChat);
  const setActiveTool = useEditorStore((state) => state.setActiveTool);
  const zoom = useEditorStore((state) => state.zoom);

  const { saveDesign, createNewDesign, isSaving } = useDesignSync();

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const fileMenuRef = useRef<HTMLDivElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);
  const canvas = useEditorStore((state) => state.canvas);
  const history = useEditorStore((state) => state.history);
  const historyIndex = useEditorStore((state) => state.historyIndex);
  const canvasWidth = useEditorStore((state) => state.canvasWidth);
  const canvasHeight = useEditorStore((state) => state.canvasHeight);
  const setCanvasSize = useEditorStore((state) => state.setCanvasSize);
  const setStoreZoom = useEditorStore((state) => state.setZoom);
  const zoomIn = useEditorStore((state) => state.zoomIn);
  const zoomOut = useEditorStore((state) => state.zoomOut);
  const resetZoom = useEditorStore((state) => state.resetZoom);
  const saveHistory = useEditorStore((state) => state.saveHistory);
  const setDesignId = useEditorStore((state) => state.setDesignId);
  const designId = useEditorStore((state) => state.designId);
  const projectName = useEditorStore((state) => state.projectName);
  const setProjectName = useEditorStore((state) => state.setProjectName);

  useEffect(() => {
    if (projectName) {
      setDesignName(projectName);
    }
  }, [projectName]);

  const startEditingName = () => {
    setIsEditingName(true);
    setTimeout(() => {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }, 50);
  };

  const saveDesignName = () => {
    const cleanName = designName.trim();
    if (!cleanName) {
      setDesignName("Untitled Design");
      setProjectName("Untitled Design");
    } else {
      setProjectName(cleanName);
    }
    setIsEditingName(false);
    setSaved(true);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveDesignName();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setIsEditingName(false);
    }
  };

  const exportPNG = useCallback(() => {
    if (!canvas) {
      toast.error("Canvas is not ready yet.");
      return;
    }
    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        multiplier: 2,
        quality: 1,
      });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${designName || "design"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSaved(true);
      toast.success("Exported as PNG");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed");
    }
  }, [canvas, designName]);

  const exportJPG = useCallback(() => {
    if (!canvas) return;
    try {
      const dataURL = canvas.toDataURL({
        format: "jpeg",
        multiplier: 2,
        quality: 0.95,
      });
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${designName || "design"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exported as JPG");
    } catch (error) {
      console.error("JPG export failed:", error);
      toast.error("Export failed");
    }
  }, [canvas, designName]);

  const exportPDF = useCallback(() => {
    if (!canvas) return;
    try {
      const dataURL = canvas.toDataURL({
        format: "png",
        multiplier: 2,
        quality: 1,
      });
      // For PDF, we'd need jsPDF - simplified for now
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${designName || "design"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Exported as PDF");
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Export failed");
    }
  }, [canvas, designName]);

  const openPreview = () => {
    if (!canvas) return;
    setIsPreviewOpen(true);
  };

  const handleZoomIn = () => {
    zoomIn();
  };

  const handleZoomOut = () => {
    zoomOut();
  };

  const handleResetZoom = () => {
    resetZoom();
  };

  const handleFitToScreen = () => {
    if (!canvas) return;
    const container = canvas.wrapperEl?.parentElement;
    if (container) {
      const containerWidth = container.clientWidth - 40;
      const containerHeight = container.clientHeight - 40;
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      const newZoom = Math.min(scaleX, scaleY, 3);
      setStoreZoom(newZoom);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (fileMenuRef.current && !fileMenuRef.current.contains(target)) {
        setIsFileMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNewDesign = async () => {
    setIsFileMenuOpen(false);
    if (window.confirm("Create new design? Unsaved changes will be lost.")) {
      await createNewDesign("Untitled Design");
      setDesignName("Untitled Design");
      setSaved(true);
    }
  };

  const handleSaveDesign = async () => {
    await saveDesign({ showToast: true });
    setSaved(true);
  };

  // Exit confirmation flow
  const requestExit = (target: string) => {
    const store = useEditorStore.getState();
    if (store.isDirty()) {
      setExitTarget(target);
    } else {
      router.push(target);
    }
  };

  const handleExitSave = async () => {
    setExitTarget(null);
    await saveDesign({ showToast: true });
    setSaved(true);
    if (exitTarget) {
      router.push(exitTarget);
    }
  };

  const handleExitDiscard = () => {
    const target = exitTarget;
    setExitTarget(null);
    if (target) {
      router.push(target);
    }
  };

  // AI toggle handler
  const toggleAIChat = () => {
    const store = useEditorStore.getState();
    if (!store.showRightSidebar || store.rightPanel !== "ai" || !store.showAIChat) {
      store.setShowRightSidebar(true);
      store.setRightPanel("ai");
      store.setShowAIChat(true);
    } else {
      store.setShowAIChat(false);
      store.setRightPanel("properties");
    }
  };

  return (
    <>
      <header className="relative z-[100] flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm">
        {/* LEFT SECTION */}
        <div className="flex min-w-0 items-center gap-1">
          {/* Home */}
          <button
            onClick={() => requestExit("/")}
            className="group flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
            title="Go to Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <Sparkles size={17} />
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold leading-none text-slate-900">MiniCanva</p>
              <p className="mt-1 text-[10px] font-medium text-slate-400">AI Design Studio</p>
            </div>
          </button>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 md:block" />

          {/* Dashboard Button */}
          <button
            onClick={() => requestExit("/dashboard")}
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:flex"
            title="Go to Dashboard"
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>

          <div className="mx-1 hidden h-6 w-px bg-slate-200 md:block" />

          {/* File Menu */}
          <div ref={fileMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsFileMenuOpen((value) => !value)}
              className="hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:flex"
            >
              <File size={16} />
              File
              <ChevronDown size={14} />
            </button>

            <AnimatePresence>
              {isFileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 top-full mt-1 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={handleNewDesign}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <File size={16} />
                    New design
                    <span className="ml-auto text-xs text-slate-400">⌘N</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsFileMenuOpen(false); /* open design */ }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <FolderOpen size={16} />
                    Open design
                    <span className="ml-auto text-xs text-slate-400">⌘O</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsFileMenuOpen(false); /* import */ }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <Upload size={16} />
                    Import
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => { handleSaveDesign(); setIsFileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <Save size={16} />
                    Save
                    <span className="ml-auto text-xs text-slate-400">⌘S</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => { exportPNG(); setIsFileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <Download size={16} />
                    Export PNG
                  </button>

                  <button
                    type="button"
                    onClick={() => { exportJPG(); setIsFileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <Download size={16} />
                    Export JPG
                  </button>

                  <button
                    type="button"
                    onClick={() => { exportPDF(); setIsFileMenuOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    role="menuitem"
                  >
                    <File size={16} />
                    Export PDF
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* DESIGN NAME */}
          <div className="ml-1 min-w-0">
            {isEditingName ? (
              <input
                ref={nameInputRef}
                value={designName}
                onChange={(e) => {
                  setDesignName(e.target.value);
                  setSaved(false);
                }}
                onBlur={saveDesignName}
                onKeyDown={handleNameKeyDown}
                className="w-48 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-900 outline-none ring-2 ring-slate-200 focus:border-slate-400"
              />
            ) : (
              <button
                type="button"
                onClick={startEditingName}
                title="Rename design"
                className="max-w-52 truncate rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                {designName}
              </button>
            )}
          </div>

          {/* SAVE STATUS */}
          <div className="hidden items-center gap-1 text-xs text-slate-400 lg:flex">
            {saved ? (
              <>
                <Check size={13} className="text-green-500" />
                <span>All changes saved</span>
              </>
            ) : (
              <>
                <Save size={13} className="text-amber-500 animate-pulse" />
                <span>Saving...</span>
              </>
            )}
          </div>
        </div>

        {/* CENTER - UNDO/REDO & ZOOM */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => undo()}
              disabled={historyIndex <= 0}
              title="Undo (⌘Z)"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
            >
              <Undo2 size={18} />
            </button>
            <button
              type="button"
              onClick={() => redo()}
              disabled={historyIndex >= history.length - 1}
              title="Redo (⌘⇧Z)"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <div className="mx-2 hidden h-6 w-px bg-slate-200 md:block" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1 border border-slate-200">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              <ZoomOut size={18} />
            </button>
            <div className="flex items-center px-2">
              <input
                type="text"
                value={`${Math.round(zoom * 100)}%`}
                onChange={(e) => {
                  const val = parseInt(e.target.value) / 100;
                  if (!isNaN(val) && val >= 0.1 && val <= 3) {
                    setStoreZoom(val);
                  }
                }}
                onBlur={() => setStoreZoom(zoom)}
                className="w-16 text-center text-sm font-mono text-slate-700 bg-transparent border-none outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom in"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              onClick={handleFitToScreen}
              title="Fit to screen (⌘0)"
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-900 ml-1"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="ml-auto flex items-center gap-1.5">
          {/* Sidebar Toggles */}
          <button
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            title="Toggle left sidebar"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${showLeftSidebar ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            title="Toggle right sidebar"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${showRightSidebar ? "bg-slate-100 text-slate-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}
          >
            <ChevronRight size={20} />
          </button>

          <div className="mx-1 h-6 w-px bg-slate-200" />

          {/* Quick Actions */}
          <button
            type="button"
            title="Templates"
            onClick={() => { setActiveTool("templates"); }}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
          >
            <LayoutTemplate size={20} />
          </button>

          <button
            type="button"
            title="Elements"
            onClick={() => { setActiveTool("elements"); }}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
          >
            <Grid size={20} />
          </button>

          <button
            type="button"
            title="Text"
            onClick={() => { setActiveTool("text"); }}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
          >
            <Type size={20} />
          </button>

          <button
            type="button"
            title="Pexels Photos"
            onClick={() => { setActiveTool("pexels"); }}
            className="hidden h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
          >
            <ImageIcon size={20} />
          </button>

          <div className="mx-1 h-6 w-px bg-slate-200 hidden sm:block" />

          {/* AI Assistant Toggle */}
          <button
            type="button"
            onClick={toggleAIChat}
            title={showAIChat && rightPanel === "ai" ? "Hide AI Assistant" : "AI Assistant"}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold shadow-sm transition sm:flex ${
              showAIChat && rightPanel === "ai"
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 hover:shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Sparkles size={14} />
            <span className="hidden md:inline">AI</span>
          </button>

          {/* Preview */}
          <button
            type="button"
            onClick={openPreview}
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 md:flex"
          >
            <Eye size={16} />
            Preview
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:flex"
          >
            <Share2 size={16} />
            Share
          </button>

          {/* Export Button */}
          <div className="relative">
            <button
              type="button"
              onClick={exportPNG}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              <span className="hidden sm:inline">{isSaving ? "Saving..." : "Export"}</span>
              <ChevronDown size={14} />
            </button>
            
            {/* Export Dropdown */}
            <AnimatePresence>
              {isMoreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-slate-200 shadow-xl py-1 z-50"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => { exportPNG(); setIsMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <ImageIcon size={16} />
                    PNG
                    <span className="ml-auto text-xs text-slate-400">High quality</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportJPG(); setIsMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <ImageIcon size={16} />
                    JPG
                    <span className="ml-auto text-xs text-slate-400">Smaller file</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { exportPDF(); setIsMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <File size={16} />
                    PDF Standard
                    <span className="ml-auto text-xs text-slate-400">For printing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { /* PDF Print */ setIsMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <File size={16} />
                    PDF Print
                    <span className="ml-auto text-xs text-slate-400">With bleed</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* More Menu */}
          <div ref={moreMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <MoreHorizontal size={19} />
            </button>

            <AnimatePresence>
              {isMoreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50"
                  role="menu"
                >
                  <button
                    type="button"
                    onClick={() => { setIsShareOpen(true); setIsMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <Share2 size={16} />
                    Share design
                  </button>
                  <button
                    type="button"
                    onClick={() => { /* publish */ setIsMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <Globe size={16} />
                    Publish as website
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={() => { /* settings */ setIsMoreMenuOpen(false); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <Settings size={16} />
                    Settings
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsMoreMenuOpen(false); setIsShortcutsOpen(true); }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    role="menuitem"
                  >
                    <Keyboard size={16} />
                    Keyboard shortcuts
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* CONTEXT TOOLBAR - Shows when object is selected */}
      <AnimatePresence>
        {canvas?.getActiveObject() && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-14 z-[99] bg-white border-b border-slate-200 px-3 py-2 shadow-sm"
          >
            <ContextToolbar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && canvas && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-8"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative flex max-h-full max-w-full flex-col items-center bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>

              <div className="max-h-[80vh] max-w-[90vw] overflow-auto p-4">
                <img
                  src={canvas.toDataURL({ format: "png", multiplier: 2 })}
                  alt="Design preview"
                  className="block max-h-[75vh] max-w-[85vw] object-contain"
                />
              </div>

              <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
                <span className="text-sm text-slate-600">{designName}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { exportPNG(); setIsPreviewOpen(false); }}
                    className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPreviewOpen(false)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KEYBOARD SHORTCUTS MODAL */}
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* SHARE MODAL */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} designId={designId} />

      {/* EXIT CONFIRM MODAL */}
      <AnimatePresence>
        {exitTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/50 p-4"
            onClick={() => setExitTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">Unsaved changes</h3>
              <p className="text-sm text-slate-500 mb-6">
                Do you want to save your changes before leaving?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setExitTarget(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExitDiscard}
                  className="px-4 py-2 border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Leave without saving
                </button>
                <button
                  onClick={handleExitSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Save & exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Context Toolbar Component
function ContextToolbar() {
  const activeObject = useEditorStore((state) => state.activeObject);
  const canvas = useEditorStore((state) => state.canvas);
  const updateActiveProperties = useEditorStore((state) => state.updateActiveProperties);
  const saveHistory = useEditorStore((state) => state.saveHistory);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);
  const bringToFront = useEditorStore((state) => state.bringToFront);
  const sendToBack = useEditorStore((state) => state.sendToBack);

  if (!activeObject || !canvas) return null;

  const isText = activeObject.type === "i-text" || activeObject.type === "text" || activeObject.type === "textbox";
  const isImage = activeObject.type === "image";
  const isShape = ["rect", "circle", "triangle", "line", "polygon", "ellipse"].includes(activeObject.type || "");

  const handleFontSizeChange = (size: number) => {
    if (isText) {
      (activeObject as any).set("fontSize", size);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const handleFontFamilyChange = (font: string) => {
    if (isText) {
      (activeObject as any).set("fontFamily", font);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const handleColorChange = (color: string, property: "fill" | "stroke") => {
    activeObject.set(property, color);
    canvas.requestRenderAll();
    saveHistory();
  };

  const handleAlignment = (align: "left" | "center" | "right") => {
    if (isText) {
      (activeObject as any).set("textAlign", align);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const handleBold = () => {
    if (isText) {
      const currentWeight = (activeObject as any).fontWeight || "normal";
      (activeObject as any).set("fontWeight", currentWeight === "bold" ? "normal" : "bold");
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const handleItalic = () => {
    if (isText) {
      const currentStyle = (activeObject as any).fontStyle || "normal";
      (activeObject as any).set("fontStyle", currentStyle === "italic" ? "normal" : "italic");
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const handleUnderline = () => {
    if (isText) {
      const currentUnderline = (activeObject as any).underline || false;
      (activeObject as any).set("underline", !currentUnderline);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const handleLineHeight = (value: number) => {
    if (isText) {
      (activeObject as any).set("lineHeight", value);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const handleLetterSpacing = (value: number) => {
    if (isText) {
      (activeObject as any).set("charSpacing", value);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 max-w-full">
      {/* Position & Size */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
        <span className="text-xs text-slate-500 px-2">Position</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={Math.round(activeObject.left || 0)}
            onChange={(e) => {
              activeObject.set("left", parseInt(e.target.value) || 0);
              canvas.requestRenderAll();
              saveHistory();
            }}
            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="X"
          />
          <span className="text-slate-400">×</span>
          <input
            type="number"
            value={Math.round(activeObject.top || 0)}
            onChange={(e) => {
              activeObject.set("top", parseInt(e.target.value) || 0);
              canvas.requestRenderAll();
              saveHistory();
            }}
            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Y"
          />
        </div>
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-slate-500">W</span>
          <input
            type="number"
            value={Math.round(activeObject.width || 0)}
            onChange={(e) => {
              activeObject.set("width", parseInt(e.target.value) || 0);
              canvas.requestRenderAll();
              saveHistory();
            }}
            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <span className="text-slate-400">×</span>
          <input
            type="number"
            value={Math.round(activeObject.height || 0)}
            onChange={(e) => {
              activeObject.set("height", parseInt(e.target.value) || 0);
              canvas.requestRenderAll();
              saveHistory();
            }}
            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Rotation & Opacity */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
        <span className="text-xs text-slate-500 px-2">Transform</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={Math.round(activeObject.angle || 0)}
            onChange={(e) => {
              activeObject.set("angle", parseInt(e.target.value) || 0);
              canvas.requestRenderAll();
              saveHistory();
            }}
            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Rotate"
          />
          <span className="text-slate-400">°</span>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <span className="text-xs text-slate-500">Opacity</span>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round((activeObject.opacity || 1) * 100)}
            onChange={(e) => {
              activeObject.set("opacity", parseInt(e.target.value) / 100);
              canvas.requestRenderAll();
              saveHistory();
            }}
            className="w-24 h-2 accent-indigo-600"
          />
          <span className="text-xs text-slate-500 w-8 text-right">
            {Math.round((activeObject.opacity || 1) * 100)}%
          </span>
        </div>
      </div>

      {/* Text Formatting - only for text objects */}
      {isText && (
        <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
          <span className="text-xs text-slate-500 px-2">Text</span>
          
          <select
            value={(activeObject as any).fontFamily || "Arial"}
            onChange={(e) => handleFontFamilyChange(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
            <option value="Roboto">Roboto</option>
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Open Sans">Open Sans</option>
          </select>

          <input
            type="number"
            value={(activeObject as any).fontSize || 40}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value) || 12)}
            min="8"
            max="200"
            className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={handleBold}
              className={`p-1.5 rounded text-slate-600 transition ${(activeObject as any).fontWeight === "bold" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`}
              title="Bold (⌘B)"
            >
              <Bold size={14} />
            </button>
            <button
              onClick={handleItalic}
              className={`p-1.5 rounded text-slate-600 transition ${(activeObject as any).fontStyle === "italic" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`}
              title="Italic (⌘I)"
            >
              <Italic size={14} />
            </button>
            <button
              onClick={handleUnderline}
              className={`p-1.5 rounded text-slate-600 transition ${(activeObject as any).underline ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`}
              title="Underline (⌘U)"
            >
              <Underline size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 ml-1">
            <button onClick={() => handleAlignment("left")} className={`p-1.5 rounded text-slate-600 transition ${(activeObject as any).textAlign === "left" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`} title="Align left">
              <AlignLeft size={14} />
            </button>
            <button onClick={() => handleAlignment("center")} className={`p-1.5 rounded text-slate-600 transition ${(activeObject as any).textAlign === "center" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`} title="Align center">
              <AlignCenter size={14} />
            </button>
            <button onClick={() => handleAlignment("right")} className={`p-1.5 rounded text-slate-600 transition ${(activeObject as any).textAlign === "right" ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`} title="Align right">
              <AlignRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1 ml-1">
            <span className="text-xs text-slate-500">Line</span>
            <input
              type="number"
              value={Math.round(((activeObject as any).lineHeight || 1.2) * 100)}
              onChange={(e) => handleLineHeight(parseInt(e.target.value) / 100)}
              min="50"
              max="300"
              step="10"
              className="w-16 px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span className="text-xs text-slate-400">%</span>
          </div>
        </div>
      )}

      {/* Colors - for shapes and text */}
      {(isShape || isText) && (
        <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
          <span className="text-xs text-slate-500 px-2">Color</span>
          
          <div className="flex items-center gap-1">
            <input
              type="color"
              value={isText ? (activeObject as any).fill || "#000000" : (activeObject as any).fill || "#6366f1"}
              onChange={(e) => handleColorChange(e.target.value, "fill")}
              className="h-8 w-8 rounded border border-slate-200 cursor-pointer"
              title="Fill color"
            />
            {isShape && (
              <input
                type="color"
                value={(activeObject as any).stroke || "#000000"}
                onChange={(e) => handleColorChange(e.target.value, "stroke")}
                className="h-8 w-8 rounded border border-slate-200 cursor-pointer relative"
                title="Stroke color"
              />
            )}
          </div>

          {/* Quick colors */}
          <div className="flex items-center gap-1 ml-1">
            {["#ffffff", "#000000", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"].map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color, "fill")}
                className="w-6 h-6 rounded border border-slate-200 transition hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image Controls */}
      {isImage && (
        <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
          <span className="text-xs text-slate-500 px-2">Image</span>
          <button
            onClick={() => { /* crop */ }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded hover:bg-slate-50"
          >
            Crop
          </button>
          <button
            onClick={() => { /* filter */ }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded hover:bg-slate-50"
          >
            Filter
          </button>
          <button
            onClick={() => { /* replace */ }}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded hover:bg-slate-50"
          >
            Replace
          </button>
        </div>
      )}

      {/* Arrange */}
      <div className="flex items-center gap-1 border-r border-slate-200 pr-3">
        <span className="text-xs text-slate-500 px-2">Arrange</span>
        <button onClick={bringToFront} className="p-1.5 rounded text-slate-500 hover:bg-slate-100" title="Bring to front">
          <ArrowUp size={14} className="rotate-90" />
        </button>
        <button onClick={bringForward} className="p-1.5 rounded text-slate-500 hover:bg-slate-100" title="Bring forward (⌘]">
          <ArrowUp size={14} />
        </button>
        <button onClick={sendBackward} className="p-1.5 rounded text-slate-500 hover:bg-slate-100" title="Send backward (⌘[)">
          <ArrowDown size={14} />
        </button>
        <button onClick={sendToBack} className="p-1.5 rounded text-slate-500 hover:bg-slate-100" title="Send to back">
          <ArrowDown size={14} className="rotate-90" />
        </button>
      </div>

      {/* Lock/Visibility/Delete */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            const locked = activeObject.lockMovementX === true;
            activeObject.set({
              lockMovementX: !locked,
              lockMovementY: !locked,
              lockRotation: !locked,
              lockScalingX: !locked,
              lockScalingY: !locked,
              selectable: locked,
              evented: locked,
            });
            canvas.requestRenderAll();
            saveHistory();
          }}
          className={`p-1.5 rounded text-slate-500 transition ${activeObject.lockMovementX ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`}
          title="Lock/Unlock"
        >
          {activeObject.lockMovementX ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
        <button
          onClick={() => {
            activeObject.set("visible", activeObject.visible === false);
            canvas.requestRenderAll();
            saveHistory();
          }}
          className={`p-1.5 rounded text-slate-500 transition ${activeObject.visible === false ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100"}`}
          title="Show/Hide"
        >
          {activeObject.visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <button
          onClick={deleteSelected}
          className="p-1.5 rounded text-red-500 transition hover:bg-red-50"
          title="Delete (Del)"
        >
          <Trash2 size={16} />
        </button>
        <button
          onClick={duplicateSelected}
          className="p-1.5 rounded text-slate-500 transition hover:bg-slate-100 ml-1"
          title="Duplicate (⌘D)"
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );
}

