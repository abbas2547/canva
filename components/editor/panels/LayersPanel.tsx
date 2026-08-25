"use client";

import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Layers,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import * as fabric from "fabric";

export default function LayersPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const layers = useEditorStore((s) => s.layers);
  const selectLayer = useEditorStore((s) => s.selectLayer);
  const deleteLayer = useEditorStore((s) => s.deleteLayer);
  const toggleLayerVisibility = useEditorStore((s) => s.toggleLayerVisibility);
  const toggleLayerLock = useEditorStore((s) => s.toggleLayerLock);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const activeObject = useEditorStore((s) => s.activeObject);

  const handleSelectLayer = (layerId: string) => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    const obj = objects.find(
      (o) => (o as any).id === layerId
    ) as fabric.FabricObject | undefined;
    if (obj) {
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
      selectLayer(layerId);
    }
  };

  const handleDelete = (layerId: string) => {
    deleteLayer(layerId);
  };

  const handleToggleVisibility = (layerId: string) => {
    toggleLayerVisibility(layerId);
  };

  const handleToggleLock = (layerId: string) => {
    toggleLayerLock(layerId);
  };

  const getObjectIcon = (type: string) => {
    switch (type) {
      case "i-text":
      case "text":
      case "textbox":
        return "T";
      case "rect":
        return "□";
      case "circle":
        return "○";
      case "triangle":
        return "△";
      case "line":
        return "—";
      case "image":
        return "🖼";
      case "group":
        return "⊞";
      case "polygon":
        return "⬡";
      default:
        return "•";
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">
            Layers ({layers.length})
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100">
        <button
          onClick={bringToFront}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="Bring to Front"
        >
          <ArrowUp size={14} />
        </button>
        <button
          onClick={bringForward}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="Bring Forward"
        >
          <ArrowUp size={14} className="rotate-0" />
        </button>
        <button
          onClick={sendBackward}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="Send Backward"
        >
          <ArrowDown size={14} className="rotate-0" />
        </button>
        <button
          onClick={sendToBack}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          title="Send to Back"
        >
          <ArrowDown size={14} />
        </button>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Layers size={32} className="text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No layers yet</p>
            <p className="text-xs text-slate-400">
              Add objects to see layers here
            </p>
          </div>
        ) : (
          <div className="p-1">
            {[...layers].reverse().map((layer) => {
              const isActive =
                activeObject &&
                (activeObject as any).id === layer.id;
              return (
                <div
                  key={layer.id}
                  onClick={() => handleSelectLayer(layer.id)}
                  className={`group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition ${
                    isActive
                      ? "bg-indigo-50 border border-indigo-200"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <GripVertical
                    size={12}
                    className="shrink-0 text-slate-300 opacity-0 group-hover:opacity-100 transition"
                  />

                  {/* Icon */}
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      isActive
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {getObjectIcon(layer.type)}
                  </div>

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-medium truncate ${
                        isActive ? "text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      {layer.name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {layer.type?.replace("i-text", "Text") || "Object"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(layer.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                      title={
                        layer.visible === false
                          ? "Show"
                          : "Hide"
                      }
                    >
                      {layer.visible === false ? (
                        <EyeOff size={12} />
                      ) : (
                        <Eye size={12} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(layer.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600"
                      title={
                        layer.locked ? "Unlock" : "Lock"
                      }
                    >
                      {layer.locked ? (
                        <Lock size={12} />
                      ) : (
                        <Unlock size={12} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(layer.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
