"use client";

import { useState } from "react";
import { Palette, Sparkles, Moon } from "lucide-react";
import { backgroundCategories, type BackgroundItem } from "@/data/backgrounds";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";

export default function BackgroundPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const canvas = useEditorStore((s) => s.canvas);
  const saveHistory = useEditorStore((s) => s.saveHistory);

  const categories = selectedCategory
    ? backgroundCategories.filter((c) => c.id === selectedCategory)
    : backgroundCategories;

  const handleSetBackground = (item: BackgroundItem) => {
    if (!canvas) return;

    if (item.type === "solid") {
      canvas.backgroundColor = item.value;
    } else if (item.type === "gradient") {
      canvas.backgroundColor = createGradient(item.value, canvas);
    }

    canvas.requestRenderAll();
    saveHistory();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-slate-100">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            !selectedCategory
              ? "bg-indigo-100 text-indigo-700"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Palette size={12} />
          All
        </button>
        {backgroundCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === cat.id ? null : cat.id
              )
            }
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedCategory === cat.id
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {cat.id === "solid-colors" && <Palette size={12} />}
            {cat.id === "gradients" && <Sparkles size={12} />}
            {cat.id === "dark-backgrounds" && <Moon size={12} />}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Backgrounds Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {category.name}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {category.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSetBackground(item)}
                  className="group relative aspect-square rounded-xl border-2 border-slate-200 overflow-hidden transition hover:border-indigo-400 hover:shadow-md active:scale-95"
                  title={item.name}
                  style={{
                    background:
                      item.type === "solid"
                        ? item.value
                        : item.value,
                  }}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-end">
                    <span className="w-full text-[9px] font-medium text-white bg-black/50 backdrop-blur-sm px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition">
                      {item.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Color Picker */}
      <div className="p-3 border-t border-slate-200">
        <p className="text-xs font-medium text-slate-500 mb-2">Custom Color</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            onChange={(e) => {
              if (canvas) {
                canvas.backgroundColor = e.target.value;
                canvas.requestRenderAll();
                saveHistory();
              }
            }}
            className="h-9 w-9 rounded-lg border border-slate-200 cursor-pointer"
          />
          <input
            type="text"
            placeholder="#ffffff"
            onKeyDown={(e) => {
              if (e.key === "Enter" && canvas) {
                const val = (e.target as HTMLInputElement).value;
                if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                  canvas.backgroundColor = val;
                  canvas.requestRenderAll();
                  saveHistory();
                }
              }
            }}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>
    </div>
  );
}

function createGradient(value: string, canvas: fabric.Canvas) {
  const colors = [...value.matchAll(/#[0-9a-f]{6}/gi)].map((match) => match[0]);
  const stops = colors.length >= 2 ? colors : ["#ffffff", "#e2e8f0"];
  return new fabric.Gradient({
    type: "linear",
    coords: {
      x1: 0,
      y1: 0,
      x2: canvas.getWidth(),
      y2: canvas.getHeight(),
    },
    colorStops: stops.map((color, index) => ({
      offset: index / (stops.length - 1),
      color,
    })),
  });
}
