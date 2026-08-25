"use client";

import { useState } from "react";
import { Search, Shapes, Minus, Smile, Grid3X3 } from "lucide-react";
import { elementCategories, type ElementItem } from "@/data/elements";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";

const categoryIcons: Record<string, React.ReactNode> = {
  "basic-shapes": <Shapes size={14} />,
  lines: <Minus size={14} />,
  emojis: <Smile size={14} />,
};

export default function ElementsPanel() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const canvas = useEditorStore((s) => s.canvas);
  const saveHistory = useEditorStore((s) => s.saveHistory);
  const refreshLayers = useEditorStore((s) => s.refreshLayers);

  const filteredCategories = selectedCategory
    ? elementCategories.filter((c) => c.id === selectedCategory)
    : elementCategories;

  const filteredBySearch = search
    ? elementCategories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((cat) => cat.items.length > 0)
    : filteredCategories;

  const handleAddElement = (element: ElementItem) => {
    if (!canvas) return;

    const centerX = canvas.getWidth() / 2;
    const centerY = canvas.getHeight() / 2;
    const config = element.fabricConfig;
    let fabricObj: fabric.FabricObject | null = null;

    const baseProps = {
      left: centerX - 100,
      top: centerY - 100,
      selectable: true,
      evented: true,
    };

    switch (config.type) {
      case "rect":
        fabricObj = new fabric.Rect({
          ...baseProps,
          width: (config.width as number) || 200,
          height: (config.height as number) || 200,
          fill: (config.fill as string) || "#6366f1",
          rx: (config.rx as number) || 0,
          ry: (config.ry as number) || 0,
        });
        break;

      case "circle":
        fabricObj = new fabric.Circle({
          ...baseProps,
          left: centerX - ((config.radius as number) || 100),
          top: centerY - ((config.radius as number) || 100),
          radius: (config.radius as number) || 100,
          fill: (config.fill as string) || "#ec4899",
        });
        break;

      case "ellipse":
        fabricObj = new fabric.Ellipse({
          ...baseProps,
          left: centerX - ((config.rx as number) || 120),
          top: centerY - ((config.ry as number) || 80),
          rx: (config.rx as number) || 120,
          ry: (config.ry as number) || 80,
          fill: (config.fill as string) || "#14b8a6",
        });
        break;

      case "triangle":
        fabricObj = new fabric.Triangle({
          ...baseProps,
          width: (config.width as number) || 200,
          height: (config.height as number) || 200,
          fill: (config.fill as string) || "#f59e0b",
        });
        break;

      case "line": {
        const x1 = (config.x1 as number) || 0;
        const y1 = (config.y1 as number) || 0;
        const x2 = (config.x2 as number) || 300;
        const y2 = (config.y2 as number) || 0;
        fabricObj = new fabric.Line([x1, y1, x2, y2], {
          ...baseProps,
          stroke: (config.stroke as string) || "#1e293b",
          strokeWidth: (config.strokeWidth as number) || 4,
          strokeDashArray: config.strokeDashArray as number[] | undefined,
          strokeLineCap: config.strokeLineCap as any || undefined,
        });
        break;
      }

      case "polygon": {
        const points = (config.points as Array<{ x: number; y: number }>) || [];
        if (points.length > 0) {
          const fabricPoints = points.map((p) => new fabric.Point(p.x, p.y));
          fabricObj = new fabric.Polygon(fabricPoints, {
            ...baseProps,
            fill: (config.fill as string) || "#6366f1",
          });
        }
        break;
      }

      case "i-text":
        fabricObj = new fabric.IText((config.text as string) || "Text", {
          ...baseProps,
          fontSize: (config.fontSize as number) || 80,
        });
        break;
    }

    if (fabricObj) {
      canvas.add(fabricObj);
      canvas.setActiveObject(fabricObj);
      canvas.requestRenderAll();
      refreshLayers();
      saveHistory();
    }
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
            placeholder="Search elements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex gap-1 px-3 py-2 border-b border-slate-100">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              !selectedCategory
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <Grid3X3 size={12} />
            All
          </button>
          {elementCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
              }
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {categoryIcons[cat.id]}
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Elements Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredBySearch.map((category) => (
          <div key={category.id}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {category.name}
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {category.items.map((element) => (
                <ElementCard
                  key={element.id}
                  element={element}
                  onAdd={handleAddElement}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ElementCard({
  element,
  onAdd,
}: {
  element: ElementItem;
  onAdd: (e: ElementItem) => void;
}) {
  const renderPreview = () => {
    if (element.type === "emoji" && element.emoji) {
      return (
        <span className="text-2xl">{element.emoji}</span>
      );
    }

    const config = element.fabricConfig;

    if (config.type === "rect") {
      return (
        <div
          className="w-10 h-10 rounded"
          style={{
            backgroundColor: (config.fill as string) || "#6366f1",
            borderRadius: (config.rx as number) ? `${Math.min(config.rx as number, 8)}px` : "2px",
          }}
        />
      );
    }

    if (config.type === "circle") {
      return (
        <div
          className="w-10 h-10 rounded-full"
          style={{ backgroundColor: (config.fill as string) || "#ec4899" }}
        />
      );
    }

    if (config.type === "ellipse") {
      return (
        <div
          className="w-12 h-8 rounded-full"
          style={{ backgroundColor: (config.fill as string) || "#14b8a6" }}
        />
      );
    }

    if (config.type === "triangle") {
      return (
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderBottom: `36px solid ${config.fill || "#f59e0b"}`,
          }}
        />
      );
    }

    if (config.type === "line") {
      return (
        <div
          className="w-12 h-1"
          style={{
            backgroundColor: (config.stroke as string) || "#1e293b",
            transform: `rotate(${Math.atan2(
              ((config.y2 as number) || 0) - ((config.y1 as number) || 0),
              ((config.x2 as number) || 0) - ((config.x1 as number) || 0)
            )}rad)`,
          }}
        />
      );
    }

    if (config.type === "polygon") {
      return (
        <div
          className="w-10 h-10 rotate-45"
          style={{ backgroundColor: (config.fill as string) || "#6366f1" }}
        />
      );
    }

    return (
      <div className="w-10 h-10 rounded bg-slate-200" />
    );
  };

  return (
    <button
      onClick={() => onAdd(element)}
      className="flex flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white p-2 transition hover:border-indigo-300 hover:shadow-sm active:scale-95"
      title={element.name}
    >
      {renderPreview()}
      <span className="text-[9px] text-slate-500 truncate w-full text-center">
        {element.name}
      </span>
    </button>
  );
}
