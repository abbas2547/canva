// hooks/useCanvasHistory.ts
import { useCallback, useRef, useState } from "react";
import * as fabric from "fabric";

export function useCanvasHistory(canvas: fabric.Canvas | null) {
  const historyRef = useRef<string[]>([]);
  const currentIndexRef = useRef(-1);
  const [historyState, setHistoryState] = useState<string[]>([]);
  const [currentIndexState, setCurrentIndexState] = useState(-1);

  const saveHistory = useCallback(() => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    if (historyRef.current[currentIndexRef.current] === json) return;

    // Remove any future states
    historyRef.current = historyRef.current.slice(0, currentIndexRef.current + 1);
    historyRef.current.push(json);
    currentIndexRef.current++;
    setHistoryState([...historyRef.current]);
    setCurrentIndexState(currentIndexRef.current);
  }, [canvas]);

  const undo = useCallback(async () => {
    if (!canvas || currentIndexRef.current <= 0) return;
    currentIndexRef.current--;
    await canvas.loadFromJSON(historyRef.current[currentIndexRef.current]);
    canvas.requestRenderAll();
    setHistoryState([...historyRef.current]);
    setCurrentIndexState(currentIndexRef.current);
  }, [canvas]);

  const redo = useCallback(async () => {
    if (!canvas || currentIndexRef.current >= historyRef.current.length - 1) return;
    currentIndexRef.current++;
    await canvas.loadFromJSON(historyRef.current[currentIndexRef.current]);
    canvas.requestRenderAll();
    setHistoryState([...historyRef.current]);
    setCurrentIndexState(currentIndexRef.current);
  }, [canvas]);

  return {
    saveHistory,
    undo,
    redo,
    canUndo: currentIndexState > 0,
    canRedo: currentIndexState < historyState.length - 1,
  };
}