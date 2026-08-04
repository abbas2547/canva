"use client";

import * as fabric from "fabric";
import { useCallback } from "react";
import FontFaceObserver from "fontfaceobserver";
import { useEditorStore } from "@/store/editorStore";

// Define a helper type to access our custom data property safely
type FabricObjectWithData = fabric.Object & {
  data?: { id: string };
};

export const useFabricEditor = () => {
  const { canvas, setCanvas, setSelectedElementId } = useEditorStore();

  // 1. INITIALIZE CANVAS
  const init = useCallback((el: HTMLCanvasElement) => {
    const fabricCanvas = new fabric.Canvas(el, {
      width: 900,
      height: 600,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });
    
    setCanvas(fabricCanvas);

    // Fixed: Properly typed event for selection
    fabricCanvas.on("selection:created", (options) => {
      const selected = options.selected?.[0] as FabricObjectWithData;
      if (selected?.data?.id) {
        setSelectedElementId(selected.data.id);
      }
    });

    fabricCanvas.on("selection:updated", (options) => {
      const selected = options.selected?.[0] as FabricObjectWithData;
      if (selected?.data?.id) {
        setSelectedElementId(selected.data.id);
      }
    });

    fabricCanvas.on("selection:cleared", () => {
      setSelectedElementId(null);
    });

    return () => {
      fabricCanvas.dispose();
      setCanvas(null); // Clean up store on unmount
    };
  }, [setCanvas, setSelectedElementId]);

  // 2. ADD TEXT WITH GOOGLE FONTS
  const addText = useCallback(async (content: string, options: Partial<fabric.ITextProps> = {}) => {
    if (!canvas) return;

    const fontFamily = (options.fontFamily as string) || "Inter";

    // Inject Google Font link if it doesn't exist
    if (typeof window !== "undefined" && fontFamily !== "Arial") {
      const fontId = `font-${fontFamily.replace(/\s+/g, "-")}`;
      if (!document.getElementById(fontId)) {
        const link = document.createElement("link");
        link.id = fontId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, "+")}:wght@400;700&display=swap`;
        document.head.appendChild(link);
      }
    }

    const font = new FontFaceObserver(fontFamily);

    try {
      await font.load(null, 3000); 
      
      const text = new fabric.IText(content, {
        left: 150,
        top: 150,
        fontSize: 40,
        fill: "#000000",
        fontFamily: fontFamily,
        ...options,
      });
      
      // Fixed: Assign ID to data property safely
      (text as FabricObjectWithData).data = { id: crypto.randomUUID() };

      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    } catch (e) {
      console.warn("Font load timeout, using fallback", e);
      const fallbackText = new fabric.IText(content, {
        ...options,
        fontFamily: "Arial",
      });
      (fallbackText as FabricObjectWithData).data = { id: crypto.randomUUID() };
      canvas.add(fallbackText);
      canvas.renderAll();
    }
  }, [canvas]);

  // 3. ADD SHAPES
  const addShape = useCallback((type: 'rect' | 'circle' | 'triangle') => {
    if (!canvas) return;

    const commonProps = {
      left: 100,
      top: 100,
      fill: "#3b82f6",
      strokeWidth: 0,
    };

    let shape: fabric.Object;

    switch (type) {
      case "rect":
        shape = new fabric.Rect({
          ...commonProps,
          width: 150,
          height: 150,
          rx: 12, 
          ry: 12,
        });
        break;
      case "circle":
        shape = new fabric.Circle({
          ...commonProps,
          radius: 75,
        });
        break;
      case "triangle":
        shape = new fabric.Triangle({
          ...commonProps,
          width: 150,
          height: 150,
        });
        break;
      default:
        return;
    }

    // Fixed: Type-safe data assignment
    const objectWithId = shape as FabricObjectWithData;
    objectWithId.data = { id: crypto.randomUUID() };

    canvas.add(shape);
    canvas.setActiveObject(shape);
    
    if (objectWithId.data.id) {
       setSelectedElementId(objectWithId.data.id);
    }
    
    canvas.renderAll();
  }, [canvas, setSelectedElementId]);

  return { 
    init, 
    addText, 
    addShape 
  };
};