"use client";

import { useCallback, useState, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";
import toast from "react-hot-toast";
import { ensureUntaintedImage } from "@/lib/image-upload";
import { Sun, RotateCcw, SlidersHorizontal } from "lucide-react";

/* =========================================================
   ADJUSTMENT DEFINITIONS
   ========================================================= */

interface Adjustment {
  id: string;
  label: string;
  icon: string;
  min: number;
  max: number;
  default: number;
  step: number;
  filterType: string;
  filterProps: Record<string, number>;
}

const adjustments: Adjustment[] = [
  {
    id: "brightness",
    label: "Brightness",
    icon: "☀️",
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Brightness",
    filterProps: { brightness: 0.3 },
  },
  {
    id: "exposure",
    label: "Exposure",
    icon: "🔆",
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Brightness",
    filterProps: { brightness: 0.5 },
  },
  {
    id: "contrast",
    label: "Contrast",
    icon: "◐",
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Contrast",
    filterProps: { contrast: 0.5 },
  },
  {
    id: "highlights",
    label: "Highlights",
    icon: "🌟",
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Brightness",
    filterProps: { brightness: 0.2 },
  },
  {
    id: "shadows",
    label: "Shadows",
    icon: "🌑",
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Brightness",
    filterProps: { brightness: 0.4 },
  },
  {
    id: "saturation",
    label: "Saturation",
    icon: "🎨",
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Saturation",
    filterProps: { saturation: 0.5 },
  },
  {
    id: "tint",
    label: "Tint",
    icon: "🌈",
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    filterType: "HueRotation",
    filterProps: { rotation: 0.5 },
  },
  {
    id: "temperature",
    label: "Temperature",
    icon: "🌡️",
    min: -100,
    max: 100,
    default: 0,
    step: 1,
    filterType: "HueRotation",
    filterProps: { rotation: 0.3 },
  },
  {
    id: "sharpness",
    label: "Sharpness",
    icon: "🔍",
    min: 0,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Convolute",
    filterProps: { strength: 1 },
  },
  {
    id: "definition",
    label: "Definition",
    icon: "💎",
    min: 0,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Contrast",
    filterProps: { contrast: 0.3 },
  },
  {
    id: "vignette",
    label: "Vignette",
    icon: "⭕",
    min: 0,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Brightness",
    filterProps: { brightness: -0.1 },
  },
  {
    id: "grain",
    label: "Grain",
    icon: "📺",
    min: 0,
    max: 100,
    default: 0,
    step: 1,
    filterType: "Noise",
    filterProps: { noise: 0.3 },
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

export default function AdjustmentsPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const activeObject = useEditorStore((s) => s.activeObject);

  const isImage = activeObject?.type === "image";

  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(adjustments.map((a) => [a.id, a.default]))
  );

  useEffect(() => {
    if (!activeObject || activeObject.type !== "image") {
      setValues(Object.fromEntries(adjustments.map((a) => [a.id, a.default])));
    }
  }, [activeObject]);

  const applyAdjustments = useCallback(
    async (newValues: Record<string, number>) => {
      if (!canvas || !activeObject || activeObject.type !== "image") return;

      const obj = activeObject as fabric.FabricImage;
      const ok = await ensureUntaintedImage(obj);
      if (!ok) {
        toast.error("This image's source blocks editing. Re-upload it to use adjustments.");
        return;
      }

      const filters: any[] = [];

      adjustments.forEach((adj) => {
        const value = newValues[adj.id];
        if (value === adj.default) return;

        const normalizedValue = (value - adj.default) / (adj.max - adj.default);

        switch (adj.filterType) {
          case "Brightness":
            filters.push(
              new (fabric.filters as any).Brightness({
                brightness: normalizedValue * adj.filterProps.brightness,
              })
            );
            break;
          case "Contrast":
            filters.push(
              new (fabric.filters as any).Contrast({
                contrast: normalizedValue * adj.filterProps.contrast,
              })
            );
            break;
          case "Saturation":
            filters.push(
              new (fabric.filters as any).Saturation({
                saturation: normalizedValue * adj.filterProps.saturation,
              })
            );
            break;
          case "HueRotation":
            filters.push(
              new (fabric.filters as any).HueRotation({
                rotation: normalizedValue * adj.filterProps.rotation,
              })
            );
            break;
          case "Convolute":
            filters.push(
              new (fabric.filters as any).Convolute({
                matrix: [0, -1, 0, -1, 5 + normalizedValue * 4, -1, 0, -1, 0],
              })
            );
            break;
          case "Noise":
            filters.push(
              new (fabric.filters as any).Noise({
                noise: normalizedValue * adj.filterProps.noise * 200,
              })
            );
            break;
        }
      });

      // Clear existing filters by applying empty, then set new ones
      try {
        const filterHolder = obj as unknown as { filters: any[] };
        filterHolder.filters = filters;
        obj.applyFilters();
        canvas.requestRenderAll();
      } catch (error) {
        console.error("Adjustment failed:", error);
        toast.error("Failed to apply adjustments");
      }
    },
    [canvas, activeObject]
  );

  const handleValueChange = useCallback(
    (id: string, value: number) => {
      const newValues = { ...values, [id]: value };
      setValues(newValues);
      applyAdjustments(newValues);
    },
    [values, applyAdjustments]
  );

  const handleReset = useCallback(
    (id: string) => {
      const newValues = { ...values, [id]: adjustments.find((a) => a.id === id)?.default || 0 };
      setValues(newValues);
      applyAdjustments(newValues);
      saveHistory();
    },
    [values, applyAdjustments, saveHistory]
  );

  const handleResetAll = useCallback(() => {
    const newValues = Object.fromEntries(adjustments.map((a) => [a.id, a.default]));
    setValues(newValues);
    applyAdjustments(newValues);
    saveHistory();
  }, [applyAdjustments, saveHistory]);

  const handleApply = useCallback(() => {
    saveHistory();
  }, [saveHistory]);

  if (!isImage) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <SlidersHorizontal size={48} className="mb-3 text-slate-300" />
        <h3 className="text-sm font-semibold text-slate-600">No Image Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Select an image on the canvas to adjust its properties
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Reset All */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
        <span className="text-xs font-medium text-slate-500">Adjustments</span>
        <button
          onClick={handleResetAll}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition"
        >
          <RotateCcw size={12} />
          Reset All
        </button>
      </div>

      {/* Adjustment Sliders */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {adjustments.map((adj) => (
          <div key={adj.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{adj.icon}</span>
                <label className="text-[11px] font-medium text-slate-600">
                  {adj.label}
                </label>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-500 w-8 text-right">
                  {values[adj.id]}
                </span>
                {values[adj.id] !== adj.default && (
                  <button
                    onClick={() => handleReset(adj.id)}
                    className="text-slate-400 hover:text-indigo-600 transition"
                  >
                    <RotateCcw size={10} />
                  </button>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min={adj.min}
                max={adj.max}
                value={values[adj.id]}
                onChange={(e) => handleValueChange(adj.id, Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3.5
                  [&::-webkit-slider-thumb]:h-3.5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-indigo-500
                  [&::-webkit-slider-thumb]:shadow-sm
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:hover:bg-indigo-600
                  [&::-webkit-slider-thumb]:transition-colors"
              />
              <div
                className="absolute top-0 left-0 h-1.5 bg-indigo-400 rounded-full pointer-events-none"
                style={{
                  width: `${((values[adj.id] - adj.min) / (adj.max - adj.min)) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Apply Button */}
      <div className="shrink-0 px-3 py-2 border-t border-slate-100">
        <button
          onClick={handleApply}
          className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 active:bg-indigo-800"
        >
          Apply Adjustments
        </button>
      </div>
    </div>
  );
}
