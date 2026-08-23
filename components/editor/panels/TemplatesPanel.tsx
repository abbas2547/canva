"use client";

import { useState, useMemo } from "react";
import { Search, LayoutGrid, Star, Sparkles } from "lucide-react";
import { templateCategories, searchTemplates, type TemplateItem, type TemplateCategory } from "@/data/templates";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";

const categoryIcons: Record<string, string> = {
  "social-media": "📱",
  "presentations": "📊",
  "social-stories": "📖",
  "posters": "🖼️",
  "logos": "✨",
  "business": "💼",
  youtube: "🎬",
  resumes: "📄",
  invitations: "🎉",
  infographics: "📈",
};

export default function TemplatesPanel() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const canvas = useEditorStore((s) => s.canvas);
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);

  const filteredCategories = useMemo(() => {
    if (search) {
      const results = searchTemplates(search);
      if (results.length === 0) return [];
      return [
        {
          id: "search-results",
          name: "Search Results",
          icon: "🔍",
          description: "",
          templates: results,
        },
      ];
    }
    if (selectedCategory) {
      const cat = templateCategories.find((c) => c.id === selectedCategory);
      return cat ? [cat] : [];
    }
    return templateCategories;
  }, [search, selectedCategory]);

  const handleApplyTemplate = (template: TemplateItem) => {
    if (!canvas) return;

    canvas.clear();
    canvas.backgroundColor = "#ffffff";

    const scaleX = canvasWidth / template.width;
    const scaleY = canvasHeight / template.height;
    const scale = Math.min(scaleX, scaleY);

    template.objects.forEach((obj) => {
      let fabricObj: fabric.FabricObject | null = null;

      const baseProps = {
        left: obj.left * scale,
        top: obj.top * scale,
        selectable: true,
        evented: true,
      };

      switch (obj.type) {
        case "rect":
          fabricObj = new fabric.Rect({
            ...baseProps,
            width: (obj.width || 200) * scale,
            height: (obj.height || 200) * scale,
            fill: obj.fill || "#6366f1",
            rx: (obj.rx || 0) * scale,
            ry: (obj.ry || 0) * scale,
          });
          break;

        case "circle":
          fabricObj = new fabric.Circle({
            ...baseProps,
            radius: (obj.radius || 100) * scale,
            fill: obj.fill || "#ec4899",
          });
          break;

        case "text":
          fabricObj = new fabric.IText(obj.text || "Text", {
            ...baseProps,
            fontSize: (obj.fontSize || 24) * scale,
            fontFamily: obj.fontFamily || "Arial",
            fontWeight: obj.fontWeight as any || "normal",
            fontStyle: obj.fontStyle as any || "normal",
            textAlign: obj.textAlign as any || "left",
            fill: obj.fill || "#000000",
          });
          break;
      }

      if (fabricObj) {
        canvas.add(fabricObj);
      }
    });

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
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Category Chips */}
      {!search && (
        <div className="flex gap-1.5 px-3 py-2 overflow-x-auto scrollbar-none border-b border-slate-100">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              !selectedCategory
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <LayoutGrid size={12} />
            All
          </button>
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === cat.id ? null : cat.id
                )
              }
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{categoryIcons[cat.id] || "📁"}</span>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {filteredCategories.map((category) => (
          <div key={category.id}>
            {!search && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{categoryIcons[category.id] || "📁"}</span>
                <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  {category.name}
                </h3>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {category.templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onApply={handleApplyTemplate}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles size={32} className="text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No templates found</p>
            <p className="text-xs text-slate-400">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onApply,
}: {
  template: TemplateItem;
  onApply: (t: TemplateItem) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const thumbnailStyle = useMemo(() => {
    const bgObj = template.objects.find((o) => o.type === "rect" && o.left === 0 && o.top === 0);
    return {
      backgroundColor: bgObj?.fill || "#f1f5f9",
    };
  }, [template]);

  return (
    <button
      onClick={() => onApply(template)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-md hover:border-indigo-300"
    >
      <div
        className="aspect-[4/3] relative flex items-center justify-center"
        style={thumbnailStyle}
      >
        {/* Mini preview of template objects */}
        <div className="relative w-full h-full p-2">
          {template.objects.slice(0, 8).map((obj, i) => {
            const previewScale = 0.12;
            if (obj.type === "rect") {
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${(obj.left || 0) * previewScale + 8}px`,
                    top: `${(obj.top || 0) * previewScale + 8}px`,
                    width: `${(obj.width || 50) * previewScale}px`,
                    height: `${(obj.height || 50) * previewScale}px`,
                    backgroundColor: obj.fill || "#6366f1",
                    borderRadius: obj.rx ? `${obj.rx * previewScale}px` : "0",
                  }}
                />
              );
            }
            if (obj.type === "circle") {
              const size = (obj.radius || 50) * previewScale * 2;
              return (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${(obj.left || 0) * previewScale + 8}px`,
                    top: `${(obj.top || 0) * previewScale + 8}px`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: obj.fill || "#ec4899",
                  }}
                />
              );
            }
            if (obj.type === "text" && obj.fontSize && obj.fontSize > 40) {
              return (
                <div
                  key={i}
                  className="absolute font-bold text-[6px] leading-tight text-slate-800"
                  style={{
                    left: `${(obj.left || 0) * previewScale + 8}px`,
                    top: `${(obj.top || 0) * previewScale + 8}px`,
                    color: obj.fill || "#000",
                    fontFamily: obj.fontFamily || "Arial",
                    textAlign: (obj.textAlign as any) || "left",
                  }}
                >
                  {obj.text?.split("\n")[0]}
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm transition">
            <div className="bg-white rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg">
              Use Template
            </div>
          </div>
        )}
      </div>

      <div className="px-2.5 py-2">
        <p className="text-xs font-medium text-slate-700 truncate">
          {template.name}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {template.width} × {template.height}
        </p>
      </div>
    </button>
  );
}
