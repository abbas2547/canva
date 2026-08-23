"use client";

import {
  LayoutTemplate,
  Upload,
  Type,
  Shapes,
  Image,
  Frame,
  Smile,
  Palette,
  Layers3,
  Settings2,
  Sparkles,
} from "lucide-react";

import { useEditorStore } from "@/store/editorStore";

const tools = [
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
    color: "text-violet-500",
    bg: "bg-violet-50",
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: Upload,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    id: "text",
    label: "Text",
    icon: Type,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    id: "elements",
    label: "Elements",
    icon: Shapes,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    id: "pexels",
    label: "Pexels",
    icon: Image,
    color: "text-cyan-500",
    bg: "bg-cyan-50",
  },
  {
    id: "frames",
    label: "Frames",
    icon: Frame,
    color: "text-pink-500",
    bg: "bg-pink-50",
  },
  {
    id: "stickers",
    label: "Stickers",
    icon: Smile,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    id: "background",
    label: "Background",
    icon: Palette,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    id: "layers",
    label: "Layers",
    icon: Layers3,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
];

export default function EditorSidebar() {
  const activeTool = useEditorStore(
    (state) => state.activeTool
  );

  const setActiveTool = useEditorStore(
    (state) => state.setActiveTool
  );

  return (
    <div className="flex h-full flex-col bg-white">
      {/* TOOLS */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-none">
        <div className="flex flex-col items-center gap-0.5 px-1.5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const active = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveTool(tool.id)}
                className={`
                  group relative flex w-full flex-col items-center gap-1 rounded-xl py-2.5 transition-all duration-200
                  ${
                    active
                      ? `${tool.bg} ${tool.color} shadow-sm`
                      : "text-slate-400 active:bg-slate-50 lg:hover:bg-slate-50 lg:hover:text-slate-700"
                  }
                `}
              >
                {/* Active indicator */}
                {active && (
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-indigo-500" />
                )}
                <Icon
                  size={20}
                  strokeWidth={active ? 2.2 : 1.6}
                  className="transition-all duration-200"
                />
                <span className="text-[10px] font-medium leading-none">
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SETTINGS */}
      <div className="border-t border-slate-100 p-2">
        <button
          type="button"
          onClick={() => setActiveTool("settings")}
          className={`
            group relative flex w-full flex-col items-center gap-1 rounded-xl py-2.5 transition-all duration-200
            ${
              activeTool === "settings"
                ? "bg-slate-100 text-slate-700 shadow-sm"
                : "text-slate-400 active:bg-slate-50 lg:hover:bg-slate-50 lg:hover:text-slate-700"
            }
          `}
        >
          {activeTool === "settings" && (
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-indigo-500" />
          )}
          <Settings2 size={20} strokeWidth={activeTool === "settings" ? 2.2 : 1.6} />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
