"use client";

import { useState } from "react";
import { frameCategories, type FrameItem } from "@/data/frames";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";

export default function FramesPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const canvas = useEditorStore((s) => s.canvas);
  const saveHistory = useEditorStore((s) => s.saveHistory);

  const categories = selectedCategory
    ? frameCategories.filter((c) => c.id === selectedCategory)
    : frameCategories;

  const handleAddFrame = (frame: FrameItem) => {
    if (!canvas) return;

    const centerX = canvas.getWidth() / 2;
    const centerY = canvas.getHeight() / 2;

    if (frame.shape === "solid") {
      const frameRect = new fabric.Rect({
        width: frame.width,
        height: frame.height,
        fill: "transparent",
        stroke: frame.strokeColor || "#000000",
        strokeWidth: frame.strokeWidth || 8,
        left: centerX - frame.width / 2,
        top: centerY - frame.height / 2,
        selectable: true,
        evented: true,
        name: frame.name,
      });

      canvas.add(frameRect);
      canvas.setActiveObject(frameRect);
      canvas.requestRenderAll();
      saveHistory();
      return;
    }

    let clipPath: fabric.FabricObject | null = null;

    switch (frame.shape) {
      case "circle":
        clipPath = new fabric.Circle({
          radius: frame.width / 2,
          originX: "center",
          originY: "center",
        });
        break;
      case "rectangle":
        clipPath = new fabric.Rect({
          width: frame.width,
          height: frame.height,
          originX: "center",
          originY: "center",
        });
        break;
      case "rounded":
        clipPath = new fabric.Rect({
          width: frame.width,
          height: frame.height,
          rx: frame.rx || 20,
          ry: frame.ry || 20,
          originX: "center",
          originY: "center",
        });
        break;
      case "diamond":
        clipPath = new fabric.Rect({
          width: frame.width * 0.7,
          height: frame.height * 0.7,
          angle: 45,
          originX: "center",
          originY: "center",
        });
        break;
      case "hexagon": {
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          points.push(
            new fabric.Point(
              Math.cos(angle) * (frame.width / 2),
              Math.sin(angle) * (frame.height / 2)
            )
          );
        }
        clipPath = new fabric.Polygon(points, {
          originX: "center",
          originY: "center",
        });
        break;
      }
      case "octagon": {
        const points = [];
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI / 4) * i - Math.PI / 8;
          points.push(
            new fabric.Point(
              Math.cos(angle) * (frame.width / 2),
              Math.sin(angle) * (frame.height / 2)
            )
          );
        }
        clipPath = new fabric.Polygon(points, {
          originX: "center",
          originY: "center",
        });
        break;
      }
      case "heart": {
        const points = [
          { x: 0, y: -50 },
          { x: 50, y: -80 },
          { x: 80, y: -50 },
          { x: 80, y: 0 },
          { x: 0, y: 70 },
          { x: -80, y: 0 },
          { x: -80, y: -50 },
          { x: -50, y: -80 },
        ].map((p) => new fabric.Point(p.x, p.y));
        clipPath = new fabric.Polygon(points, {
          originX: "center",
          originY: "center",
        });
        break;
      }
    }

    if (clipPath) {
      const placeholder = new fabric.Rect({
        width: frame.width,
        height: frame.height,
        fill: "#e2e8f0",
        stroke: "#94a3b8",
        strokeWidth: 2,
        strokeDashArray: [8, 4],
        left: centerX - frame.width / 2,
        top: centerY - frame.height / 2,
        clipPath,
        selectable: true,
        evented: true,
      });

      canvas.add(placeholder);
      canvas.setActiveObject(placeholder);
      canvas.requestRenderAll();
      saveHistory();
    }
  };

  const renderFramePreview = (frame: FrameItem) => {
    const size = 40;

    if (frame.shape === "solid") {
      return (
        <div
          className="bg-transparent"
          style={{
            width: size,
            height: size * 0.75,
            border: `${Math.max(2, (frame.strokeWidth || 8) / 3)}px solid ${frame.strokeColor || "#000000"}`,
          }}
        />
      );
    }

    switch (frame.shape) {
      case "circle":
        return (
          <div
            className="rounded-full border-2 border-dashed border-slate-400 bg-slate-100"
            style={{ width: size, height: size }}
          />
        );
      case "rectangle":
        return (
          <div
            className="border-2 border-dashed border-slate-400 bg-slate-100"
            style={{ width: size, height: size * 0.75 }}
          />
        );
      case "rounded":
        return (
          <div
            className="border-2 border-dashed border-slate-400 bg-slate-100 rounded-lg"
            style={{ width: size, height: size * 0.75 }}
          />
        );
      case "diamond":
        return (
          <div
            className="border-2 border-dashed border-slate-400 bg-slate-100 rotate-45"
            style={{ width: size * 0.7, height: size * 0.7 }}
          />
        );
      case "hexagon":
        return (
          <div
            className="border-2 border-dashed border-slate-400 bg-slate-100 rounded-lg"
            style={{
              width: size,
              height: size,
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />
        );
      case "octagon":
        return (
          <div
            className="border-2 border-dashed border-slate-400 bg-slate-100"
            style={{
              width: size,
              height: size,
              clipPath:
                "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
            }}
          />
        );
      case "heart":
        return (
          <div className="text-2xl" style={{ lineHeight: 1 }}>
            💜
          </div>
        );
      default:
        return (
          <div
            className="border-2 border-dashed border-slate-400 bg-slate-100"
            style={{ width: size, height: size }}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category Tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-slate-100 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            !selectedCategory
              ? "bg-indigo-100 text-indigo-700"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          All
        </button>
        {frameCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() =>
              setSelectedCategory(
                selectedCategory === cat.id ? null : cat.id
              )
            }
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedCategory === cat.id
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Frames Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map((category) => (
          <div key={category.id}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {category.name}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {category.frames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => handleAddFrame(frame)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-300 hover:shadow-sm active:scale-95"
                >
                  {renderFramePreview(frame)}
                  <span className="text-[10px] text-slate-500">
                    {frame.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
