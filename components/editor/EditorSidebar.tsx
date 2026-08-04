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
} from "lucide-react";

const tools = [
  {
    id: "templates",
    label: "Templates",
    icon: LayoutTemplate,
  },
  {
    id: "uploads",
    label: "Uploads",
    icon: Upload,
  },
  {
    id: "text",
    label: "Text",
    icon: Type,
  },
  {
    id: "elements",
    label: "Elements",
    icon: Shapes,
  },
  {
    id: "images",
    label: "Images",
    icon: Image,
  },
  {
    id: "frames",
    label: "Frames",
    icon: Frame,
  },
  {
    id: "stickers",
    label: "Stickers",
    icon: Smile,
  },
  {
    id: "background",
    label: "Background",
    icon: Palette,
  },
  {
    id: "layers",
    label: "Layers",
    icon: Layers3,
  },
];

export default function EditorSidebar() {
  return (
    <aside className="flex w-[88px] shrink-0 flex-col border-r border-slate-200 bg-white">

      <div className="flex-1 overflow-y-auto py-3">

        {tools.map((tool) => {

          const Icon = tool.icon;

          return (
            <button
              key={tool.id}
              className="group flex w-full flex-col items-center gap-1 px-2 py-3 text-slate-500 transition hover:bg-slate-50 hover:text-black"
            >

              <Icon size={21} strokeWidth={1.8} />

              <span className="text-[11px]">
                {tool.label}
              </span>

            </button>
          );

        })}

      </div>

      <div className="border-t border-slate-200 p-2">

        <button className="flex w-full flex-col items-center gap-1 py-3 text-slate-500 hover:text-black">

          <Settings2 size={20} />

          <span className="text-[11px]">
            Settings
          </span>

        </button>

      </div>

    </aside>
  );
}