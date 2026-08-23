"use client";
import { doc, setDoc } from "firebase/firestore";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";

import * as fabric from "fabric";

import {
  Circle,
  Copy,
  ImagePlus,
  Maximize,
  Minus,
  MousePointer2,
  Plus,
  Square,
  Trash2,
  Triangle,
  Type,
} from "lucide-react";

import { useEditorStore } from "@/store/editorStore";
import { useCanvasSelection } from "@/hooks/useCanvasSelection";

/* =========================================================
   TYPES
========================================================= */

type FabricObjectWithCustomData =
  fabric.FabricObject & {
    id?: string;
    name?: string;
  };

interface GuideLine {
  type: "horizontal" | "vertical";
  position: number;
  isCenter: boolean;
}

interface SnapTarget {
  x: number;
  y: number;
  type: "center" | "edge" | "object";
}

/* =========================================================
   HELPERS
========================================================= */

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

function setObjectIdentity(
  object: fabric.FabricObject,
  name: string
) {
  const customObject =
    object as FabricObjectWithCustomData;

  if (!customObject.id) {
    customObject.id = createObjectId();
  }

  customObject.name = name;
}

function getDefaultObjectName(
  object: fabric.FabricObject
): string {
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

/* =========================================================
   COMPONENT
========================================================= */

export default function CanvasWorkspace() {
  /* =======================================================
     REFS
  ======================================================= */

  const canvasElementRef =
    useRef<HTMLCanvasElement | null>(null);

  const fabricCanvasRef =
    useRef<fabric.Canvas | null>(null);

  const initializedRef =
    useRef(false);

  const rulerTopRef = useRef<HTMLDivElement | null>(null);
  const rulerLeftRef = useRef<HTMLDivElement | null>(null);

  /* =======================================================
     STATE
  ======================================================= */

  const [canvas, setCanvasLocal] =
    useState<fabric.Canvas | null>(null);

  const [isReady, setIsReady] =
    useState(false);

  const [currentZoom, setCurrentZoom] =
    useState(1);

  const [showRulers, setShowRulers] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapToObjects, setSnapToObjects] = useState(true);

  const [guides, setGuides] = useState<GuideLine[]>([]);
  const [snapLines, setSnapLines] = useState<{
    horizontal: number[];
    vertical: number[];
  }>({ horizontal: [], vertical: [] });

  /* =======================================================
     ZUSTAND
  ======================================================= */

  const setCanvas =
    useEditorStore(
      (state) => state.setCanvas
    );

  const saveHistory =
    useEditorStore(
      (state) => state.saveHistory
    );

  const refreshLayers =
    useEditorStore(
      (state) => state.refreshLayers
    );

  const setActiveObject =
    useEditorStore(
      (state) => state.setActiveObject
    );

  const clearActiveProperties =
    useEditorStore(
      (state) => state.clearActiveProperties
    );

  const updateActiveProperties =
    useEditorStore(
      (state) =>
        state.updateActiveProperties
    );

  const storeZoom =
    useEditorStore(
      (state) => state.zoom
    );

  const canvasWidth =
    useEditorStore(
      (state) => state.canvasWidth
    );

  const canvasHeight =
    useEditorStore(
      (state) => state.canvasHeight
    );

  /* =======================================================
     SELECTION CALLBACKS
  ======================================================= */

  const handleSelectionChange =
    useCallback(
      (
        selectedObject:
          | fabric.FabricObject
          | null
      ) => {
        if (!selectedObject) {
          clearActiveProperties();
          return;
        }

        setActiveObject(
          selectedObject
        );

        refreshLayers();
      },
      [
        clearActiveProperties,
        refreshLayers,
        setActiveObject,
      ]
    );

  const handleObjectModified =
    useCallback(
      (
        object: fabric.FabricObject
      ) => {
        setActiveObject(object);
        refreshLayers();

        setTimeout(() => {
          saveHistory();
        }, 0);
      },
      [
        refreshLayers,
        saveHistory,
        setActiveObject,
      ]
    );

  const handleObjectMoving =
    useCallback(
      (
        object: fabric.FabricObject
      ) => {
        updateActiveProperties({
          left: object.left ?? 0,
          top: object.top ?? 0,
        });
      },
      [updateActiveProperties]
    );

  const handleObjectScaling =
    useCallback(
      (
        object: fabric.FabricObject
      ) => {
        updateActiveProperties({
          scaleX:
            object.scaleX ?? 1,

          scaleY:
            object.scaleY ?? 1,

          width:
            object.width ?? 0,

          height:
            object.height ?? 0,
        });
      },
      [updateActiveProperties]
    );

  const handleObjectRotating =
    useCallback(
      (
        object: fabric.FabricObject
      ) => {
        updateActiveProperties({
          angle:
            object.angle ?? 0,
        });
      },
      [updateActiveProperties]
    );

  /* =======================================================
     CANVAS SELECTION HOOK
  ======================================================= */

  const {
    deselect,
  } = useCanvasSelection(
    canvas,
    {
      onSelectionChange:
        handleSelectionChange,

      onObjectModified:
        handleObjectModified,

      onObjectMoving:
        handleObjectMoving,

      onObjectScaling:
        handleObjectScaling,

      onObjectRotating:
        handleObjectRotating,
    }
  );

  /* =======================================================
     HISTORY
  ======================================================= */

  const saveCanvasHistory =
    useCallback(() => {
      setTimeout(() => {
        saveHistory();
        refreshLayers();
      }, 0);
    }, [
      saveHistory,
      refreshLayers,
    ]);

  /* =======================================================
     ADD TEXT
  ======================================================= */

  const addText =
    useCallback(() => {
      const fabricCanvas =
        fabricCanvasRef.current;

      if (!fabricCanvas) return;

      const text =
        new fabric.IText(
          "Double Click Text",
          {
            left:
              fabricCanvas.getWidth() /
                2 -
              150,

            top:
              fabricCanvas.getHeight() /
                2 -
              40,

            fontSize: 60,

            fill: "#111827",

            fontWeight: "bold",

            fontFamily: "Arial",

            editable: true,

            selectable: true,

            evented: true,

            originX: "left",

            originY: "top",
          }
        );

      setObjectIdentity(
        text,
        "Text"
      );

      fabricCanvas.add(text);

      fabricCanvas.setActiveObject(
        text
      );

      text.enterEditing();

      fabricCanvas.requestRenderAll();

      saveCanvasHistory();
    }, [saveCanvasHistory]);

  /* =======================================================
     ADD RECTANGLE
  ======================================================= */

  const addRectangle =
    useCallback(() => {
      const fabricCanvas =
        fabricCanvasRef.current;

      if (!fabricCanvas) return;

      const rectangle =
        new fabric.Rect({
          left:
            fabricCanvas.getWidth() /
              2 -
            125,

          top:
            fabricCanvas.getHeight() /
              2 -
            75,

          width: 250,

          height: 150,

          fill: "#6366f1",

          rx: 20,

          ry: 20,

          selectable: true,

          evented: true,
        });

      setObjectIdentity(
        rectangle,
        "Rectangle"
      );

      fabricCanvas.add(
        rectangle
      );

      fabricCanvas.setActiveObject(
        rectangle
      );

      fabricCanvas.requestRenderAll();

      saveCanvasHistory();
    }, [saveCanvasHistory]);

  /* =======================================================
     ADD CIRCLE
  ======================================================= */

  const addCircle =
    useCallback(() => {
      const fabricCanvas =
        fabricCanvasRef.current;

      if (!fabricCanvas) return;

      const circle =
        new fabric.Circle({
          left:
            fabricCanvas.getWidth() /
              2 -
            80,

          top:
            fabricCanvas.getHeight() /
              2 -
            80,

          radius: 80,

          fill: "#ec4899",

          selectable: true,

          evented: true,
        });

      setObjectIdentity(
        circle,
        "Circle"
      );

      fabricCanvas.add(circle);

      fabricCanvas.setActiveObject(
        circle
      );

      fabricCanvas.requestRenderAll();

      saveCanvasHistory();
    }, [saveCanvasHistory]);

  /* =======================================================
     ADD TRIANGLE
  ======================================================= */

  const addTriangle =
    useCallback(() => {
      const fabricCanvas =
        fabricCanvasRef.current;

      if (!fabricCanvas) return;

      const triangle =
        new fabric.Triangle({
          left:
            fabricCanvas.getWidth() /
              2 -
            90,

          top:
            fabricCanvas.getHeight() /
              2 -
            90,

          width: 180,

          height: 180,

          fill: "#10b981",

          selectable: true,

          evented: true,
        });

      setObjectIdentity(
        triangle,
        "Triangle"
      );

      fabricCanvas.add(
        triangle
      );

      fabricCanvas.setActiveObject(
        triangle
      );

      fabricCanvas.requestRenderAll();

      saveCanvasHistory();
    }, [saveCanvasHistory]);

  /* =======================================================
     ADD LINE
  ======================================================= */

  const addLine =
    useCallback(() => {
      const fabricCanvas =
        fabricCanvasRef.current;

      if (!fabricCanvas) return;

      const centerX =
        fabricCanvas.getWidth() /
        2;

      const centerY =
        fabricCanvas.getHeight() /
        2;

      const line =
        new fabric.Line(
          [
            centerX - 150,
            centerY,
            centerX + 150,
            centerY,
          ],
          {
            stroke: "#111827",

            strokeWidth: 8,

            selectable: true,

            evented: true,
          }
        );

      setObjectIdentity(
        line,
        "Line"
      );

      fabricCanvas.add(line);

      fabricCanvas.setActiveObject(
        line
      );

      fabricCanvas.requestRenderAll();

      saveCanvasHistory();
    }, [saveCanvasHistory]);

  /* =======================================================
     BACKGROUND
  ======================================================= */

  const setBackground =
    useCallback(
      (color: string) => {
        const fabricCanvas =
          fabricCanvasRef.current;

        if (!fabricCanvas) return;

        fabricCanvas.backgroundColor =
          color;

        fabricCanvas.requestRenderAll();

        saveCanvasHistory();
      },
      [saveCanvasHistory]
    );

  /* =======================================================
     UPLOAD IMAGE FILE
  ======================================================= */

  const uploadImageFile =
    useCallback(
      async (file: File) => {
        const fabricCanvas =
          fabricCanvasRef.current;

        if (!fabricCanvas) return;

        if (
          !file.type.startsWith(
            "image/"
          )
        ) {
          console.error(
            "Selected file is not an image."
          );

          return;
        }

        try {
          const imageURL =
            URL.createObjectURL(
              file
            );

          const image =
            await fabric.FabricImage.fromURL(
              imageURL
            );

          URL.revokeObjectURL(
            imageURL
          );

          if (
            image.width &&
            image.width > 600
          ) {
            image.scaleToWidth(
              600
            );
          }

          const imageWidth =
            image.getScaledWidth();

          const imageHeight =
            image.getScaledHeight();

          image.set({
            left:
              (fabricCanvas.getWidth() -
                imageWidth) /
              2,

            top:
              (fabricCanvas.getHeight() -
                imageHeight) /
              2,

            selectable: true,

            evented: true,
          });

          setObjectIdentity(
            image,
            "Image"
          );

          fabricCanvas.add(image);

          fabricCanvas.setActiveObject(
            image
          );

          fabricCanvas.requestRenderAll();

          saveCanvasHistory();
        } catch (error) {
          console.error(
            "Image loading error:",
            error
          );
        }
      },
      [saveCanvasHistory]
    );

  /* =======================================================
     INITIALIZE FABRIC
  ======================================================= */

  useEffect(() => {
    const element =
      canvasElementRef.current;

    if (!element) return;

    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

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

    const fabricCanvas =
      new fabric.Canvas(
        element,
        {
          width:
            canvasWidth,

          height:
            canvasHeight,

          backgroundColor:
            "#ffffff",

          preserveObjectStacking:
            true,

          selection: true,

          stopContextMenu:
            true,

          snapAngle: 5,

          snapThreshold: 10,
        }
      );

    fabricCanvasRef.current =
      fabricCanvas;

    setCanvasLocal(
      fabricCanvas
    );

    setCanvas(
      fabricCanvas
    );

    fabricCanvas.setZoom(1);

    setCurrentZoom(1);

    setIsReady(true);

    fabricCanvas.requestRenderAll();

    const handleObjectAdded =
      (
        event: {
          target?: fabric.FabricObject | null;
        }
      ) => {
        const object =
          event.target;

        if (!object) return;

        setObjectIdentity(
          object,
          getDefaultObjectName(
            object
          )
        );

        refreshLayers();
      };

    const handleObjectRemoved =
      () => {
        refreshLayers();
      };

    fabricCanvas.on(
      "object:added",
      handleObjectAdded
    );

    fabricCanvas.on(
      "object:removed",
      handleObjectRemoved
    );

    setTimeout(() => {
      saveHistory();
      refreshLayers();
    }, 100);

    return () => {
      fabricCanvas.off(
        "object:added",
        handleObjectAdded
      );

      fabricCanvas.off(
        "object:removed",
        handleObjectRemoved
      );

      fabricCanvas.dispose();

      fabricCanvasRef.current =
        null;

      setCanvasLocal(null);

      setCanvas(null);

      initializedRef.current =
        false;

      setIsReady(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =======================================================
     CANVAS SIZE
  ======================================================= */

  useEffect(() => {
    const fabricCanvas =
      fabricCanvasRef.current;

    if (!fabricCanvas) return;

    if (
      canvasWidth <= 0 ||
      canvasHeight <= 0
    ) {
      return;
    }

    fabricCanvas.setDimensions({
      width: canvasWidth,
      height: canvasHeight,
    });

    fabricCanvas.requestRenderAll();

    refreshLayers();
  }, [
    canvasWidth,
    canvasHeight,
    refreshLayers,
  ]);

  /* =======================================================
     WINDOW EVENTS
  ======================================================= */

  useEffect(() => {
    const handleAddText =
      () => addText();

    const handleAddRectangle =
      () => addRectangle();

    const handleAddCircle =
      () => addCircle();

    const handleAddTriangle =
      () => addTriangle();

    const handleAddLine =
      () => addLine();

    const handleSetBackground =
      (event: Event) => {
        const customEvent =
          event as CustomEvent<{
            color?: string;
          }>;

        const color =
          customEvent.detail?.color;

        if (!color) return;

        setBackground(color);
      };

    const handleUploadImage =
      (event: Event) => {
        const customEvent =
          event as CustomEvent<File>;

        const file =
          customEvent.detail;

        if (!file) return;

        void uploadImageFile(
          file
        );
      };

    window.addEventListener(
      "editor:add-text",
      handleAddText
    );

    window.addEventListener(
      "editor:add-rectangle",
      handleAddRectangle
    );

    window.addEventListener(
      "editor:add-circle",
      handleAddCircle
    );

    window.addEventListener(
      "editor:add-triangle",
      handleAddTriangle
    );

    window.addEventListener(
      "editor:add-line",
      handleAddLine
    );

    window.addEventListener(
      "editor:set-background",
      handleSetBackground
    );

    window.addEventListener(
      "editor:upload-image",
      handleUploadImage
    );

    return () => {
      window.removeEventListener(
        "editor:add-text",
        handleAddText
      );

      window.removeEventListener(
        "editor:add-rectangle",
        handleAddRectangle
      );

      window.removeEventListener(
        "editor:add-circle",
        handleAddCircle
      );

      window.removeEventListener(
        "editor:add-triangle",
        handleAddTriangle
      );

      window.removeEventListener(
        "editor:add-line",
        handleAddLine
      );

      window.removeEventListener(
        "editor:set-background",
        handleSetBackground
      );

      window.removeEventListener(
        "editor:upload-image",
        handleUploadImage
      );
    };
  }, [
    addText,
    addRectangle,
    addCircle,
    addTriangle,
    addLine,
    setBackground,
    uploadImageFile,
  ]);

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteObject =
    useCallback(() => {
      const fabricCanvas =
        fabricCanvasRef.current;

      if (!fabricCanvas) return;

      const activeObject =
        fabricCanvas.getActiveObject();

      if (!activeObject) return;

      if (
        activeObject.type ===
          "activeSelection" &&
        "getObjects" in activeObject
      ) {
        const selectionObject =
          activeObject as fabric.FabricObject & {
            getObjects(): fabric.Object[];
          };
        const objects =
          selectionObject.getObjects();

        fabricCanvas.discardActiveObject();

        objects.forEach(
          (object: fabric.Object) => {
            fabricCanvas.remove(
              object
            );
          }
        );
      } else {
        fabricCanvas.remove(
          activeObject
        );

        fabricCanvas.discardActiveObject();
      }

      fabricCanvas.requestRenderAll();

      clearActiveProperties();

      refreshLayers();

      saveCanvasHistory();
    }, [
      clearActiveProperties,
      refreshLayers,
      saveCanvasHistory,
    ]);

  /* =======================================================
     DUPLICATE
  ======================================================= */

  const duplicateObject =
    useCallback(async () => {
      const fabricCanvas =
        fabricCanvasRef.current;

      if (!fabricCanvas) return;

      const activeObject =
        fabricCanvas.getActiveObject();

      if (!activeObject) return;

      try {
        const cloned =
          await activeObject.clone();

        const original =
          activeObject as FabricObjectWithCustomData;

        setObjectIdentity(
          cloned,
          `${
            original.name ??
            "Object"
          } Copy`
        );

        cloned.set({
          left:
            (activeObject.left ??
              0) + 30,

          top:
            (activeObject.top ??
              0) + 30,
        });

        fabricCanvas.add(
          cloned
        );

        fabricCanvas.setActiveObject(
          cloned
        );

        fabricCanvas.requestRenderAll();

        setActiveObject(
          cloned
        );

        saveCanvasHistory();
      } catch (error) {
        console.error(
          "Duplicate error:",
          error
        );
      }
    }, [
      saveCanvasHistory,
      setActiveObject,
    ]);

  /* =======================================================
     ZOOM
  ======================================================= */

  const zoomIn =
    useCallback(() => {
      const next =
        Math.min(
          currentZoom + 0.1,
          3
        );

      setCurrentZoom(next);

      useEditorStore
        .getState()
        .setZoom(next);
    }, [currentZoom]);

  const zoomOut =
    useCallback(() => {
      const next =
        Math.max(
          currentZoom - 0.1,
          0.2
        );

      setCurrentZoom(next);

      useEditorStore
        .getState()
        .setZoom(next);
    }, [currentZoom]);

  const resetZoom =
    useCallback(() => {
      setCurrentZoom(1);

      useEditorStore
        .getState()
        .setZoom(1);
    }, []);

  /* =======================================================
     STORE ZOOM -> FABRIC
  ======================================================= */

  useEffect(() => {
    const fabricCanvas =
      fabricCanvasRef.current;

    if (!fabricCanvas) return;

    if (
      typeof storeZoom !==
        "number" ||
      storeZoom <= 0
    ) {
      return;
    }

    if (
      Math.abs(
        fabricCanvas.getZoom() -
          storeZoom
      ) < 0.001
    ) {
      return;
    }

    fabricCanvas.setZoom(
      storeZoom
    );

    fabricCanvas.requestRenderAll();

    setCurrentZoom(
      storeZoom
    );
  }, [storeZoom]);

  /* =======================================================
     SNAPPING & GUIDES
  ======================================================= */

  const calculateSnapTargets = useCallback(
    (
      movingObject: fabric.FabricObject
    ): SnapTarget[] => {
      const fabricCanvas =
        fabricCanvasRef.current;
      if (!fabricCanvas) return [];

      const targets: SnapTarget[] = [];
      const zoom = fabricCanvas.getZoom();

      // Canvas center snap
      const canvasCenterX = canvasWidth / 2;
      const canvasCenterY = canvasHeight / 2;
      targets.push(
        { x: canvasCenterX, y: canvasCenterY, type: "center" }
      );

      // Canvas edges
      targets.push(
        { x: 0, y: 0, type: "edge" },
        { x: canvasWidth, y: 0, type: "edge" },
        { x: 0, y: canvasHeight, type: "edge" },
        { x: canvasWidth, y: canvasHeight, type: "edge" }
      );

      // Object snapping
      if (snapToObjects) {
        fabricCanvas.getObjects().forEach((obj) => {
          if (obj === movingObject) return;
          if (obj.type === "activeSelection") return;

          const objLeft = obj.left ?? 0;
          const objTop = obj.top ?? 0;
          const objWidth = obj.getScaledWidth?.() ?? obj.width ?? 0;
          const objHeight = obj.getScaledHeight?.() ?? obj.height ?? 0;

          // Object edges and centers
          targets.push(
            { x: objLeft, y: objTop, type: "object" },
            { x: objLeft + objWidth, y: objTop, type: "object" },
            { x: objLeft, y: objTop + objHeight, type: "object" },
            { x: objLeft + objWidth, y: objTop + objHeight, type: "object" },
            { x: objLeft + objWidth / 2, y: objTop + objHeight / 2, type: "center" }
          );
        });
      }

      return targets;
    },
    [canvasWidth, canvasHeight, snapToObjects]
  );

  const findSnapPosition = useCallback(
    (
      movingObject: fabric.FabricObject,
      proposedLeft: number,
      proposedTop: number
    ): { left: number; top: number; guides: GuideLine[] } => {
      const fabricCanvas =
        fabricCanvasRef.current;
      if (!fabricCanvas) {
        return { left: proposedLeft, top: proposedTop, guides: [] };
      }

      const zoom = fabricCanvas.getZoom();
      const threshold = 8 / zoom;
      const targets = calculateSnapTargets(movingObject);

      const objWidth = movingObject.getScaledWidth?.() ?? movingObject.width ?? 0;
      const objHeight = movingObject.getScaledHeight?.() ?? movingObject.height ?? 0;

      const objLeft = proposedLeft;
      const objTop = proposedTop;
      const objRight = objLeft + objWidth;
      const objBottom = objTop + objHeight;
      const objCenterX = objLeft + objWidth / 2;
      const objCenterY = objTop + objHeight / 2;

      let snappedLeft = objLeft;
      let snappedTop = objTop;
      const newGuides: GuideLine[] = [];

      // Check horizontal snapping
      targets.forEach((target) => {
        // Left edge
        if (Math.abs(objLeft - target.x) < threshold) {
          snappedLeft = target.x;
          newGuides.push({
            type: "vertical",
            position: target.x,
            isCenter: target.type === "center",
          });
        }
        // Right edge
        if (Math.abs(objRight - target.x) < threshold) {
          snappedLeft = target.x - objWidth;
          newGuides.push({
            type: "vertical",
            position: target.x,
            isCenter: target.type === "center",
          });
        }
        // Center X
        if (Math.abs(objCenterX - target.x) < threshold) {
          snappedLeft = target.x - objWidth / 2;
          newGuides.push({
            type: "vertical",
            position: target.x,
            isCenter: true,
          });
        }

        // Top edge
        if (Math.abs(objTop - target.y) < threshold) {
          snappedTop = target.y;
          newGuides.push({
            type: "horizontal",
            position: target.y,
            isCenter: target.type === "center",
          });
        }
        // Bottom edge
        if (Math.abs(objBottom - target.y) < threshold) {
          snappedTop = target.y - objHeight;
          newGuides.push({
            type: "horizontal",
            position: target.y,
            isCenter: target.type === "center",
          });
        }
        // Center Y
        if (Math.abs(objCenterY - target.y) < threshold) {
          snappedTop = target.y - objHeight / 2;
          newGuides.push({
            type: "horizontal",
            position: target.y,
            isCenter: true,
          });
        }
      });

      // Grid snapping
      if (snapToGrid) {
        const gridSize = 20;
        const gridLeft = Math.round(objLeft / gridSize) * gridSize;
        const gridTop = Math.round(objTop / gridSize) * gridSize;

        if (Math.abs(objLeft - gridLeft) < threshold) {
          snappedLeft = gridLeft;
        }
        if (Math.abs(objTop - gridTop) < threshold) {
          snappedTop = gridTop;
        }
      }

      return { left: snappedLeft, top: snappedTop, guides: newGuides };
    },
    [calculateSnapTargets, snapToGrid]
  );

  /* =======================================================
     MOUSE MOVE FOR GUIDES
  ======================================================= */

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;

    const handleMouseMove = (opt: { scenePoint: { x: number; y: number } }) => {
      if (!fabricCanvas) return;

      const pointer = opt.scenePoint;
      if (!pointer) return;

      // Update ruler cursors
      if (rulerTopRef.current) {
        rulerTopRef.current.style.setProperty(
          "--cursor-x",
          `${pointer.x}px`
        );
      }
      if (rulerLeftRef.current) {
        rulerLeftRef.current.style.setProperty(
          "--cursor-y",
          `${pointer.y}px`
        );
      }
    };

    fabricCanvas.on("mouse:move", handleMouseMove);

    return () => {
      fabricCanvas.off("mouse:move", handleMouseMove);
    };
  }, []);

  /* =======================================================
     OBJECT MOVING - SNAPPING
  ======================================================= */

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas) return;

    const handleObjectMoving = (
      opt: { target?: fabric.FabricObject }
    ) => {
      const movingObject = opt.target;
      if (!movingObject) return;

      const { left, top, guides } = findSnapPosition(
        movingObject,
        movingObject.left ?? 0,
        movingObject.top ?? 0
      );

      if (guides.length > 0) {
        setGuides(guides);
      } else {
        setGuides([]);
      }

      movingObject.set({ left, top });
    };

    const handleObjectMoveEnd = () => {
      setGuides([]);
    };

    fabricCanvas.on(
      "object:moving",
      handleObjectMoving
    );
    fabricCanvas.on(
      "object:modified",
      handleObjectMoveEnd
    );

    return () => {
      fabricCanvas.off(
        "object:moving",
        handleObjectMoving
      );
      fabricCanvas.off(
        "object:modified",
        handleObjectMoveEnd
      );
    };
  }, [findSnapPosition]);

  /* =======================================================
     KEYBOARD SHORTCUTS
  ======================================================= */

  useEffect(() => {
    const handleKeyboard =
      async (
        event: KeyboardEvent
      ) => {
        const fabricCanvas =
          fabricCanvasRef.current;

        if (!fabricCanvas) return;

        const target =
          event.target as HTMLElement;

        const isTyping =
          target.tagName ===
            "INPUT" ||
          target.tagName ===
            "TEXTAREA" ||
          target.isContentEditable;

        if (
          !isTyping &&
          (
            event.key ===
              "Delete" ||
            event.key ===
              "Backspace"
          )
        ) {
          event.preventDefault();

          deleteObject();

          return;
        }

        if (
          event.key ===
          "Escape"
        ) {
          deselect();

          return;
        }

        if (
          !isTyping &&
          (
            event.ctrlKey ||
            event.metaKey
          ) &&
          event.key.toLowerCase() ===
            "d"
        ) {
          event.preventDefault();

          await duplicateObject();

          return;
        }

        if (
          !isTyping &&
          (
            event.ctrlKey ||
            event.metaKey
          ) &&
          event.key.toLowerCase() ===
            "z"
        ) {
          event.preventDefault();

          await useEditorStore
            .getState()
            .undo();

          return;
        }

        if (
          !isTyping &&
          (
            event.ctrlKey ||
            event.metaKey
          ) &&
          event.key.toLowerCase() ===
            "y"
        ) {
          event.preventDefault();

          await useEditorStore
            .getState()
            .redo();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [
    deleteObject,
    duplicateObject,
    deselect,
  ]);

  /* =======================================================
     RULER MARKS
  ======================================================= */

  const rulerMarks = useMemo(() => {
    const marks: number[] = [];
    const step = 50;
    const max = Math.max(canvasWidth, canvasHeight);
    for (let i = 0; i <= max; i += step) {
      marks.push(i);
    }
    return marks;
  }, [canvasWidth, canvasHeight]);

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-[#f1f2f4]">
      {/* =================================================
          RULERS
      ================================================= */}

      {showRulers && (
        <>
          {/* Top Ruler */}
          <div
            ref={rulerTopRef}
            className="absolute top-0 left-0 right-0 h-8 bg-white border-b border-slate-200 z-10 pointer-events-none select-none"
            style={{ width: canvasWidth }}
          >
            {rulerMarks.map((mark) => (
              <div
                key={mark}
                className="absolute top-0 h-full"
                style={{
                  left: mark,
                  borderLeft: "1px solid #e2e8f0",
                }}
              >
                {mark % 100 === 0 && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-500"
                  >
                    {mark}
                  </span>
                )}
              </div>
            ))}
            {/* Cursor indicator */}
            <div
              className="absolute top-0 bottom-0 w-px bg-indigo-500 pointer-events-none"
              style={{
                left: "var(--cursor-x, 0)",
                transform: "translateX(-50%)",
              }}
            />
          </div>

          {/* Left Ruler */}
          <div
            ref={rulerLeftRef}
            className="absolute top-0 left-0 bottom-0 w-8 bg-white border-r border-slate-200 z-10 pointer-events-none select-none"
            style={{ height: canvasHeight }}
          >
            {rulerMarks.map((mark) => (
              <div
                key={mark}
                className="absolute left-0 w-full"
                style={{
                  top: mark,
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                {mark % 100 === 0 && (
                  <span
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-slate-500"
                  >
                    {mark}
                  </span>
                )}
              </div>
            ))}
            {/* Cursor indicator */}
            <div
              className="absolute left-0 right-0 h-px bg-indigo-500 pointer-events-none"
              style={{
                top: "var(--cursor-y, 0)",
                transform: "translateY(-50%)",
              }}
            />
          </div>
        </>
      )}

      {/* =================================================
          GRID OVERLAY
      ================================================= */}

      {showGrid && (
        <div
          className="absolute inset-0 z-5 pointer-events-none"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            backgroundImage: `
              linear-gradient(to right, #e2e8f0 1px, transparent 1px),
              linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      )}

      {/* =================================================
          SNAP GUIDES
      ================================================= */}

      {guides.map((guide, index) => (
        <div
          key={index}
          className="absolute z-20 pointer-events-none"
          style={{
            ...(guide.type === "horizontal"
              ? {
                  top: guide.position,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: guide.isCenter
                    ? "#3b82f6"
                    : "#22c55e",
                }
              : {
                  left: guide.position,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: guide.isCenter
                    ? "#3b82f6"
                    : "#22c55e",
                }),
          }}
        />
      ))}

      {/* =================================================
          TOP TOOLBAR
      ================================================= */}

      <div
        className="absolute top-4 left-1/2 z-40 -translate-x-1/2 flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
      >
        {/* SELECT */}
        <button
          type="button"
          onClick={deselect}
          title="Select (V)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <MousePointer2 size={17} />
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* TEXT */}
        <button
          type="button"
          onClick={addText}
          disabled={!isReady}
          title="Add text (T)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Type size={18} />
        </button>

        {/* RECTANGLE */}
        <button
          type="button"
          onClick={addRectangle}
          disabled={!isReady}
          title="Add rectangle (R)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Square size={18} />
        </button>

        {/* CIRCLE */}
        <button
          type="button"
          onClick={addCircle}
          disabled={!isReady}
          title="Add circle (C)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Circle size={18} />
        </button>

        {/* TRIANGLE */}
        <button
          type="button"
          onClick={addTriangle}
          disabled={!isReady}
          title="Add triangle"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Triangle size={18} />
        </button>

        {/* LINE */}
        <button
          type="button"
          onClick={addLine}
          disabled={!isReady}
          title="Add line (L)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="block h-0.5 w-5 rotate-[-25deg] bg-current" />
        </button>

        {/* IMAGE UPLOAD */}
        <label
          title="Upload image"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <ImagePlus size={18} />
          <input
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void uploadImageFile(file);
              }
              event.target.value = "";
            }}
          />
        </label>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* DUPLICATE */}
        <button
          type="button"
          onClick={duplicateObject}
          disabled={!isReady}
          title="Duplicate (⌘D)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:opacity-40"
        >
          <Copy size={17} />
        </button>

        {/* DELETE */}
        <button
          type="button"
          onClick={deleteObject}
          disabled={!isReady}
          title="Delete (Del)"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
        >
          <Trash2 size={17} />
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* GRID TOGGLE */}
        <button
          type="button"
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle grid"
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
            showGrid
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[1px] bg-slate-300" />
          </div>
        </button>

        {/* RULERS TOGGLE */}
        <button
          type="button"
          onClick={() => setShowRulers(!showRulers)}
          title="Toggle rulers"
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
            showRulers
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="3" x2="21" y2="3" />
            <line x1="3" y1="3" x2="3" y2="21" />
            <line x1="19" y1="19" x2="21" y2="21" />
            <line x1="19" y1="19" x2="19" y2="21" />
          </svg>
        </button>

        {/* SNAP TOGGLE */}
        <button
          type="button"
          onClick={() => setSnapToObjects(!snapToObjects)}
          title="Toggle snap to objects"
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${
            snapToObjects
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <path d="M8 12h8M12 8v8" />
          </svg>
        </button>
      </div>

      {/* =================================================
          CANVAS AREA
      ================================================= */}

      <div
        className={`flex min-h-0 flex-1 items-center justify-center overflow-auto p-12 ${
          showRulers ? "pt-8 pl-8" : ""
        }`}
      >
        <div
          className="relative shrink-0 bg-white shadow-[0_12px_50px_rgba(0,0,0,0.18)]"
          style={{
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          <canvas ref={canvasElementRef} />
        </div>
      </div>

      {/* =================================================
          ZOOM BAR
      ================================================= */}

      <div
        className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2 flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
      >
        <button
          type="button"
          onClick={zoomOut}
          title="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <Minus size={16} />
        </button>

        <button
          type="button"
          onClick={resetZoom}
          title="Reset zoom"
          className="min-w-[58px] rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {Math.round(currentZoom * 100)}%
        </button>

        <button
          type="button"
          onClick={zoomIn}
          title="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <Plus size={16} />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        <button
          type="button"
          onClick={resetZoom}
          title="Fit to screen (⌘0)"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}