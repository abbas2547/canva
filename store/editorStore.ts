"use client";

import { create } from "zustand";
import * as fabric from "fabric";

/* =========================================================
   TYPES
========================================================= */

export interface LayerItem {
  id: string;
  type: string;
  name: string;
  locked: boolean;
  visible: boolean;
  object: fabric.FabricObject;
}

type FabricObjectWithCustomData = fabric.FabricObject & {
  id?: string;
  name?: string;
};

/* =========================================================
   EDITOR STATE
========================================================= */

interface EditorState {
  /* =======================================================
     CANVAS
  ======================================================= */

  canvas: fabric.Canvas | null;

  setCanvas: (
    canvas: fabric.Canvas | null
  ) => void;

  /* =======================================================
     PROJECT
  ======================================================= */

  projectName: string;

  setProjectName: (
    name: string
  ) => void;

  designId: string | null;

  setDesignId: (
    id: string | null
  ) => void;

  isSaving: boolean;

  setIsSaving: (
    saving: boolean
  ) => void;

  /* =======================================================
     UI STATE
  ======================================================= */

  showLeftSidebar: boolean;
  setShowLeftSidebar: (show: boolean) => void;

  showRightSidebar: boolean;
  setShowRightSidebar: (show: boolean) => void;

  rightPanel: "properties" | "ai";
  setRightPanel: (panel: "properties" | "ai") => void;

  showAIChat: boolean;
  setShowAIChat: (show: boolean) => void;

  /* =======================================================
     DIRTY TRACKING
  ======================================================= */

  lastSavedSnapshot: string | null;
  markSaved: () => void;
  isDirty: () => boolean;

  /* =======================================================
     ZOOM
  ======================================================= */

  zoom: number;

  setZoom: (
    zoom: number
  ) => void;

  zoomIn: () => void;

  zoomOut: () => void;

  resetZoom: () => void;

  /* =======================================================
     CANVAS SIZE
  ======================================================= */

  canvasWidth: number;

  canvasHeight: number;

  setCanvasSize: (
    width: number,
    height: number
  ) => void;

  /* =======================================================
     SELECTION
  ======================================================= */

  selectedElementId: string | null;

  setSelectedElementId: (
    id: string | null
  ) => void;

  activeObject: fabric.FabricObject | null;

  setActiveObject: (
    object: fabric.FabricObject | null
  ) => void;

  activeProperties: Record<
    string,
    unknown
  >;

  updateActiveProperties: (
    props: Record<string, unknown>
  ) => void;

  clearActiveProperties: () => void;

  /* =======================================================
     HISTORY
  ======================================================= */

  history: string[];

  historyIndex: number;

  saveHistory: () => void;

  undo: () => Promise<void>;

  redo: () => Promise<void>;

  /* =======================================================
     LAYERS
  ======================================================= */

  layers: LayerItem[];

  refreshLayers: () => void;

  selectLayer: (
    id: string
  ) => void;

  deleteLayer: (
    id: string
  ) => void;

  toggleLayerVisibility: (
    id: string
  ) => void;

  toggleLayerLock: (
    id: string
  ) => void;

  bringForward: () => void;

  sendBackward: () => void;

  bringToFront: () => void;

  sendToBack: () => void;

  /* =======================================================
     OBJECT ACTIONS
  ======================================================= */

  deleteSelected: () => void;

  duplicateSelected: () => Promise<void>;

  deselect: () => void;

  /* =======================================================
     BACKGROUND
  ======================================================= */

  setBackgroundColor: (
    color: string
  ) => void;

  /* =======================================================
     TOOLS
  ======================================================= */

  activeTool: string;

  setActiveTool: (
    tool: string
  ) => void;

  /* =======================================================
     RESET
  ======================================================= */

  resetEditor: () => void;
}

/* =========================================================
   HELPERS
========================================================= */

const MAX_HISTORY = 50;

function createObjectId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `object-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

/* =========================================================
   FABRIC CUSTOM PROPERTIES
========================================================= */

if (
  !fabric.FabricObject.customProperties.includes(
    "id"
  )
) {
  fabric.FabricObject.customProperties.push(
    "id"
  );
}

if (
  !fabric.FabricObject.customProperties.includes(
    "name"
  )
) {
  fabric.FabricObject.customProperties.push(
    "name"
  );
}

/* =========================================================
   ENSURE OBJECT ID
========================================================= */

function ensureObjectId(
  object: fabric.FabricObject
): string {
  const obj =
    object as FabricObjectWithCustomData;

  if (!obj.id) {
    obj.id = createObjectId();
  }

  return obj.id;
}

/* =========================================================
   OBJECT NAME
========================================================= */

function getObjectName(
  object: fabric.FabricObject,
  index = 0
): string {
  const obj =
    object as FabricObjectWithCustomData;

  if (obj.name) {
    return obj.name;
  }

  let name = "Object";

  switch (object.type) {
    case "i-text":
    case "text":
    case "textbox":
      name = "Text";
      break;

    case "rect":
      name = "Rectangle";
      break;

    case "circle":
      name = "Circle";
      break;

    case "triangle":
      name = "Triangle";
      break;

    case "line":
      name = "Line";
      break;

    case "image":
      name = "Image";
      break;

    case "group":
      name = "Group";
      break;

    case "polygon":
      name = "Polygon";
      break;

    case "ellipse":
      name = "Ellipse";
      break;

    case "path":
      name = "Path";
      break;

    default:
      name = `${
        object.type || "Object"
      } ${index + 1}`;
  }

  obj.name = name;

  return name;
}

/* =========================================================
   ACTIVE OBJECT PROPERTIES
========================================================= */

function getObjectProperties(
  object: fabric.FabricObject
): Record<string, unknown> {
  const obj =
    object as FabricObjectWithCustomData;

  return {
    id:
      ensureObjectId(object),

    name:
      getObjectName(object),

    type:
      object.type,

    left:
      object.left ?? 0,

    top:
      object.top ?? 0,

    width:
      object.width ?? 0,

    height:
      object.height ?? 0,

    scaleX:
      object.scaleX ?? 1,

    scaleY:
      object.scaleY ?? 1,

    angle:
      object.angle ?? 0,

    skewX:
      object.skewX ?? 0,

    skewY:
      object.skewY ?? 0,

    opacity:
      object.opacity ?? 1,

    visible:
      object.visible !== false,

    selectable:
      object.selectable !== false,

    evented:
      object.evented !== false,

    fill:
      obj.fill ?? null,

    stroke:
      obj.stroke ?? null,

    strokeWidth:
      obj.strokeWidth ?? 0,

    lockMovementX:
      object.lockMovementX === true,

    lockMovementY:
      object.lockMovementY === true,

    lockRotation:
      object.lockRotation === true,

    lockScalingX:
      object.lockScalingX === true,

    lockScalingY:
      object.lockScalingY === true,
  };
}

/* =========================================================
   ENSURE ALL OBJECT METADATA
========================================================= */

function ensureCanvasObjectMetadata(
  canvas: fabric.Canvas
) {
  canvas.getObjects().forEach(
    (object, index) => {
      ensureObjectId(object);

      getObjectName(
        object,
        index
      );
    }
  );
}

/* =========================================================
   STORE
========================================================= */

export const useEditorStore =
  create<EditorState>((set, get) => ({
    /* =====================================================
       CANVAS
    ===================================================== */

    canvas: null,

    setCanvas: (canvas) => {
      set({
        canvas,

        activeObject:
          canvas?.getActiveObject() ??
          null,
      });

      if (!canvas) {
        set({
          selectedElementId: null,
          activeObject: null,
          activeProperties: {},
          layers: [],
        });

        return;
      }

      ensureCanvasObjectMetadata(
        canvas
      );

      get().refreshLayers();

      const active =
        canvas.getActiveObject();

      if (active) {
        get().setActiveObject(
          active
        );
      }
    },

    /* =====================================================
       PROJECT
    ===================================================== */

    projectName:
      "Untitled Design",

    setProjectName: (name) => {
      set({
        projectName: name,
      });
    },

    designId: null,

    setDesignId: (id) => {
      set({
        designId: id,
      });
    },

    isSaving: false,

    setIsSaving: (saving) => {
      set({
        isSaving: saving,
      });
    },

    /* =====================================================
       UI STATE
    ===================================================== */

    showLeftSidebar: true,
    setShowLeftSidebar: (show) => {
      set({ showLeftSidebar: show });
    },

    showRightSidebar: true,
    setShowRightSidebar: (show) => {
      set({ showRightSidebar: show });
    },

    rightPanel: "properties",
    setRightPanel: (panel) => {
      set({ rightPanel: panel });
    },

    showAIChat: true,
    setShowAIChat: (show) => {
      set({ showAIChat: show });
    },

    /* =====================================================
       DIRTY TRACKING
    ===================================================== */

    lastSavedSnapshot: null,

    markSaved: () => {
      const canvas = get().canvas;
      if (!canvas) {
        set({ lastSavedSnapshot: null });
        return;
      }
      try {
        const snapshot = JSON.stringify(canvas.toJSON());
        set({ lastSavedSnapshot: snapshot });
      } catch {
        set({ lastSavedSnapshot: null });
      }
    },

    isDirty: () => {
      const canvas = get().canvas;
      if (!canvas) return false;
      const { lastSavedSnapshot } = get();
      if (!lastSavedSnapshot) return true;
      try {
        return JSON.stringify(canvas.toJSON()) !== lastSavedSnapshot;
      } catch {
        return true;
      }
    },

    /* =====================================================
       ZOOM
    ===================================================== */

    zoom: 1,

    setZoom: (zoom) => {
      const safeZoom =
        Math.min(
          Math.max(
            Number(zoom) || 1,
            0.2
          ),
          3
        );

      set({
        zoom: safeZoom,
      });

      const canvas =
        get().canvas;

      if (!canvas) return;

      canvas.setZoom(
        safeZoom
      );

      canvas.requestRenderAll();
    },

    zoomIn: () => {
      get().setZoom(
        get().zoom + 0.1
      );
    },

    zoomOut: () => {
      get().setZoom(
        get().zoom - 0.1
      );
    },

    resetZoom: () => {
      get().setZoom(1);
    },

    /* =====================================================
       CANVAS SIZE
    ===================================================== */

    canvasWidth: 1080,

    canvasHeight: 1080,

    setCanvasSize: (
      width,
      height
    ) => {
      const safeWidth =
        Math.max(
          1,
          Number(width) || 1080
        );

      const safeHeight =
        Math.max(
          1,
          Number(height) || 1080
        );

      set({
        canvasWidth:
          safeWidth,

        canvasHeight:
          safeHeight,
      });

      const canvas =
        get().canvas;

      if (!canvas) return;

      canvas.setDimensions({
        width: safeWidth,
        height: safeHeight,
      });

      canvas.requestRenderAll();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       SELECTION
    ===================================================== */

    selectedElementId: null,

    setSelectedElementId: (
      id
    ) => {
      set({
        selectedElementId: id,
      });
    },

    activeObject: null,

    setActiveObject: (
      object
    ) => {
      if (!object) {
        set({
          activeObject: null,
          selectedElementId: null,
          activeProperties: {},
        });

        return;
      }

      const id =
        ensureObjectId(object);

      set({
        activeObject: object,

        selectedElementId: id,

        activeProperties:
          getObjectProperties(
            object
          ),
      });
    },

    activeProperties: {},

    updateActiveProperties: (
      props
    ) => {
      set((state) => ({
        activeProperties: {
          ...state.activeProperties,
          ...props,
        },
      }));
    },

    clearActiveProperties: () => {
      set({
        activeObject: null,
        selectedElementId: null,
        activeProperties: {},
      });
    },

    /* =====================================================
       HISTORY
    ===================================================== */

    history: [],

    historyIndex: -1,

    saveHistory: () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      ensureCanvasObjectMetadata(
        canvas
      );

      const json =
        JSON.stringify(
          canvas.toJSON()
        );

      const {
        history,
        historyIndex,
      } = get();

      if (
        historyIndex >= 0 &&
        history[
          historyIndex
        ] === json
      ) {
        return;
      }

      const newHistory =
        history.slice(
          0,
          historyIndex + 1
        );

      newHistory.push(json);

      const trimmed =
        newHistory.length >
        MAX_HISTORY
          ? newHistory.slice(
              -MAX_HISTORY
            )
          : newHistory;

      set({
        history:
          trimmed,

        historyIndex:
          trimmed.length - 1,
      });
    },

    /* =====================================================
       UNDO
    ===================================================== */

    undo: async () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const {
        history,
        historyIndex,
      } = get();

      if (
        historyIndex <= 0
      ) {
        return;
      }

      const newIndex =
        historyIndex - 1;

      const json =
        history[newIndex];

      if (!json) return;

      try {
        await canvas.loadFromJSON(
          json
        );

        canvas.discardActiveObject();

        canvas.requestRenderAll();

        ensureCanvasObjectMetadata(
          canvas
        );

        set({
          historyIndex:
            newIndex,

          activeObject: null,

          selectedElementId: null,

          activeProperties: {},
        });

        get().refreshLayers();
      } catch (error) {
        console.error(
          "Undo error:",
          error
        );
      }
    },

    /* =====================================================
       REDO
    ===================================================== */

    redo: async () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const {
        history,
        historyIndex,
      } = get();

      if (
        historyIndex >=
        history.length - 1
      ) {
        return;
      }

      const newIndex =
        historyIndex + 1;

      const json =
        history[newIndex];

      if (!json) return;

      try {
        await canvas.loadFromJSON(
          json
        );

        canvas.discardActiveObject();

        canvas.requestRenderAll();

        ensureCanvasObjectMetadata(
          canvas
        );

        set({
          historyIndex:
            newIndex,

          activeObject: null,

          selectedElementId: null,

          activeProperties: {},
        });

        get().refreshLayers();
      } catch (error) {
        console.error(
          "Redo error:",
          error
        );
      }
    },

    /* =====================================================
       LAYERS
    ===================================================== */

    layers: [],

    refreshLayers: () => {
      const canvas =
        get().canvas;

      if (!canvas) {
        set({
          layers: [],
        });

        return;
      }

      const objects =
        canvas.getObjects();

      const layers =
        objects.map(
          (
            object,
            index
          ): LayerItem => {
            const id =
              ensureObjectId(
                object
              );

            const name =
              getObjectName(
                object,
                index
              );

            return {
              id,

              type:
                object.type ||
                "object",

              name,

              locked:
                object.lockMovementX ===
                  true &&
                object.lockMovementY ===
                  true,

              visible:
                object.visible !==
                false,

              object,
            };
          }
        );

      set({
        layers,
      });
    },

    /* =====================================================
       SELECT LAYER
    ===================================================== */

    selectLayer: (id) => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const object =
        canvas
          .getObjects()
          .find(
            (item) =>
              (
                item as FabricObjectWithCustomData
              ).id === id
          );

      if (!object) return;

      canvas.setActiveObject(
        object
      );

      canvas.requestRenderAll();

      get().setActiveObject(
        object
      );
    },

    /* =====================================================
       DELETE LAYER
    ===================================================== */

    deleteLayer: (id) => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const object =
        canvas
          .getObjects()
          .find(
            (item) =>
              (
                item as FabricObjectWithCustomData
              ).id === id
          );

      if (!object) return;

      canvas.remove(object);

      canvas.discardActiveObject();

      canvas.requestRenderAll();

      get().clearActiveProperties();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       TOGGLE VISIBILITY
    ===================================================== */

    toggleLayerVisibility: (
      id
    ) => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const object =
        canvas
          .getObjects()
          .find(
            (item) =>
              (
                item as FabricObjectWithCustomData
              ).id === id
          );

      if (!object) return;

      object.set(
        "visible",
        object.visible === false
      );

      canvas.requestRenderAll();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       TOGGLE LOCK
    ===================================================== */

    toggleLayerLock: (
      id
    ) => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const object =
        canvas
          .getObjects()
          .find(
            (item) =>
              (
                item as FabricObjectWithCustomData
              ).id === id
          );

      if (!object) return;

      const locked =
        object.lockMovementX ===
          true &&
        object.lockMovementY ===
          true;

      object.set({
        lockMovementX:
          !locked,

        lockMovementY:
          !locked,

        lockRotation:
          !locked,

        lockScalingX:
          !locked,

        lockScalingY:
          !locked,

        selectable:
          locked,

        evented:
          locked,
      });

      canvas.discardActiveObject();

      canvas.requestRenderAll();

      get().clearActiveProperties();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       BRING FORWARD
    ===================================================== */

    bringForward: () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const object =
        canvas.getActiveObject();

      if (!object) return;

      canvas.bringObjectForward(
        object
      );

      canvas.requestRenderAll();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       SEND BACKWARD
    ===================================================== */

    sendBackward: () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const object =
        canvas.getActiveObject();

      if (!object) return;

      canvas.sendObjectBackwards(
        object
      );

      canvas.requestRenderAll();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       BRING TO FRONT
    ===================================================== */

    bringToFront: () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const object =
        canvas.getActiveObject();

      if (!object) return;

      canvas.bringObjectToFront(
        object
      );

      canvas.requestRenderAll();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       SEND TO BACK
    ===================================================== */

    sendToBack: () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const object =
        canvas.getActiveObject();

      if (!object) return;

      canvas.sendObjectToBack(
        object
      );

      canvas.requestRenderAll();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       DELETE SELECTED
    ===================================================== */

    deleteSelected: () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      const active =
        canvas.getActiveObject();

      if (!active) return;

      if (
        active.type ===
          "activeSelection"
      ) {
        const selection =
          active as fabric.ActiveSelection;

        const objects =
          selection.getObjects();

        canvas.discardActiveObject();

        objects.forEach(
          (object) => {
            canvas.remove(object);
          }
        );
      } else {
        canvas.remove(active);

        canvas.discardActiveObject();
      }

      canvas.requestRenderAll();

      get().clearActiveProperties();

      get().refreshLayers();

      get().saveHistory();
    },

    /* =====================================================
       DUPLICATE SELECTED
    ===================================================== */

    duplicateSelected:
      async () => {
        const canvas =
          get().canvas;

        if (!canvas) return;

        const active =
          canvas.getActiveObject();

        if (!active) return;

        try {
          if (
            active.type ===
              "activeSelection"
          ) {
            const selection =
              active as fabric.ActiveSelection;

            const objects =
              selection.getObjects();

            const clones: fabric.FabricObject[] =
              [];

            for (
              const object of objects
            ) {
              const cloned =
                await object.clone();

              const original =
                object as FabricObjectWithCustomData;

              const clonedObject =
                cloned as FabricObjectWithCustomData;

              clonedObject.id =
                createObjectId();

              clonedObject.name =
                `${
                  original.name ??
                  "Object"
                } Copy`;

              cloned.set({
                left:
                  (object.left ??
                    0) + 30,

                top:
                  (object.top ??
                    0) + 30,
              });

              canvas.add(cloned);

              clones.push(cloned);
            }

            canvas.discardActiveObject();

            if (clones.length > 0) {
              const newSelection =
                new fabric.ActiveSelection(
                  clones,
                  {
                    canvas,
                  }
                );

              canvas.setActiveObject(
                newSelection
              );
            }
          } else {
            const cloned =
              await active.clone();

            const original =
              active as FabricObjectWithCustomData;

            const clonedObject =
              cloned as FabricObjectWithCustomData;

            clonedObject.id =
              createObjectId();

            clonedObject.name =
              `${
                original.name ??
                "Object"
              } Copy`;

            cloned.set({
              left:
                (active.left ??
                  0) + 30,

              top:
                (active.top ??
                  0) + 30,
            });

            canvas.add(cloned);

            canvas.setActiveObject(
              cloned
            );

            get().setActiveObject(
              cloned
            );
          }

          canvas.requestRenderAll();

          get().refreshLayers();

          get().saveHistory();
        } catch (error) {
          console.error(
            "Duplicate error:",
            error
          );
        }
      },

    /* =====================================================
       DESELECT
    ===================================================== */

    deselect: () => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      canvas.discardActiveObject();

      canvas.requestRenderAll();

      get().clearActiveProperties();

      get().refreshLayers();
    },

    /* =====================================================
       BACKGROUND
    ===================================================== */

    setBackgroundColor: (
      color
    ) => {
      const canvas =
        get().canvas;

      if (!canvas) return;

      canvas.backgroundColor =
        color;

      canvas.requestRenderAll();

      get().saveHistory();
    },

    /* =====================================================
       TOOLS
    ===================================================== */

    activeTool: "select",

    setActiveTool: (
      tool
    ) => {
      set({
        activeTool: tool,
      });
    },

    /* =====================================================
       RESET
    ===================================================== */

    resetEditor: () => {
      const canvas =
        get().canvas;

      if (canvas) {
        canvas.clear();

        canvas.backgroundColor =
          "#ffffff";

        canvas.setZoom(1);

        canvas.requestRenderAll();
      }

      set({
        projectName:
          "Untitled Design",

        designId: null,

        isSaving: false,

        zoom: 1,

        canvasWidth: 1080,

        canvasHeight: 1080,

        selectedElementId: null,

        activeObject: null,

        activeProperties: {},

        history: [],

        historyIndex: -1,

        layers: [],

        activeTool: "select",

        showLeftSidebar: true,

        showRightSidebar: true,

        rightPanel: "properties",

        showAIChat: true,

        lastSavedSnapshot: null,
      });

      if (canvas) {
        get().refreshLayers();

        get().saveHistory();
      }
    },
  }));

export default useEditorStore;