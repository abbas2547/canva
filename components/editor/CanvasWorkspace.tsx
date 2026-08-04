"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
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
  Type,
} from "lucide-react";

import { useEditorStore } from "@/store/editorStore";

export default function CanvasWorkspace() {
  /*
  ============================================================
  REFS
  ============================================================
  */

  const canvasElementRef =
    useRef<HTMLCanvasElement | null>(null);

  const fabricCanvasRef =
    useRef<fabric.Canvas | null>(null);

  const initializedRef =
    useRef(false);

  /*
  ============================================================
  LOCAL STATE
  ============================================================
  */

  const [isReady, setIsReady] =
    useState(false);

  const [currentZoom, setCurrentZoom] =
    useState(1);

  /*
  ============================================================
  ZUSTAND
  ============================================================
  */

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

  const zoom =
    useEditorStore(
      (state) => state.zoom
    );

  /*
  ============================================================
  INITIALIZE FABRIC
  ============================================================
  */

  useEffect(() => {
    if (
      !canvasElementRef.current
    ) {
      return;
    }

    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;

    const fabricCanvas =
      new fabric.Canvas(
        canvasElementRef.current,
        {
          width: 1080,
          height: 1080,

          backgroundColor: "#ffffff",

          preserveObjectStacking: true,

          selection: true,

          stopContextMenu: true,
        }
      );

    fabricCanvasRef.current =
      fabricCanvas;

    /*
    --------------------------------------------
    SAVE TO ZUSTAND
    --------------------------------------------
    */

    setCanvas(fabricCanvas);

    /*
    --------------------------------------------
    OBJECT EVENTS
    --------------------------------------------
    */

    const handleObjectAdded =
      () => {
        saveHistory();
        refreshLayers();
      };

    const handleObjectModified =
      () => {
        saveHistory();
        refreshLayers();
      };

    const handleObjectRemoved =
      () => {
        saveHistory();
        refreshLayers();
      };

    fabricCanvas.on(
      "object:added",
      handleObjectAdded
    );

    fabricCanvas.on(
      "object:modified",
      handleObjectModified
    );

    fabricCanvas.on(
      "object:removed",
      handleObjectRemoved
    );

    /*
    --------------------------------------------
    RENDER
    --------------------------------------------
    */

    fabricCanvas.renderAll();

    setIsReady(true);

    /*
    --------------------------------------------
    CLEANUP
    --------------------------------------------
    */

    return () => {
      fabricCanvas.off(
        "object:added",
        handleObjectAdded
      );

      fabricCanvas.off(
        "object:modified",
        handleObjectModified
      );

      fabricCanvas.off(
        "object:removed",
        handleObjectRemoved
      );

      fabricCanvas.dispose();

      fabricCanvasRef.current =
        null;

      initializedRef.current =
        false;

      setIsReady(false);

      setCanvas(null);
    };
  }, [
    refreshLayers,
    saveHistory,
    setCanvas,
  ]);

  /*
  ============================================================
  ADD TEXT
  ============================================================
  */

  const addText =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      const text =
        new fabric.IText(
          "Double Click Text",
          {
            left: 200,
            top: 200,

            fontSize: 60,

            fill: "#111827",

            fontWeight: "bold",

            fontFamily: "Arial",

            editable: true,
          }
        );

      canvas.add(text);

      canvas.setActiveObject(text);

      text.enterEditing();

      text.selectAll();

      canvas.renderAll();

      refreshLayers();
    }, [refreshLayers]);

  /*
  ============================================================
  ADD RECTANGLE
  ============================================================
  */

  const addRectangle =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      const rect =
        new fabric.Rect({
          left: 250,
          top: 250,

          width: 250,
          height: 150,

          fill: "#6366f1",

          rx: 20,
          ry: 20,
        });

      canvas.add(rect);

      canvas.setActiveObject(rect);

      canvas.renderAll();

      refreshLayers();
    }, [refreshLayers]);

  /*
  ============================================================
  ADD CIRCLE
  ============================================================
  */

  const addCircle =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      const circle =
        new fabric.Circle({
          left: 300,
          top: 300,

          radius: 80,

          fill: "#ec4899",
        });

      canvas.add(circle);

      canvas.setActiveObject(circle);

      canvas.renderAll();

      refreshLayers();
    }, [refreshLayers]);

  /*
  ============================================================
  UPLOAD IMAGE
  ============================================================
  */

  const uploadImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const canvas =
      fabricCanvasRef.current;

    const file =
      event.target.files?.[0];

    if (!file || !canvas) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = async () => {
      try {
        const result =
          reader.result;

        if (
          typeof result !== "string"
        ) {
          return;
        }

        const image =
          await fabric.FabricImage.fromURL(
            result
          );

        /*
        ----------------------------------------
        SCALE IMAGE
        ----------------------------------------
        */

        if (
          image.width &&
          image.width > 500
        ) {
          image.scaleToWidth(500);
        }

        /*
        ----------------------------------------
        POSITION
        ----------------------------------------
        */

        image.set({
          left: 290,
          top: 290,
        });

        /*
        ----------------------------------------
        ADD
        ----------------------------------------
        */

        canvas.add(image);

        canvas.setActiveObject(
          image
        );

        canvas.renderAll();

        refreshLayers();
      } catch (error) {
        console.error(
          "Image loading error:",
          error
        );
      }
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  /*
  ============================================================
  DELETE OBJECT
  ============================================================
  */

  const deleteObject =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      const activeObject =
        canvas.getActiveObject();

      if (!activeObject) return;

      canvas.remove(activeObject);

      canvas.discardActiveObject();

      canvas.renderAll();

      refreshLayers();
    }, [refreshLayers]);

  /*
  ============================================================
  DUPLICATE OBJECT
  ============================================================
  */

  const duplicateObject =
    useCallback(async () => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      const activeObject =
        canvas.getActiveObject();

      if (!activeObject) return;

      try {
        const cloned =
          await activeObject.clone();

        cloned.set({
          left:
            (activeObject.left ?? 0) +
            30,

          top:
            (activeObject.top ?? 0) +
            30,
        });

        canvas.add(cloned);

        canvas.setActiveObject(
          cloned
        );

        canvas.renderAll();

        refreshLayers();
      } catch (error) {
        console.error(
          "Duplicate error:",
          error
        );
      }
    }, [refreshLayers]);

  /*
  ============================================================
  DESELECT
  ============================================================
  */

  const deselectObject =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      canvas.discardActiveObject();

      canvas.renderAll();
    }, []);

  /*
  ============================================================
  ZOOM IN
  ============================================================
  */

  const zoomIn =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      const current =
        canvas.getZoom();

      const next =
        Math.min(
          current + 0.1,
          2
        );

      canvas.setZoom(next);

      canvas.renderAll();

      setCurrentZoom(next);
    }, []);

  /*
  ============================================================
  ZOOM OUT
  ============================================================
  */

  const zoomOut =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      const current =
        canvas.getZoom();

      const next =
        Math.max(
          current - 0.1,
          0.2
        );

      canvas.setZoom(next);

      canvas.renderAll();

      setCurrentZoom(next);
    }, []);

  /*
  ============================================================
  RESET ZOOM
  ============================================================
  */

  const resetZoom =
    useCallback(() => {
      const canvas =
        fabricCanvasRef.current;

      if (!canvas) return;

      canvas.setZoom(1);

      canvas.renderAll();

      setCurrentZoom(1);
    }, []);

  /*
  ============================================================
  KEYBOARD SHORTCUTS
  ============================================================
  */

  useEffect(() => {
    const handler =
      async (
        event: KeyboardEvent
      ) => {
        const canvas =
          fabricCanvasRef.current;

        if (!canvas) return;

        const target =
          event.target as HTMLElement;

        const isTyping =
          target.tagName ===
            "INPUT" ||
          target.tagName ===
            "TEXTAREA" ||
          target.isContentEditable;

        /*
        DELETE
        */

        if (
          !isTyping &&
          (
            event.key === "Delete" ||
            event.key === "Backspace"
          )
        ) {
          event.preventDefault();

          deleteObject();

          return;
        }

        /*
        ESCAPE
        */

        if (
          event.key === "Escape"
        ) {
          deselectObject();

          return;
        }

        /*
        CTRL/CMD + D
        */

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

        /*
        CTRL/CMD + Z
        */

        if (
          (
            event.ctrlKey ||
            event.metaKey
          ) &&
          event.key.toLowerCase() ===
            "z"
        ) {
          event.preventDefault();

          useEditorStore
            .getState()
            .undo();

          return;
        }

        /*
        CTRL/CMD + Y
        */

        if (
          (
            event.ctrlKey ||
            event.metaKey
          ) &&
          event.key.toLowerCase() ===
            "y"
        ) {
          event.preventDefault();

          useEditorStore
            .getState()
            .redo();

          return;
        }
      };

    window.addEventListener(
      "keydown",
      handler
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [
    deleteObject,
    duplicateObject,
    deselectObject,
  ]);

  /*
  ============================================================
  STORE ZOOM
  ============================================================
  */

  useEffect(() => {
    const canvas =
      fabricCanvasRef.current;

    if (!canvas) return;

    if (
      typeof zoom === "number" &&
      zoom > 0
    ) {
      canvas.setZoom(zoom);

      canvas.renderAll();

      setCurrentZoom(zoom);
    }
  }, [zoom]);

  /*
  ============================================================
  UI
  ============================================================
  */

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#f1f2f4]">

      {/* ======================================================
          TOP FLOATING TOOLBAR
      ====================================================== */}

      <div className="absolute left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">

        {/* SELECT */}

        <button
          type="button"
          onClick={deselectObject}
          title="Select"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <MousePointer2
            size={17}
          />
        </button>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* TEXT */}

        <button
          type="button"
          onClick={addText}
          disabled={!isReady}
          title="Add text"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Type size={18} />
        </button>

        {/* RECTANGLE */}

        <button
          type="button"
          onClick={addRectangle}
          disabled={!isReady}
          title="Add rectangle"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Square size={18} />
        </button>

        {/* CIRCLE */}

        <button
          type="button"
          onClick={addCircle}
          disabled={!isReady}
          title="Add circle"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Circle size={18} />
        </button>

        {/* IMAGE */}

        <label
          title="Upload image"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <ImagePlus size={18} />

          <input
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp"
            onChange={uploadImage}
          />
        </label>

        <div className="mx-1 h-6 w-px bg-slate-200" />

        {/* DUPLICATE */}

        <button
          type="button"
          onClick={duplicateObject}
          title="Duplicate"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <Copy size={17} />
        </button>

        {/* DELETE */}

        <button
          type="button"
          onClick={deleteObject}
          title="Delete"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {/* ======================================================
          CANVAS
      ====================================================== */}

      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-12">

        <div className="relative shrink-0 bg-white shadow-[0_12px_50px_rgba(0,0,0,0.18)]">

          <canvas
            ref={canvasElementRef}
          />

        </div>
      </div>

      {/* ======================================================
          ZOOM BAR
      ====================================================== */}

      <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">

        {/* ZOOM OUT */}

        <button
          type="button"
          onClick={zoomOut}
          title="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <Minus size={16} />
        </button>

        {/* ZOOM VALUE */}

        <button
          type="button"
          onClick={resetZoom}
          title="Reset zoom"
          className="min-w-[58px] rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          {Math.round(
            currentZoom * 100
          )}
          %
        </button>

        {/* ZOOM IN */}

        <button
          type="button"
          onClick={zoomIn}
          title="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <Plus size={16} />
        </button>

        <div className="mx-1 h-5 w-px bg-slate-200" />

        {/* RESET */}

        <button
          type="button"
          onClick={resetZoom}
          title="Reset zoom"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-black"
        >
          <Maximize size={16} />
        </button>
      </div>
    </div>
  );
}

