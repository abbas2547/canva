"use client";

import { useCallback, useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";
import {
  Crop,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Square,
  RectangleHorizontal,
  RectangleVertical,
} from "lucide-react";

/* =========================================================
   ASPECT RATIOS
   ========================================================= */

const aspectRatios = [
  { id: "free", label: "Free", icon: Maximize, ratio: null },
  { id: "1:1", label: "1:1", icon: Square, ratio: 1 },
  { id: "4:3", label: "4:3", icon: RectangleHorizontal, ratio: 4 / 3 },
  { id: "3:4", label: "3:4", icon: RectangleVertical, ratio: 3 / 4 },
  { id: "16:9", label: "16:9", icon: RectangleHorizontal, ratio: 16 / 9 },
  { id: "9:16", label: "9:16", icon: RectangleVertical, ratio: 9 / 16 },
  { id: "3:2", label: "3:2", icon: RectangleHorizontal, ratio: 3 / 2 },
  { id: "2:3", label: "2:3", icon: RectangleVertical, ratio: 2 / 3 },
];

const rotationPresets = [
  { label: "-90°", angle: -90 },
  { label: "-45°", angle: -45 },
  { label: "-30°", angle: -30 },
  { label: "-15°", angle: -15 },
  { label: "+15°", angle: 15 },
  { label: "+30°", angle: 30 },
  { label: "+45°", angle: 45 },
  { label: "+90°", angle: 90 },
];

/* =========================================================
   COMPONENT
   ========================================================= */

export default function CropRotatePanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const activeObject = useEditorStore((s) => s.activeObject);

  const [activeRatio, setActiveRatio] = useState<string>("free");
  const [rotation, setRotation] = useState<number>(0);

  const isImage = activeObject?.type === "image";

  const handleRotate = useCallback(
    (angle: number) => {
      if (!canvas || !activeObject) return;
      const currentAngle = activeObject.angle || 0;
      activeObject.set("angle", currentAngle + angle);
      activeObject.setCoords();
      canvas.requestRenderAll();
      setRotation(currentAngle + angle);
      saveHistory();
    },
    [canvas, activeObject, saveHistory]
  );

  const handleSetRotation = useCallback(
    (angle: number) => {
      if (!canvas || !activeObject) return;
      activeObject.set("angle", angle);
      activeObject.setCoords();
      canvas.requestRenderAll();
      setRotation(angle);
      saveHistory();
    },
    [canvas, activeObject, saveHistory]
  );

  const handleFlipH = useCallback(() => {
    if (!canvas || !activeObject) return;
    const currentScaleX = activeObject.scaleX || 1;
    activeObject.set("scaleX", -currentScaleX);
    canvas.requestRenderAll();
    saveHistory();
  }, [canvas, activeObject, saveHistory]);

  const handleFlipV = useCallback(() => {
    if (!canvas || !activeObject) return;
    const currentScaleY = activeObject.scaleY || 1;
    activeObject.set("scaleY", -currentScaleY);
    canvas.requestRenderAll();
    saveHistory();
  }, [canvas, activeObject, saveHistory]);

  const handleCrop = useCallback(
    (ratio: string) => {
      if (!canvas || !activeObject || activeObject.type !== "image") return;

      const ratioValue = aspectRatios.find((r) => r.id === ratio)?.ratio;

      if (!ratioValue) {
        setActiveRatio(ratio);
        return;
      }

      const imgWidth = activeObject.width || 100;
      const imgHeight = activeObject.height || 100;

      let cropWidth = imgWidth;
      let cropHeight = imgHeight;

      if (imgWidth / imgHeight > ratioValue) {
        cropWidth = imgHeight * ratioValue;
      } else {
        cropHeight = imgWidth / ratioValue;
      }

      const clipPath = new fabric.Rect({
        width: cropWidth,
        height: cropHeight,
        originX: "center",
        originY: "center",
      });

      activeObject.set("clipPath", clipPath);
      canvas.requestRenderAll();
      setActiveRatio(ratio);
      saveHistory();
    },
    [canvas, activeObject, saveHistory]
  );

  const handleResetCrop = useCallback(() => {
    if (!canvas || !activeObject) return;
    activeObject.set("clipPath", undefined);
    canvas.requestRenderAll();
    setActiveRatio("free");
    saveHistory();
  }, [canvas, activeObject, saveHistory]);

  const handleFitToCanvas = useCallback(() => {
    if (!canvas || !activeObject) return;

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();
    const objWidth = activeObject.width || 100;
    const objHeight = activeObject.height || 100;

    const scaleX = canvasWidth / objWidth;
    const scaleY = canvasHeight / objHeight;
    const scale = Math.min(scaleX, scaleY) * 0.9;

    activeObject.set({
      scaleX: scale,
      scaleY: scale,
      left: canvasWidth / 2,
      top: canvasHeight / 2,
      originX: "center",
      originY: "center",
    });

    activeObject.setCoords();
    canvas.requestRenderAll();
    saveHistory();
  }, [canvas, activeObject, saveHistory]);

  if (!isImage) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <Crop size={48} className="mb-3 text-slate-300" />
        <h3 className="text-sm font-semibold text-slate-600">No Image Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Select an image to crop, rotate, or flip
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Rotation Section */}
      <div className="p-3 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Rotation
        </h3>

        {/* Quick Rotate Buttons */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={() => handleRotate(-90)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            <RotateCcw size={14} />
            -90°
          </button>
          <button
            onClick={() => handleSetRotation(0)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            Reset
          </button>
          <button
            onClick={() => handleRotate(90)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            <RotateCw size={14} />
            +90°
          </button>
        </div>

        {/* Rotation Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-500">Angle</label>
            <span className="text-[10px] font-mono text-slate-500">{Math.round(rotation)}°</span>
          </div>
          <input
            type="range"
            min={-180}
            max={180}
            value={rotation}
            onChange={(e) => handleSetRotation(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-500
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-indigo-500
              [&::-webkit-slider-thumb]:shadow-sm
              [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>

        {/* Preset Rotations */}
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {rotationPresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleRotate(preset.angle)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flip Section */}
      <div className="p-3 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Flip
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleFlipH}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            <FlipHorizontal size={16} />
            Horizontal
          </button>
          <button
            onClick={handleFlipV}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
          >
            <FlipVertical size={16} />
            Vertical
          </button>
        </div>
      </div>

      {/* Crop Section */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Crop Ratio
          </h3>
          {activeRatio !== "free" && (
            <button
              onClick={handleResetCrop}
              className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Remove Crop
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {aspectRatios.map((ratio) => {
            const Icon = ratio.icon;
            return (
              <button
                key={ratio.id}
                onClick={() => handleCrop(ratio.id)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition ${
                  activeRatio === ratio.id
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                <span className="text-[9px] font-medium">{ratio.label}</span>
              </button>
            );
          })}
        </div>

        {/* Fit to Canvas */}
        <button
          onClick={handleFitToCanvas}
          className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 active:bg-slate-100"
        >
          <Maximize size={16} />
          Fit to Canvas
        </button>
      </div>
    </div>
  );
}
