"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard, MousePointer2, Plus, Minus, Copy, Trash2, Save, Download, Share2, Bold, Italic, Underline, ArrowUp, ArrowDown, RotateCcw, Undo2, Redo2, ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["V"], description: "Select tool", category: "Tools" },
  { keys: ["T"], description: "Add text", category: "Tools" },
  { keys: ["R"], description: "Add rectangle", category: "Tools" },
  { keys: ["C"], description: "Add circle", category: "Tools" },
  { keys: ["L"], description: "Add line", category: "Tools" },
  { keys: ["⌘", "Z"], description: "Undo", category: "Edit" },
  { keys: ["⌘", "⇧", "Z"], description: "Redo", category: "Edit" },
  { keys: ["⌘", "D"], description: "Duplicate", category: "Edit" },
  { keys: ["Delete", "Backspace"], description: "Delete selected", category: "Edit" },
  { keys: ["Escape"], description: "Deselect / Close modal", category: "Edit" },
  { keys: ["⌘", "S"], description: "Save design", category: "File" },
  { keys: ["⌘", "N"], description: "New design", category: "File" },
  { keys: ["⌘", "E"], description: "Export", category: "File" },
  { keys: ["⌘", "+", "="], description: "Zoom in", category: "View" },
  { keys: ["⌘", "-"], description: "Zoom out", category: "View" },
  { keys: ["⌘", "0"], description: "Reset zoom / Fit to screen", category: "View" },
  { keys: ["⌘", "]"], description: "Bring forward", category: "Arrange" },
  { keys: ["⌘", "["], description: "Send backward", category: "Arrange" },
  { keys: ["⌘", "B"], description: "Bold", category: "Text" },
  { keys: ["⌘", "I"], description: "Italic", category: "Text" },
  { keys: ["⌘", "U"], description: "Underline", category: "Text" },
];

const categories = ["Tools", "Edit", "File", "View", "Arrange", "Text"];

export default function KeyboardShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-title"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Keyboard size={20} />
                </div>
                <h2 id="shortcuts-title" className="text-lg font-semibold text-slate-900">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close shortcuts"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Categories */}
              <div className="w-40 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
                <nav aria-label="Shortcut categories">
                  <ul className="space-y-1">
                    {categories.map((category, index) => (
                      <li key={category}>
                        <button
                          onClick={() => setActiveCategory(index)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                            activeCategory === index
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-600 hover:bg-white hover:text-slate-900"
                          }`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Shortcuts */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                  {categories.map((category, index) => (
                    <div key={category}>
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {category}
                      </h3>
                      <div className="space-y-2">
                        {shortcuts
                          .filter((s) => s.category === category)
                          .map((shortcut) => (
                            <div key={shortcut.description} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                              <span className="text-sm text-slate-700">{shortcut.description}</span>
                              <div className="flex items-center gap-1.5">
                                {shortcut.keys.map((key, i) => (
                                  <kbd key={i} className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
                                    {key}
                                  </kbd>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <p className="text-sm text-slate-500 text-center">
                Shortcuts use <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono">⌘</kbd> on Mac and <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-xs font-mono">Ctrl</kbd> on Windows
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}