"use client";

import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";

interface TextPreset {
  id: string;
  name: string;
  icon: React.ReactNode;
  config: {
    text: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle?: string;
    fill: string;
  };
}

const textPresets: TextPreset[] = [
  {
    id: "heading-1",
    name: "Heading 1",
    icon: <Heading1 size={18} />,
    config: {
      text: "Add a heading",
      fontSize: 72,
      fontFamily: "Arial",
      fontWeight: "bold",
      fill: "#111827",
    },
  },
  {
    id: "heading-2",
    name: "Heading 2",
    icon: <Heading2 size={18} />,
    config: {
      text: "Add a subheading",
      fontSize: 48,
      fontFamily: "Arial",
      fontWeight: "bold",
      fill: "#1f2937",
    },
  },
  {
    id: "heading-3",
    name: "Heading 3",
    icon: <Heading3 size={18} />,
    config: {
      text: "Add a small heading",
      fontSize: 36,
      fontFamily: "Arial",
      fontWeight: "600",
      fill: "#374151",
    },
  },
  {
    id: "body-text",
    name: "Body Text",
    icon: <Type size={18} />,
    config: {
      text: "Add body text. Click here to start editing.",
      fontSize: 24,
      fontFamily: "Arial",
      fontWeight: "normal",
      fill: "#4b5563",
    },
  },
  {
    id: "small-text",
    name: "Small Text",
    icon: <Type size={14} />,
    config: {
      text: "Small text",
      fontSize: 16,
      fontFamily: "Arial",
      fontWeight: "normal",
      fill: "#6b7280",
    },
  },
  {
    id: "quote",
    name: "Quote",
    icon: <Quote size={18} />,
    config: {
      text: "\"The only limit is your imagination.\"",
      fontSize: 28,
      fontFamily: "Georgia",
      fontStyle: "italic",
      fontWeight: "normal",
      fill: "#6366f1",
    },
  },
  {
    id: "list",
    name: "List Item",
    icon: <List size={18} />,
    config: {
      text: "• List item\n• List item\n• List item",
      fontSize: 20,
      fontFamily: "Arial",
      fontWeight: "normal",
      fill: "#374151",
    },
  },
];

const fontFamilies = [
  "Arial",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Verdana",
  "Courier New",
  "Impact",
  "Comic Sans MS",
];

export default function TextPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const saveHistory = useEditorStore((s) => s.saveHistory);

  const handleAddText = (preset: TextPreset) => {
    if (!canvas) return;

    const centerX = canvas.getWidth() / 2;
    const centerY = canvas.getHeight() / 2;

    const text = new fabric.IText(preset.config.text, {
      left: centerX - 150,
      top: centerY - preset.config.fontSize / 2,
      fontSize: preset.config.fontSize,
      fontFamily: preset.config.fontFamily,
      fontWeight: preset.config.fontWeight as any,
      fontStyle: (preset.config.fontStyle as any) || "normal",
      fill: preset.config.fill,
      selectable: true,
      evented: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.requestRenderAll();
    saveHistory();
  };

  const handleAddCustomText = () => {
    if (!canvas) return;

    const centerX = canvas.getWidth() / 2;
    const centerY = canvas.getHeight() / 2;

    const text = new fabric.IText("Type something", {
      left: centerX - 100,
      top: centerY - 20,
      fontSize: 32,
      fontFamily: "Arial",
      fontWeight: "normal",
      fill: "#111827",
      selectable: true,
      evented: true,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    canvas.requestRenderAll();
    saveHistory();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Add Text Button */}
      <div className="p-3 border-b border-slate-200">
        <button
          onClick={handleAddCustomText}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          <Type size={16} />
          Add Text Box
        </button>
      </div>

      {/* Text Presets */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Text Styles
          </h3>
          <div className="space-y-1.5">
            {textPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleAddText(preset)}
                className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-300 hover:shadow-sm active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  {preset.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {preset.name}
                  </p>
                  <p
                    className="text-xs text-slate-400 truncate"
                    style={{
                      fontFamily: preset.config.fontFamily,
                      fontWeight: preset.config.fontWeight as any,
                      fontStyle: preset.config.fontStyle as any,
                    }}
                  >
                    {preset.config.text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Fonts */}
        <div>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Quick Fonts
          </h3>
          <div className="grid grid-cols-1 gap-1.5">
            {fontFamilies.map((font) => (
              <button
                key={font}
                onClick={() => {
                  if (!canvas) return;
                  const centerX = canvas.getWidth() / 2;
                  const centerY = canvas.getHeight() / 2;
                  const text = new fabric.IText("Text", {
                    left: centerX - 50,
                    top: centerY - 16,
                    fontSize: 32,
                    fontFamily: font,
                    fill: "#111827",
                  });
                  canvas.add(text);
                  canvas.setActiveObject(text);
                  text.enterEditing();
                  canvas.requestRenderAll();
                  saveHistory();
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-left transition hover:border-indigo-300 hover:bg-indigo-50"
                style={{ fontFamily: font }}
              >
                {font}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
