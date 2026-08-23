"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { stickerCategories, type StickerItem } from "@/data/stickers";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";

export default function StickersPanel() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const canvas = useEditorStore((s) => s.canvas);

  const filteredCategories = selectedCategory
    ? stickerCategories.filter((c) => c.id === selectedCategory)
    : stickerCategories;

  const filteredBySearch = search
    ? stickerCategories
        .map((cat) => ({
          ...cat,
          stickers: cat.stickers.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((cat) => cat.stickers.length > 0)
    : filteredCategories;

  const handleAddSticker = (sticker: StickerItem) => {
    if (!canvas) return;

    const centerX = canvas.getWidth() / 2;
    const centerY = canvas.getHeight() / 2;

    const text = new fabric.IText(sticker.emoji, {
      left: centerX - 40,
      top: centerY - 40,
      fontSize: 80,
      selectable: true,
      evented: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-slate-200">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search stickers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Category Chips */}
      {!search && (
        <div className="flex gap-1 px-3 py-2 overflow-x-auto scrollbar-none border-b border-slate-100">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              !selectedCategory
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {stickerCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.id ? null : cat.id
                )
              }
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Stickers Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredBySearch.map((category) => (
          <div key={category.id}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {category.name}
            </h3>
            <div className="grid grid-cols-6 gap-1.5">
              {category.stickers.map((sticker) => (
                <button
                  key={sticker.id}
                  onClick={() => handleAddSticker(sticker)}
                  className="flex items-center justify-center rounded-lg border border-slate-100 bg-white p-2 text-2xl transition hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm active:scale-90"
                  title={sticker.name}
                >
                  {sticker.emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
