// components/editor/EditorNavbar.tsx
"use client";

import { useEditorStore } from "@/store/editorStore";
import { Undo2, Redo2, Download, ZoomIn, ZoomOut } from "lucide-react";

export default function EditorNavbar() {
  const { undo, redo, zoom, setZoom, history, historyIndex } = useEditorStore();

  return (
    <header className="h-14 w-full bg-[#0e0e10] border-b border-white/10 px-4 flex items-center justify-between select-none z-50">
      {/* Brand Section */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-purple-600/20">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <span className="text-sm font-semibold tracking-wide text-white">
          Studio <span className="text-xs font-normal text-zinc-500">v1.0</span>
        </span>
      </div>

      {/* History Control Centers */}
      <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-lg border border-white/5">
        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Right Actions & Zoom Panel */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-zinc-900/60 px-2 py-1 rounded-lg border border-white/5 text-zinc-400 text-xs">
          <button 
            onClick={() => setZoom(zoom - 0.1)}
            className="hover:text-white transition"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-12 text-center font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => setZoom(zoom + 0.1)}
            className="hover:text-white transition"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <button className="h-9 px-4 bg-white hover:bg-zinc-200 text-black font-semibold rounded-lg text-xs transition flex items-center gap-2 shadow-lg shadow-white/5">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </header>
  );
}