"use client";

import { useCallback, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";
import toast from "react-hot-toast";
import { ensureUntaintedImage } from "@/lib/image-upload";
import { Sparkles, X } from "lucide-react";

/* =========================================================
   FILTER PRESETS
   ========================================================= */

interface FilterPreset {
  name: string;
  thumbnail: string;
  apply: (obj: fabric.FabricImage, canvas: fabric.Canvas) => void;
}

/* Presets replace the previous look but never touch adjustment sliders
   (filters tagged __adjust are owned by AdjustmentsPanel). */
function clearFilters(obj: fabric.FabricImage) {
  const existing = ((obj as unknown as { filters?: any[] }).filters ?? []) as any[];
  (obj as unknown as { filters: any[] }).filters = existing.filter(
    (f) => f?.__adjust === true
  );
}

function addFilter(obj: fabric.FabricImage, filter: any) {
  if (!(obj as any).filters) (obj as any).filters = [];
  (obj as any).filters.push(filter);
}

function applyAll(obj: fabric.FabricImage, canvas: fabric.Canvas) {
  obj.applyFilters();
  canvas.requestRenderAll();
}

const filterPresets: FilterPreset[] = [
  {
    name: "Original",
    thumbnail: "🔄",
    apply: (obj, canvas) => { clearFilters(obj); applyAll(obj, canvas); },
  },
  {
    name: "Grayscale",
    thumbnail: "⬛",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Grayscale()); applyAll(obj, canvas); },
  },
  {
    name: "Sepia",
    thumbnail: "🟤",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Sepia()); applyAll(obj, canvas); },
  },
  {
    name: "Black & White",
    thumbnail: "⬜",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Grayscale()); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.3 })); applyAll(obj, canvas); },
  },
  {
    name: "Invert",
    thumbnail: "🔄",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Invert()); applyAll(obj, canvas); },
  },
  {
    name: "Vintage",
    thumbnail: "📷",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Sepia()); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.05 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: -0.1 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.3 })); applyAll(obj, canvas); },
  },
  {
    name: "Warm",
    thumbnail: "🌡️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.05 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.15 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.15 })); applyAll(obj, canvas); },
  },
  {
    name: "Cool",
    thumbnail: "❄️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.03 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.15 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.1 })); applyAll(obj, canvas); },
  },
  {
    name: "Dramatic",
    thumbnail: "🎭",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.4 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.2 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: -0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Fade",
    thumbnail: "🌫️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.1 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: -0.2 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.4 })); applyAll(obj, canvas); },
  },
  {
    name: "Vivid",
    thumbnail: "🌈",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.6 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.15 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.03 })); applyAll(obj, canvas); },
  },
  {
    name: "Noir",
    thumbnail: "🖤",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Grayscale()); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.5 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: -0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Retro",
    thumbnail: "📼",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Sepia()); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.1 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.2 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.08 })); applyAll(obj, canvas); },
  },
  {
    name: "Dreamy",
    thumbnail: "💭",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.12 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: -0.15 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.2 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Polaroid",
    thumbnail: "📸",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.06 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.1 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.3 })); addFilter(obj, new (fabric.filters as any).Sepia()); applyAll(obj, canvas); },
  },
  {
    name: "Sunset",
    thumbnail: "🌅",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.25 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.4 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Forest",
    thumbnail: "🌲",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.2 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.3 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.02 })); applyAll(obj, canvas); },
  },
  {
    name: "Ocean",
    thumbnail: "🌊",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.4 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.2 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.04 })); applyAll(obj, canvas); },
  },
  {
    name: "Rose",
    thumbnail: "🌹",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.5 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.25 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.06 })); applyAll(obj, canvas); },
  },
  {
    name: "Night",
    thumbnail: "🌙",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: -0.1 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.2 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.3 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.3 })); applyAll(obj, canvas); },
  },
  {
    name: "Golden Hour",
    thumbnail: "✨",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.1 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.2 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.35 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Matte",
    thumbnail: "🖼️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.08 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: -0.15 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.15 })); applyAll(obj, canvas); },
  },
  {
    name: "Cinema",
    thumbnail: "🎬",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.35 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.1 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: -0.03 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Slate",
    thumbnail: "🪨",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Grayscale()); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.05 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.1 })); applyAll(obj, canvas); },
  },
  {
    name: "Blush",
    thumbnail: "💗",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.4 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.1 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.15 })); applyAll(obj, canvas); },
  },
  {
    name: "Teal & Orange",
    thumbnail: "🟠",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.12 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.4 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.15 })); applyAll(obj, canvas); },
  },
  {
    name: "Cross Process",
    thumbnail: "🧪",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.35 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.5 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.2 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Faded Film",
    thumbnail: "🎞️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.12 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: -0.25 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.5 })); addFilter(obj, new (fabric.filters as any).Sepia()); applyAll(obj, canvas); },
  },
  {
    name: "Pop Art",
    thumbnail: "🎨",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.8 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.3 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Silvertone",
    thumbnail: "🥈",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Grayscale()); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.08 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.15 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Lomo",
    thumbnail: "📷",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.3 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.3 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: -0.03 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.08 })); applyAll(obj, canvas); },
  },
  {
    name: "Toy Camera",
    thumbnail: "🧸",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.07 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.2 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.3 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.15 })); applyAll(obj, canvas); },
  },
  {
    name: "Chrome",
    thumbnail: "⚙️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.04 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.25 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: -0.1 })); applyAll(obj, canvas); },
  },
  {
    name: "Clarendon",
    thumbnail: "🌅",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.3 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.35 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.03 })); applyAll(obj, canvas); },
  },
  {
    name: "Gingham",
    thumbnail: "🌫️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.1 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: -0.1 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.05 })); applyAll(obj, canvas); },
  },
  {
    name: "Hudson",
    thumbnail: "🏙️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.06 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.15 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.1 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.15 })); applyAll(obj, canvas); },
  },
  {
    name: "Inkwell",
    thumbnail: "🖋️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Grayscale()); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.2 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: -0.03 })); applyAll(obj, canvas); },
  },
  {
    name: "Lo-Fi",
    thumbnail: "📼",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.35 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.2 })); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.04 })); applyAll(obj, canvas); },
  },
  {
    name: "Nashville",
    thumbnail: "🎸",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Sepia()); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.1 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.2 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.2 })); applyAll(obj, canvas); },
  },
  {
    name: "Perpetua",
    thumbnail: "♾️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.06 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.15 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.08 })); applyAll(obj, canvas); },
  },
  {
    name: "Toaster",
    thumbnail: "🍞",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: -0.05 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.25 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.3 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.3 })); applyAll(obj, canvas); },
  },
  {
    name: "Walden",
    thumbnail: "🍃",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.08 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: -0.25 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.2 })); applyAll(obj, canvas); },
  },
  {
    name: "Valencia",
    thumbnail: "🏛️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Sepia()); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.08 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.1 })); applyAll(obj, canvas); },
  },
  {
    name: "X-Pro II",
    thumbnail: "📸",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Brightness({ brightness: 0.05 })); addFilter(obj, new (fabric.filters as any).Contrast({ contrast: 0.2 })); addFilter(obj, new (fabric.filters as any).Saturation({ saturation: 0.3 })); addFilter(obj, new (fabric.filters as any).HueRotation({ rotation: 0.1 })); applyAll(obj, canvas); },
  },
  {
    name: "Blur",
    thumbnail: "🔵",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Blur({ blur: 0.15 })); applyAll(obj, canvas); },
  },
  {
    name: "Sharpen",
    thumbnail: "🔍",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Convolute({ matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0] })); applyAll(obj, canvas); },
  },
  {
    name: "Emboss",
    thumbnail: "🏔️",
    apply: (obj, canvas) => { clearFilters(obj); addFilter(obj, new (fabric.filters as any).Convolute({ matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1] })); applyAll(obj, canvas); },
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

export default function FiltersPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const activeObject = useEditorStore((s) => s.activeObject);
  const [activeFilter, setActiveFilter] = useState<string>("Original");
  const [previewFilter, setPreviewFilter] = useState<string | null>(null);

  const isImage = activeObject?.type === "image";

  const handleApplyFilter = useCallback(
    async (preset: FilterPreset) => {
      if (!canvas || !activeObject || activeObject.type !== "image") return;
      const obj = activeObject as fabric.FabricImage;
      await ensureUntaintedImage(obj);
      try {
        preset.apply(obj, canvas);
      } catch (error) {
        console.error("Filter failed, retrying after CORS reload:", error);
        try {
          // Taint can survive edge cases (cached textures from earlier
          // elements) — hard-reload the source and retry exactly once
          const ok = await ensureUntaintedImage(obj, true);
          if (!ok) throw new Error("source blocks cross-origin load");
          preset.apply(obj, canvas);
        } catch (retryError) {
          console.error("Filter retry failed:", retryError);
          toast.error("This image blocks filters. Re-upload it to use them.");
          return;
        }
      }
      setActiveFilter(preset.name);
      saveHistory();
    },
    [canvas, activeObject, saveHistory]
  );

  if (!isImage) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <Sparkles size={48} className="mb-3 text-slate-300" />
        <h3 className="text-sm font-semibold text-slate-600">No Image Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Select an image on the canvas to apply filters and effects
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Preview Bar */}
      {previewFilter && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 border-b border-indigo-100">
          <Sparkles size={14} className="text-indigo-500" />
          <span className="text-xs font-medium text-indigo-700">
            Preview: {previewFilter}
          </span>
          <button
            onClick={() => setPreviewFilter(null)}
            className="ml-auto text-indigo-400 hover:text-indigo-600"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Active Filter */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="text-[11px] font-medium text-slate-500 mb-1">
          Active: <span className="text-indigo-600">{activeFilter}</span>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          {filterPresets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyFilter(preset)}
              onMouseEnter={() => setPreviewFilter(preset.name)}
              onMouseLeave={() => setPreviewFilter(null)}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition active:scale-95 ${
                activeFilter === preset.name
                  ? "bg-indigo-100 border-2 border-indigo-400 text-indigo-700"
                  : "border-2 border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:shadow-sm"
              }`}
            >
              <span className="text-lg">{preset.thumbnail}</span>
              <span className="text-[10px] font-medium leading-tight text-center">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
