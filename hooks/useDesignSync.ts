"use client";

import { useCallback, useRef } from "react";
import * as fabric from "fabric";
import { useAuth } from "@/context/AuthContext";
import { useEditorStore } from "@/store/editorStore";
import { getDesignById, createDesign, updateDesign } from "@/lib/db-operations";
import toast from "react-hot-toast";

export function useDesignSync() {
  const { user } = useAuth();
  const designId = useEditorStore((state) => state.designId);
  const projectName = useEditorStore((state) => state.projectName);
  const setDesignId = useEditorStore((state) => state.setDesignId);
  const setProjectName = useEditorStore((state) => state.setProjectName);
  const canvas = useEditorStore((state) => state.canvas);
  const canvasWidth = useEditorStore((state) => state.canvasWidth);
  const canvasHeight = useEditorStore((state) => state.canvasHeight);
  const isSaving = useEditorStore((state) => state.isSaving);
  const setIsSaving = useEditorStore((state) => state.setIsSaving);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadDesign = useCallback(
    async (id: string) => {
      if (!user) return;

      try {
        setIsSaving(true);
        const design = await getDesignById(id);

        if (design && canvas) {
          setDesignId(design.id);
          setProjectName(design.title);

          const pages = design.pages || [];
          const page = pages.find((p) => p.id === design.activePageId) || pages[0];
          if (page) {
            const json = JSON.parse(page.json);
            await canvas.loadFromJSON(json);
            canvas.setDimensions({ width: design.width, height: design.height });
            canvas.requestRenderAll();

            useEditorStore.getState().refreshLayers();
            useEditorStore.getState().saveHistory();
            useEditorStore.getState().markSaved();
          }
        }
      } catch (error) {
        console.error("Failed to load design:", error);
        toast.error("Failed to load design");
      } finally {
        setIsSaving(false);
      }
    },
    [user, canvas, setDesignId, setProjectName, setIsSaving]
  );

  const saveDesign = useCallback(
    async (options?: { showToast?: boolean; debounce?: boolean }) => {
      if (!user || !canvas || !designId) {
        if (options?.showToast) {
          toast.error("No design to save");
        }
        return;
      }

      if (isSaving) return;

      const doSave = async () => {
        try {
          setIsSaving(true);

          const json = JSON.stringify(canvas.toJSON());
          const thumbnail = canvas.toDataURL({
            format: "png",
            multiplier: 0.2,
            quality: 0.8,
          });

          await updateDesign(designId, {
            title: projectName,
            pages: [
              {
                id: "page-1",
                name: "Page 1",
                json,
              },
            ],
            activePageId: "page-1",
            width: canvasWidth,
            height: canvasHeight,
            thumbnail,
          });

          useEditorStore.getState().markSaved();

          if (options?.showToast) {
            toast.success("Design saved");
          }
        } catch (error) {
          console.error("Failed to save design:", error);
          if (options?.showToast) {
            toast.error("Failed to save design");
          }
        } finally {
          setIsSaving(false);
        }
      };

      if (options?.debounce) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(doSave, 1000);
      } else {
        await doSave();
      }
    },
    [user, canvas, designId, projectName, canvasWidth, canvasHeight, isSaving, setIsSaving]
  );

  const createNewDesign = useCallback(
    async (title: string = "Untitled Design", width: number = 1080, height: number = 1080) => {
      if (!user || !canvas) {
        toast.error("Not authenticated");
        return null;
      }

      try {
        setIsSaving(true);
        const design = await createDesign(user.uid, title, width, height);

        setDesignId(design.id);
        setProjectName(design.title);

        canvas.clear();
        canvas.backgroundColor = "#ffffff";
        canvas.setDimensions({ width, height });
        canvas.setZoom(1);
        canvas.requestRenderAll();

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
    [user, canvas, setDesignId, setProjectName, setIsSaving]
  );

  const autoSave = useCallback(() => {
    saveDesign({ debounce: true });
  }, [saveDesign]);

  return {
    loadDesign,
    saveDesign,
    createNewDesign,
    autoSave,
    isSaving,
  };
}