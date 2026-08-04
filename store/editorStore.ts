import { create } from "zustand";
import * as fabric from "fabric";

export interface LayerItem {
  id: string;
  type: string;
  locked: boolean;
  visible: boolean;
  object: fabric.Object;
}

interface EditorState {
  // ==========================
  // Canvas
  // ==========================
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;

  // ==========================
  // Project
  // ==========================
  projectName: string;
  setProjectName: (name: string) => void;

  designId: string | null;
  setDesignId: (id: string | null) => void;

  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;

  // ==========================
  // Zoom
  // ==========================
  zoom: number;
  setZoom: (zoom: number) => void;

  // ==========================
  // Canvas Size
  // ==========================
  canvasWidth: number;
  canvasHeight: number;

  setCanvasSize: (width: number, height: number) => void;

  // ==========================
  // Selection
  // ==========================
  selectedElementId: string | null;
  setSelectedElementId: (id: string | null) => void;

  activeObject: fabric.Object | null;
  setActiveObject: (obj: fabric.Object | null) => void;

  activeProperties: Record<string, unknown>;
  updateActiveProperties: (
    props: Record<string, unknown>
  ) => void;

  // ==========================
  // History
  // ==========================
  history: string[];
  historyIndex: number;

  saveHistory: () => void;
  undo: () => void;
  redo: () => void;

  // ==========================
  // Layers
  // ==========================
  layers: LayerItem[];
  refreshLayers: () => void;

  // ==========================
  // Tools
  // ==========================
  activeTool: string;
  setActiveTool: (tool: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // ==========================
  // Canvas
  // ==========================
  canvas: null,

  setCanvas: (canvas) => set({ canvas }),

  // ==========================
  // Project
  // ==========================
  projectName: "Untitled Design",

  setProjectName: (name) =>
    set({
      projectName: name,
    }),

  designId: null,

  setDesignId: (id) =>
    set({
      designId: id,
    }),

  isSaving: false,

  setIsSaving: (saving) =>
    set({
      isSaving: saving,
    }),

  // ==========================
  // Zoom
  // ==========================
  zoom: 1,

  setZoom: (zoom) =>
    set({
      zoom,
    }),

  // ==========================
  // Canvas Size
  // ==========================
  canvasWidth: 1080,
  canvasHeight: 1080,

  setCanvasSize: (width, height) =>
    set({
      canvasWidth: width,
      canvasHeight: height,
    }),

  // ==========================
  // Selection
  // ==========================
  selectedElementId: null,

  setSelectedElementId: (id) =>
    set({
      selectedElementId: id,
    }),

  activeObject: null,

  setActiveObject: (obj) =>
    set({
      activeObject: obj,
    }),

  activeProperties: {},

  updateActiveProperties: (props) =>
    set((state) => ({
      activeProperties: {
        ...state.activeProperties,
        ...props,
      },
    })),

  // ==========================
  // History
  // ==========================
  history: [],
  historyIndex: -1,

  saveHistory: () => {
    const { canvas, history, historyIndex } = get();

    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());

    if (history[historyIndex] === json) return;

    const newHistory = history.slice(0, historyIndex + 1);

    newHistory.push(json);

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { canvas, history, historyIndex } = get();

    if (!canvas) return;
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;

    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll();
    });

    set({
      historyIndex: newIndex,
    });
  },

  redo: () => {
    const { canvas, history, historyIndex } = get();

    if (!canvas) return;
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;

    canvas.loadFromJSON(history[newIndex], () => {
      canvas.renderAll();
    });

    set({
      historyIndex: newIndex,
    });
  },

  // ==========================
  // Layers
  // ==========================
  layers: [],

  refreshLayers: () => {
    const { canvas } = get();

    if (!canvas) return;

    const layers: LayerItem[] = canvas
      .getObjects()
      .map((obj, index) => ({
        id: (obj as fabric.Object & { id?: string }).id ?? `layer-${index}`,
        type: obj.type ?? "object",
        locked: obj.lockMovementX === true,
        visible: obj.visible !== false,
        object: obj,
      }));

    set({
      layers,
    });
  },

  // ==========================
  // Tools
  // ==========================
  activeTool: "select",

  setActiveTool: (tool) =>
    set({
      activeTool: tool,
    }),
}));