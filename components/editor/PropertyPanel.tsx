"use client";

import { useCallback, useMemo } from "react";

import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Trash2,
  Copy,
  RotateCcw,
  Minus,
  Plus,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Layers3,
  SlidersHorizontal,
  Hexagon,
} from "lucide-react";

import * as fabric from "fabric";

import { useEditorStore } from "@/store/editorStore";
import { motion, AnimatePresence } from "framer-motion";

/* =========================================================
   TYPES
========================================================= */

type FabricObjectWithCustomData =
  fabric.FabricObject & {
    id?: string;
    name?: string;
  };

/* =========================================================
   COMPONENT
========================================================= */

export default function PropertyPanel() {
  const activeObject = useEditorStore((state) => state.activeObject);
  const canvas = useEditorStore((state) => state.canvas);
  const updateActiveProperties = useEditorStore((state) => state.updateActiveProperties);
  const saveHistory = useEditorStore((state) => state.saveHistory);
  const deleteSelected = useEditorStore((state) => state.deleteSelected);
  const duplicateSelected = useEditorStore((state) => state.duplicateSelected);
  const bringForward = useEditorStore((state) => state.bringForward);
  const sendBackward = useEditorStore((state) => state.sendBackward);
  const bringToFront = useEditorStore((state) => state.bringToFront);
  const sendToBack = useEditorStore((state) => state.sendToBack);

  const isText = activeObject?.type === "i-text" || activeObject?.type === "text" || activeObject?.type === "textbox";
  const isImage = activeObject?.type === "image";
  const isShape = activeObject && ["rect", "circle", "triangle", "line", "polygon", "ellipse"].includes(activeObject.type || "");
  const isGroup = activeObject?.type === "activeSelection" || activeObject?.type === "group";

  const obj = activeObject as FabricObjectWithCustomData | null;

  const handleColorChange = useCallback(
    (color: string, property: "fill" | "stroke") => {
      if (!activeObject || !canvas) return;
      activeObject.set(property, color);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, saveHistory]
  );

  const handleFontSizeChange = useCallback(
    (size: number) => {
      if (!activeObject || !canvas || !isText) return;
      (activeObject as any).set("fontSize", size);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, isText, saveHistory]
  );

  const handleFontFamilyChange = useCallback(
    (font: string) => {
      if (!activeObject || !canvas || !isText) return;
      (activeObject as any).set("fontFamily", font);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, isText, saveHistory]
  );

  const handleAlignment = useCallback(
    (align: "left" | "center" | "right") => {
      if (!activeObject || !canvas || !isText) return;
      (activeObject as any).set("textAlign", align);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, isText, saveHistory]
  );

  const handleBold = useCallback(() => {
    if (!activeObject || !canvas || !isText) return;
    const currentWeight = (activeObject as any).fontWeight || "normal";
    (activeObject as any).set("fontWeight", currentWeight === "bold" ? "normal" : "bold");
    canvas.requestRenderAll();
    saveHistory();
  }, [activeObject, canvas, isText, saveHistory]);

  const handleItalic = useCallback(() => {
    if (!activeObject || !canvas || !isText) return;
    const currentStyle = (activeObject as any).fontStyle || "normal";
    (activeObject as any).set("fontStyle", currentStyle === "italic" ? "normal" : "italic");
    canvas.requestRenderAll();
    saveHistory();
  }, [activeObject, canvas, isText, saveHistory]);

  const handleUnderline = useCallback(() => {
    if (!activeObject || !canvas || !isText) return;
    const currentUnderline = (activeObject as any).underline || false;
    (activeObject as any).set("underline", !currentUnderline);
    canvas.requestRenderAll();
    saveHistory();
  }, [activeObject, canvas, isText, saveHistory]);

  const handleLineHeight = useCallback(
    (value: number) => {
      if (!activeObject || !canvas || !isText) return;
      (activeObject as any).set("lineHeight", value);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, isText, saveHistory]
  );

  const handleLetterSpacing = useCallback(
    (value: number) => {
      if (!activeObject || !canvas || !isText) return;
      (activeObject as any).set("charSpacing", value);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, isText, saveHistory]
  );

  const handleStrokeWidth = useCallback(
    (width: number) => {
      if (!activeObject || !canvas) return;
      activeObject.set("strokeWidth", width);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, saveHistory]
  );

  const handleOpacity = useCallback(
    (opacity: number) => {
      if (!activeObject || !canvas) return;
      activeObject.set("opacity", opacity);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, saveHistory]
  );

  const handleRotation = useCallback(
    (angle: number) => {
      if (!activeObject || !canvas) return;
      activeObject.set("angle", angle);
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, saveHistory]
  );

  const handlePosition = useCallback(
    (left: number, top: number) => {
      if (!activeObject || !canvas) return;
      activeObject.set({ left, top });
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, saveHistory]
  );

  const handleSize = useCallback(
    (width: number, height: number) => {
      if (!activeObject || !canvas) return;
      activeObject.set({ width, height });
      canvas.requestRenderAll();
      saveHistory();
    },
    [activeObject, canvas, saveHistory]
  );

  const handleLock = useCallback(() => {
    if (!activeObject || !canvas) return;
    const locked = activeObject.lockMovementX === true;
    activeObject.set({
      lockMovementX: !locked,
      lockMovementY: !locked,
      lockRotation: !locked,
      lockScalingX: !locked,
      lockScalingY: !locked,
      selectable: locked,
      evented: locked,
    });
    canvas.requestRenderAll();
    saveHistory();
  }, [activeObject, canvas, saveHistory]);

  const handleVisibility = useCallback(() => {
    if (!activeObject || !canvas) return;
    activeObject.set("visible", activeObject.visible === false);
    canvas.requestRenderAll();
    saveHistory();
  }, [activeObject, canvas, saveHistory]);

  const currentFill = activeObject && isText ? (activeObject as any).fill || "#000000" : activeObject ? (activeObject as any).fill || "#6366f1" : "#6366f1";
  const currentStroke = activeObject ? (activeObject as any).stroke || "#000000" : "#000000";
  const currentStrokeWidth = activeObject ? (activeObject as any).strokeWidth || 0 : 0;
  const currentFontSize = activeObject ? (activeObject as any).fontSize || 40 : 40;
  const currentFontFamily = activeObject ? (activeObject as any).fontFamily || "Arial" : "Arial";
  const currentTextAlign = activeObject ? (activeObject as any).textAlign || "left" : "left";
  const currentFontWeight = activeObject ? (activeObject as any).fontWeight || "normal" : "normal";
  const currentFontStyle = activeObject ? (activeObject as any).fontStyle || "normal" : "normal";
  const currentUnderline = activeObject ? (activeObject as any).underline || false : false;
  const currentLineHeight = activeObject ? (activeObject as any).lineHeight || 1.2 : 1.2;
  const currentLetterSpacing = activeObject ? (activeObject as any).charSpacing || 0 : 0;

  if (!activeObject || !canvas) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <SlidersHorizontal size={19} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-slate-900">Properties</h2>
            <p className="mt-1 text-[11px] text-slate-500">Select an object to edit</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <div className="text-slate-400">
            <SlidersHorizontal size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium text-slate-600">No selection</p>
            <p className="mt-1 text-xs text-slate-400">Click an object to see properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Hexagon size={19} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-slate-900">
            {obj?.name || getDefaultObjectName(activeObject)}
          </h2>
          <p className="mt-0.5 truncate text-[11px] text-slate-500 capitalize">
            {activeObject.type?.replace("i-text", "Text").replace("activeSelection", "Group") || "Object"}
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* TRANSFORM SECTION */}
        <PropertySection title="Transform" icon={<Square size={14} />}>
          <div className="grid grid-cols-4 gap-3">
            <PropertyInput
              label="X"
              value={Math.round(activeObject.left || 0)}
              onChange={(val) => handlePosition(val, activeObject.top || 0)}
              step={1}
            />
            <PropertyInput
              label="Y"
              value={Math.round(activeObject.top || 0)}
              onChange={(val) => handlePosition(activeObject.left || 0, val)}
              step={1}
            />
            <PropertyInput
              label="W"
              value={Math.round(activeObject.getScaledWidth?.() || activeObject.width || 0)}
              onChange={(val) => handleSize(val, activeObject.getScaledHeight?.() || activeObject.height || 0)}
              step={1}
            />
            <PropertyInput
              label="H"
              value={Math.round(activeObject.getScaledHeight?.() || activeObject.height || 0)}
              onChange={(val) => handleSize(activeObject.getScaledWidth?.() || activeObject.width || 0, val)}
              step={1}
            />
          </div>

          <div className="mt-3 grid grid-cols-4 gap-3">
            <PropertyInput
              label="Rotation"
              value={Math.round(activeObject.angle || 0)}
              onChange={handleRotation}
              step={1}
              suffix="°"
            />
            <PropertyInput
              label="Opacity"
              value={Math.round((activeObject.opacity || 1) * 100)}
              onChange={(val) => handleOpacity(val / 100)}
              step={1}
              min={0}
              max={100}
              suffix="%"
            />
            <PropertyInput
              label="Stroke"
              value={currentStrokeWidth}
              onChange={handleStrokeWidth}
              step={0.5}
              min={0}
              suffix="px"
            />
          </div>
        </PropertySection>

        {/* APPEARANCE SECTION */}
        <PropertySection title="Appearance" icon={<Hexagon size={14} />}>
          <div className="flex items-center gap-3">
            <ColorPicker
              label="Fill"
              value={currentFill}
              onChange={(color) => handleColorChange(color, "fill")}
            />
            {isShape && (
              <ColorPicker
                label="Stroke"
                value={currentStroke}
                onChange={(color) => handleColorChange(color, "stroke")}
              />
            )}
          </div>
        </PropertySection>

        {/* TEXT SECTION */}
        {isText && (
          <PropertySection title="Text" icon={<Type size={14} />}>
            <div className="space-y-3">
              <FontFamilySelect
                value={currentFontFamily}
                onChange={handleFontFamilyChange}
              />
              <PropertyInput
                label="Size"
                value={currentFontSize}
                onChange={handleFontSizeChange}
                step={1}
                min={8}
                max={200}
                suffix="px"
              />

              <div className="flex items-center gap-2">
                <ButtonIcon
                  active={currentFontWeight === "bold"}
                  onClick={handleBold}
                  title="Bold (⌘B)"
                >
                  <Bold size={14} />
                </ButtonIcon>
                <ButtonIcon
                  active={currentFontStyle === "italic"}
                  onClick={handleItalic}
                  title="Italic (⌘I)"
                >
                  <Italic size={14} />
                </ButtonIcon>
                <ButtonIcon
                  active={currentUnderline}
                  onClick={handleUnderline}
                  title="Underline (⌘U)"
                >
                  <Underline size={14} />
                </ButtonIcon>

                <div className="flex-1" />

                <ButtonIcon
                  active={currentTextAlign === "left"}
                  onClick={() => handleAlignment("left")}
                  title="Align left"
                >
                  <AlignLeft size={14} />
                </ButtonIcon>
                <ButtonIcon
                  active={currentTextAlign === "center"}
                  onClick={() => handleAlignment("center")}
                  title="Align center"
                >
                  <AlignCenter size={14} />
                </ButtonIcon>
                <ButtonIcon
                  active={currentTextAlign === "right"}
                  onClick={() => handleAlignment("right")}
                  title="Align right"
                >
                  <AlignRight size={14} />
                </ButtonIcon>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <PropertyInput
                  label="Line Height"
                  value={Math.round(currentLineHeight * 100)}
                  onChange={(val) => handleLineHeight(val / 100)}
                  step={10}
                  min={50}
                  max={300}
                  suffix="%"
                />
                <PropertyInput
                  label="Letter Spacing"
                  value={currentLetterSpacing}
                  onChange={handleLetterSpacing}
                  step={1}
                  min={-50}
                  max={200}
                  suffix="px"
                />
              </div>
            </div>
          </PropertySection>
        )}

        {/* IMAGE SECTION */}
        {isImage && (
          <PropertySection title="Image" icon={<ImageIcon size={14} />}>
            <div className="space-y-2">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <ImageIcon size={16} />
                Replace Image
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <SlidersHorizontal size={16} />
                Filters & Effects
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Square size={16} />
                Crop
              </button>
            </div>
          </PropertySection>
        )}

        {/* SHAPE SECTION */}
        {isShape && (
          <PropertySection title="Shape" icon={<Hexagon size={14} />}>
            <div className="space-y-3">
              {activeObject.type === "rect" && (
                <PropertyInput
                  label="Corner Radius"
                  value={(activeObject as any).rx || 0}
                  onChange={(val) => {
                    activeObject.set({ rx: val, ry: val });
                    canvas.requestRenderAll();
                    saveHistory();
                  }}
                  step={1}
                  min={0}
                  suffix="px"
                />
              )}
              {activeObject.type === "circle" && (
                <PropertyInput
                  label="Radius"
                  value={(activeObject as any).radius || 0}
                  onChange={(val) => {
                    activeObject.set("radius", val);
                    canvas.requestRenderAll();
                    saveHistory();
                  }}
                  step={1}
                  min={0}
                  suffix="px"
                />
              )}
            </div>
          </PropertySection>
        )}

        {/* ARRANGE SECTION */}
        <PropertySection title="Arrange" icon={<Layers3 size={14} />}>
          <div className="flex items-center gap-2">
            <ButtonIcon onClick={bringToFront} title="Bring to front">
              <ArrowUp size={14} className="rotate-90" />
            </ButtonIcon>
            <ButtonIcon onClick={bringForward} title="Bring forward (⌘]">
              <ArrowUp size={14} />
            </ButtonIcon>
            <ButtonIcon onClick={sendBackward} title="Send backward (⌘[)">
              <ArrowDown size={14} />
            </ButtonIcon>
            <ButtonIcon onClick={sendToBack} title="Send to back">
              <ArrowDown size={14} className="rotate-90" />
            </ButtonIcon>
            <div className="flex-1" />
            <ButtonIcon onClick={handleLock} title="Lock/Unlock" active={activeObject.lockMovementX}>
              {activeObject.lockMovementX ? <Lock size={14} /> : <Unlock size={14} />}
            </ButtonIcon>
            <ButtonIcon onClick={handleVisibility} title="Show/Hide" active={activeObject.visible === false}>
              {activeObject.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
            </ButtonIcon>
          </div>
        </PropertySection>

        {/* QUICK ACTIONS */}
        <PropertySection title="Actions" icon={<RotateCcw size={14} />}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={duplicateSelected}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Copy size={16} />
              Duplicate
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </PropertySection>
      </div>
    </div>
  );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

function getDefaultObjectName(object: fabric.FabricObject): string {
  switch (object.type) {
    case "i-text":
    case "text":
    case "textbox":
      return "Text";
    case "rect":
      return "Rectangle";
    case "circle":
      return "Circle";
    case "triangle":
      return "Triangle";
    case "line":
      return "Line";
    case "image":
      return "Image";
    case "group":
      return "Group";
    case "polygon":
      return "Polygon";
    case "ellipse":
      return "Ellipse";
    case "path":
      return "Path";
    default:
      return "Object";
  }
}

function PropertySection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PropertyInput({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-slate-500">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) onChange(val);
          }}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 pr-8"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-medium text-slate-500 w-16">{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const color = e.target.value;
          if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
            onChange(color);
          }
        }}
        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        placeholder="#000000"
      />
    </div>
  );
}

function FontFamilySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (font: string) => void;
}) {
  const fonts = [
    "Arial",
    "Helvetica",
    "Georgia",
    "Times New Roman",
    "Verdana",
    "Roboto",
    "Inter",
    "Poppins",
    "Montserrat",
    "Open Sans",
    "Lato",
    "Oswald",
    "Raleway",
    "Source Sans Pro",
  ];

  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-slate-500">Font Family</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        {fonts.map((font) => (
          <option key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
}

function ButtonIcon({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg transition ${
        active
          ? "bg-slate-100 text-slate-900"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}