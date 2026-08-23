"use client";

import {
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";

import type {
  Canvas,
  FabricObject,
} from "fabric";

/* =========================================================
   TYPES
========================================================= */

type CanvasObject = FabricObject;

type CanvasEvent = {
  target?: CanvasObject | null;
};

type ActiveSelectionLike = FabricObject & {
  getObjects(): CanvasObject[];
};

export type CanvasSelectionState = {
  selectedObject: CanvasObject | null;
  selectedObjects: CanvasObject[];
  hasSelection: boolean;
  isMultipleSelection: boolean;
};

type UseCanvasSelectionOptions = {
  onSelectionChange?: (
    selectedObject: CanvasObject | null,
    selectedObjects: CanvasObject[]
  ) => void;

  onObjectModified?: (
    object: CanvasObject
  ) => void;

  onObjectMoving?: (
    object: CanvasObject
  ) => void;

  onObjectScaling?: (
    object: CanvasObject
  ) => void;

  onObjectRotating?: (
    object: CanvasObject
  ) => void;
};

/* =========================================================
   HOOK
========================================================= */

export function useCanvasSelection(
  canvas: Canvas | null,
  options: UseCanvasSelectionOptions = {}
) {
  const {
    onSelectionChange,
    onObjectModified,
    onObjectMoving,
    onObjectScaling,
    onObjectRotating,
  } = options;

  /* =======================================================
     LOCAL SELECTION STATE
  ======================================================= */

  const [selectedObject, setSelectedObject] =
    useState<CanvasObject | null>(null);

  const [selectedObjects, setSelectedObjects] =
    useState<CanvasObject[]>([]);

  const [hasSelection, setHasSelection] =
    useState(false);

  const [isMultipleSelection, setIsMultipleSelection] =
    useState(false);

  /* =======================================================
     GET CURRENT SELECTION
  ======================================================= */

  const getCurrentSelection = useCallback(() => {
    if (!canvas) {
      return {
        object: null,
        objects: [],
      };
    }

    const activeObject =
      canvas.getActiveObject();

    if (!activeObject) {
      return {
        object: null,
        objects: [],
      };
    }

    if (
      activeObject.type === "activeSelection" &&
      "getObjects" in activeObject
    ) {
      const selectionObject =
        activeObject as ActiveSelectionLike;
      const objects =
        selectionObject.getObjects();

      return {
        object: activeObject,
        objects,
      };
    }

    return {
      object: activeObject,
      objects: [activeObject],
    };
  }, [canvas]);

  /* =======================================================
     UPDATE SELECTION STATE
  ======================================================= */

  const updateSelectionState =
    useCallback(() => {
      if (!canvas) {
        setSelectedObject(null);
        setSelectedObjects([]);
        setHasSelection(false);
        setIsMultipleSelection(false);

        onSelectionChange?.(
          null,
          []
        );

        return;
      }

      const {
        object,
        objects,
      } = getCurrentSelection();

      setSelectedObject(object);
      setSelectedObjects(objects);
      setHasSelection(
        objects.length > 0
      );
      setIsMultipleSelection(
        objects.length > 1
      );

      onSelectionChange?.(
        object,
        objects
      );
    }, [
      canvas,
      getCurrentSelection,
      onSelectionChange,
    ]);

  /* =======================================================
     SELECTION CREATED
  ======================================================= */

  const handleSelectionCreated =
    useCallback(() => {
      updateSelectionState();
    }, [
      updateSelectionState,
    ]);

  /* =======================================================
     SELECTION UPDATED
  ======================================================= */

  const handleSelectionUpdated =
    useCallback(() => {
      updateSelectionState();
    }, [
      updateSelectionState,
    ]);

  /* =======================================================
     SELECTION CLEARED
  ======================================================= */

  const handleSelectionCleared =
    useCallback(() => {
      setSelectedObject(null);
      setSelectedObjects([]);
      setHasSelection(false);
      setIsMultipleSelection(false);

      onSelectionChange?.(
        null,
        []
      );
    }, [
      onSelectionChange,
    ]);

  /* =======================================================
     OBJECT MODIFIED
  ======================================================= */

  const handleObjectModified =
    useCallback(
      (event: CanvasEvent) => {
        const target =
          event.target;

        if (!target) return;

        updateSelectionState();

        onObjectModified?.(
          target
        );
      },
      [
        updateSelectionState,
        onObjectModified,
      ]
    );

  /* =======================================================
     OBJECT MOVING
  ======================================================= */

  const handleObjectMoving =
    useCallback(
      (event: CanvasEvent) => {
        const target =
          event.target;

        if (!target) return;

        onObjectMoving?.(
          target
        );
      },
      [onObjectMoving]
    );

  /* =======================================================
     OBJECT SCALING
  ======================================================= */

  const handleObjectScaling =
    useCallback(
      (event: CanvasEvent) => {
        const target =
          event.target;

        if (!target) return;

        onObjectScaling?.(
          target
        );
      },
      [onObjectScaling]
    );

  /* =======================================================
     OBJECT ROTATING
  ======================================================= */

  const handleObjectRotating =
    useCallback(
      (event: CanvasEvent) => {
        const target =
          event.target;

        if (!target) return;

        onObjectRotating?.(
          target
        );
      },
      [onObjectRotating]
    );

/* =======================================================
   FABRIC EVENTS
========================================================= */

const canvasRef = useRef<Canvas | null>(canvas);

  useEffect(() => {
    if (!canvas) {
      setSelectedObject(null);
      setSelectedObjects([]);
      setHasSelection(false);
      setIsMultipleSelection(false);
      return;
    }

    canvasRef.current = canvas;

    canvas.on(
      "selection:created",
      handleSelectionCreated
    );

    canvas.on(
      "selection:updated",
      handleSelectionUpdated
    );

    canvas.on(
      "selection:cleared",
      handleSelectionCleared
    );

    canvas.on(
      "object:modified",
      handleObjectModified
    );

    canvas.on(
      "object:moving",
      handleObjectMoving
    );

    canvas.on(
      "object:scaling",
      handleObjectScaling
    );

    canvas.on(
      "object:rotating",
      handleObjectRotating
    );

    updateSelectionState();

    return () => {
      canvas.off(
        "selection:created",
        handleSelectionCreated
      );

      canvas.off(
        "selection:updated",
        handleSelectionUpdated
      );

      canvas.off(
        "selection:cleared",
        handleSelectionCleared
      );

      canvas.off(
        "object:modified",
        handleObjectModified
      );

      canvas.off(
        "object:moving",
        handleObjectMoving
      );

      canvas.off(
        "object:scaling",
        handleObjectScaling
      );

      canvas.off(
        "object:rotating",
        handleObjectRotating
      );
    };
  }, [
    canvas,
    handleSelectionCreated,
    handleSelectionUpdated,
    handleSelectionCleared,
    handleObjectModified,
    handleObjectMoving,
    handleObjectScaling,
    handleObjectRotating,
    updateSelectionState,
  ]);

  /* =======================================================
     SELECT OBJECT
  ======================================================= */

  const selectObject =
    useCallback(
      (object: CanvasObject | null) => {
        if (!canvas) return;

        if (!object) {
          canvas.discardActiveObject();
          canvas.requestRenderAll();

          updateSelectionState();

          return;
        }

        canvas.setActiveObject(
          object
        );

        canvas.requestRenderAll();

        updateSelectionState();
      },
      [
        canvas,
        updateSelectionState,
      ]
    );

  /* =======================================================
     SELECT MULTIPLE
  ======================================================= */

  const selectObjects =
    useCallback(
      (objects: CanvasObject[]) => {
        if (!canvas) return;

        if (
          objects.length === 0
        ) {
          canvas.discardActiveObject();

          canvas.requestRenderAll();

          updateSelectionState();

          return;
        }

        if (
          objects.length === 1
        ) {
          canvas.setActiveObject(
            objects[0]
          );

          canvas.requestRenderAll();

          updateSelectionState();

          return;
        }

        try {
          const selection =
            new (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (require("fabric").ActiveSelection as any)
            )(
              objects,
              {
                canvas,
              }
            );

          canvas.setActiveObject(
            selection
          );

          canvas.requestRenderAll();

          updateSelectionState();
        } catch {
          canvas.setActiveObject(
            objects[0]
          );

          canvas.requestRenderAll();

          updateSelectionState();
        }
      },
      [
        canvas,
        updateSelectionState,
      ]
    );

  /* =======================================================
     DESELECT
  ======================================================= */

  const deselect =
    useCallback(() => {
      if (!canvas) return;

      canvas.discardActiveObject();

      canvas.requestRenderAll();

      setSelectedObject(null);
      setSelectedObjects([]);
      setHasSelection(false);
      setIsMultipleSelection(false);

      onSelectionChange?.(
        null,
        []
      );
    }, [
      canvas,
      onSelectionChange,
    ]);

  /* =======================================================
     DELETE SELECTED
  ======================================================= */

  const deleteSelected =
    useCallback(() => {
      if (!canvas) {
        return false;
      }

      const activeObject =
        canvas.getActiveObject();

      if (!activeObject) {
        return false;
      }

      if (
        activeObject.type ===
          "activeSelection" &&
        "getObjects" in activeObject
      ) {
        const selectionObject =
          activeObject as ActiveSelectionLike;
        const objects =
          selectionObject.getObjects();

        canvas.discardActiveObject();

        objects.forEach(
          (object) => {
            canvas.remove(
              object
            );
          }
        );
      } else {
        canvas.remove(
          activeObject
        );

        canvas.discardActiveObject();
      }

      canvas.requestRenderAll();

      updateSelectionState();

      return true;
    }, [
      canvas,
      updateSelectionState,
    ]);

  /* =======================================================
     GET SELECTED OBJECT
  ======================================================= */

  const getSelectedObject =
    useCallback(() => {
      if (!canvas) {
        return null;
      }

      return (
        canvas.getActiveObject() ??
        null
      );
    }, [canvas]);

  /* =======================================================
     GET SELECTED OBJECTS
  ======================================================= */

  const getSelectedObjects =
    useCallback(() => {
      if (!canvas) {
        return [];
      }

      const activeObject =
        canvas.getActiveObject();

      if (!activeObject) {
        return [];
      }

      if (
        activeObject.type ===
          "activeSelection" &&
        "getObjects" in activeObject
      ) {
        return (activeObject as ActiveSelectionLike).getObjects();
      }

      return [activeObject];
    }, [canvas]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const refreshSelection =
    useCallback(() => {
      updateSelectionState();
    }, [
      updateSelectionState,
    ]);

  /* =======================================================
     RETURN
  ======================================================= */

  return {
    selectedObject,
    selectedObjects,
    hasSelection,
    isMultipleSelection,

    selectObject,
    selectObjects,

    /*
     * Keep both names so old code
     * doesn't break.
     */
    deselect,
    deselectObject: deselect,

    deleteSelected,

    getSelectedObject,
    getSelectedObjects,

    refreshSelection,
  };
}

export default useCanvasSelection;