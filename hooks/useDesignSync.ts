"use client";

import { useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useEditorStore } from "@/store/editorStore";
import { getDesignById, createDesign, updateDesign } from "@/lib/db-operations";
import { migrateEmbeddedImages, ensureUntaintedImage } from "@/lib/image-upload";
import { saveController } from "@/lib/save-controller";
import * as fabric from "fabric";
import toast from "react-hot-toast";

/* =========================================================
   SANITIZE JSON - remove undefined/Infinity/NaN that
   Firestore rejects
   ========================================================= */

function sanitizeForFirestore(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value;
  }
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    return value.map(sanitizeForFirestore);
  }
  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = sanitizeForFirestore(val);
    }
    return result;
  }
  return null;
}

/* =========================================================
   HOOK
   ========================================================= */

export function useDesignSync() {
  const { user } = useAuth();
  const designId = useEditorStore((state) => state.designId);
  const projectName = useEditorStore((state) => state.projectName);
  const setDesignId = useEditorStore((state) => state.setDesignId);
  const setProjectName = useEditorStore((state) => state.setProjectName);
  const isSaving = useEditorStore((state) => state.isSaving);
  const setIsSaving = useEditorStore((state) => state.setIsSaving);

  const isLoadingRef = useRef(false);
  const lastFailToastRef = useRef(0);

  const loadDesign = useCallback(
    async (id: string) => {
      if (!user) return;

      let attempts = 0;
      const maxAttempts = 50;
      const retryInterval = 200;

      const waitForCanvas = (): Promise<boolean> => {
        return new Promise((resolve) => {
          const check = () => {
            const currentCanvas = useEditorStore.getState().canvas;
            if (currentCanvas) {
              resolve(true);
            } else if (attempts >= maxAttempts) {
              resolve(false);
            } else {
              attempts++;
              setTimeout(check, retryInterval);
            }
          };
          check();
        });
      };

      const canvasReady = await waitForCanvas();
      if (!canvasReady) {
        console.error("Canvas did not initialize in time");
        toast.error("Failed to load design: canvas not ready");
        return;
      }

      const currentCanvas = useEditorStore.getState().canvas;
      if (!currentCanvas) return;

      try {
        isLoadingRef.current = true;
        setIsSaving(true);
        const design = await getDesignById(id, user.uid);

        if (design) {
          setDesignId(design.id);
          setProjectName(design.title);

          const pages = design.pages || [];
          const page = pages.find((p) => p.id === design.activePageId) || pages[0];
          if (page) {
            const json = JSON.parse(page.json);
            await currentCanvas.loadFromJSON(json);

            // Re-load any images that were saved without CORS approval so
            // filters/exports don't fail with tainted-canvas errors
            const imageObjects = currentCanvas
              .getObjects()
              .filter((o): o is import("fabric").FabricImage => o instanceof fabric.FabricImage);
            await Promise.all(imageObjects.map((img) => ensureUntaintedImage(img)));

            if (design.width && design.height) {
              currentCanvas.setDimensions({ width: design.width, height: design.height });
              useEditorStore.getState().setCanvasSize(design.width, design.height);
            }

            currentCanvas.requestRenderAll();

            useEditorStore.getState().refreshLayers();
            useEditorStore.getState().saveHistory();
            useEditorStore.getState().markSaved();
          }
        }
      } catch (error) {
        console.error("Failed to load design:", error);
        toast.error("Failed to load design");
      } finally {
        isLoadingRef.current = false;
        setIsSaving(false);
      }
    },
    [user, setDesignId, setProjectName, setIsSaving]
  );

  const buildSaver = useCallback(
    (mode: "manual" | "auto" = "auto") =>
      async () => {
        const latestCanvas = useEditorStore.getState().canvas;
        const latestDesignId = useEditorStore.getState().designId;
        const latestProjectName = useEditorStore.getState().projectName;
        const latestCanvasWidth = useEditorStore.getState().canvasWidth;
        const latestCanvasHeight = useEditorStore.getState().canvasHeight;

        if (!user || !latestCanvas || !latestDesignId) return;
        if (isLoadingRef.current) return;

        try {
          setIsSaving(true);

          const rawJson = latestCanvas.toJSON();
          const sanitizedJson = sanitizeForFirestore(rawJson);
          await migrateEmbeddedImages(
            sanitizedJson as Record<string, unknown>,
            user.uid
          );
          const json = JSON.stringify(sanitizedJson);

          let thumbnail = "";
          try {
            const thumbData = latestCanvas.toDataURL({
              format: "png",
              multiplier: 0.15,
              quality: 0.6,
            });
            if (thumbData && thumbData.length < 500000) {
              thumbnail = thumbData;
            }
          } catch {
            thumbnail = "";
          }

          await updateDesign(latestDesignId, {
            title: latestProjectName,
            pages: [{ id: "page-1", name: "Page 1", json }],
            activePageId: "page-1",
            width: latestCanvasWidth,
            height: latestCanvasHeight,
            thumbnail,
          }, user.uid);

          useEditorStore.getState().markSaved();
          console.debug("[autosave] saved", latestDesignId);
          if (mode === "manual") toast.success("Design saved");
        } catch (error) {
          console.error("Failed to save design:", error);
          if (mode === "manual") {
            toast.error("Failed to save design");
          } else {
            const now = Date.now();
            if (now - lastFailToastRef.current > 20000) {
              lastFailToastRef.current = now;
              toast.error("Auto-save failed. Your changes will retry.");
            }
          }
        } finally {
          setIsSaving(false);
        }
      },
    [user, setIsSaving]
  );

  const saveDesign = useCallback(
    (options?: { showToast?: boolean; debounce?: boolean }) => {
      const currentDesignId = useEditorStore.getState().designId;

      if (!user || !currentDesignId) {
        if (options?.showToast) {
          toast.error("No design to save");
        }
        return;
      }

      if (isLoadingRef.current) return;

      saveController.request(
        buildSaver(options?.showToast ? "manual" : "auto"),
        options?.debounce ? 800 : 0
      );
    },
    [user, buildSaver]
  );

  const flushSave = useCallback(() => {
    const store = useEditorStore.getState();
    if (!user || !store.designId) return;
    if (isLoadingRef.current) return;

    // Run immediately unless a save is already in flight; the controller
    // queues it so the latest state always lands.
    saveController.flush(buildSaver("auto"));
  }, [user, buildSaver]);

  const createNewDesign = useCallback(
    async (title: string = "Untitled Design", width: number = 1080, height: number = 1080) => {
      if (!user) {
        toast.error("Not authenticated");
        return null;
      }

      const currentCanvas = useEditorStore.getState().canvas;
      if (!currentCanvas) {
        toast.error("Canvas not ready");
        return null;
      }

      try {
        setIsSaving(true);
        const design = await createDesign(user.uid, title, width, height);

        setDesignId(design.id);
        setProjectName(design.title);

        currentCanvas.clear();
        currentCanvas.backgroundColor = "#ffffff";
        currentCanvas.setDimensions({ width, height });
        currentCanvas.setZoom(1);
        currentCanvas.requestRenderAll();

        useEditorStore.getState().setCanvasSize(width, height);
        useEditorStore.getState().refreshLayers();
        useEditorStore.getState().saveHistory();
        useEditorStore.getState().markSaved();

        toast.success("New design created");
        return design;
      } catch (error) {
        console.error("Failed to create design:", error);
        toast.error("Failed to create design");
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [user, setDesignId, setProjectName, setIsSaving]
  );

  const autoSave = useCallback(() => {
    saveDesign({ debounce: true });
  }, [saveDesign]);

  return {
    loadDesign,
    saveDesign,
    createNewDesign,
    autoSave,
    flushSave,
    isSaving,
  };
}
