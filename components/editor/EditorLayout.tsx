"use client";

import EditorSidebar from "./EditorSidebar";
import EditorTopbar from "./EditorTopbar";
import CanvasWorkspace from "./CanvasWorkspace";
import AIPanel from "./AIPanel";

export default function EditorLayout() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f5f5f7]">

      {/* TOP BAR */}

      <EditorTopbar />

      {/* MAIN AREA */}

      <div className="flex min-h-0 flex-1">

        {/* LEFT */}

        <EditorSidebar />

        {/* CENTER */}

        <main className="min-w-0 flex-1">
          <CanvasWorkspace />
        </main>

        {/* RIGHT */}

        <AIPanel />

      </div>

    </div>
  );
}