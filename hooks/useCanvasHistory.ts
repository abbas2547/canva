// hooks/useCanvasHistory.ts
import { useCallback, useRef } from "react";
import * as fabric from "fabric";

export function useCanvasHistory(canvas: fabric.Canvas | null) {
  const historyRef = useRef<string[]>([]);
  const currentIndexRef = useRef(-1);

  const saveHistory = useCallback(() => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    if (historyRef.current[currentIndexRef.current] === json) return;

    // Remove any future states
    historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    historyRef.current.push(json);
    currentIndexRef.current++;
  }, [canvas]);

  const undo = useCallback(() => {
    if (!canvas || currentIndexRef.current <= 0) return;
    currentIndexRef.current--;
    canvas.loadFromJSON(historyRef.current[currentIndexRef.current], () => {
      canvas.renderAll();
    });
  }, [canvas]);

  const redo = useCallback(() => {
    if (!canvas || currentIndexRef.current >= historyRef.current.length - 1) return;
    currentIndexRef.current++;
    canvas.loadFromJSON(historyRef.current[currentIndexRef.current], () => {
      canvas.renderAll();
    });
  }, [canvas]);

  return {
    saveHistory,
    undo,
    redo,
    canUndo: currentIndexRef.current > 0,
    canRedo: currentIndexRef.current < historyRef.current.length - 1,
  };
}