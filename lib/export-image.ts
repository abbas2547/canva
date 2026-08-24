import * as fabric from "fabric";

export interface ExportRegion {
  left: number;
  top: number;
  width: number;
  height: number;
}

/* Bounding box of all visible objects, clamped to the canvas. Returns null
   when the canvas has no content so callers can fall back to full canvas. */
export function getTrimmedExportRegion(
  canvas: fabric.Canvas
): ExportRegion | null {
  const objects = canvas.getObjects().filter((o) => o.visible !== false);
  if (!objects.length) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const obj of objects) {
    const rect = obj.getBoundingRect();
    minX = Math.min(minX, rect.left);
    minY = Math.min(minY, rect.top);
    maxX = Math.max(maxX, rect.left + rect.width);
    maxY = Math.max(maxY, rect.top + rect.height);
  }

  const canvasW = canvas.getWidth();
  const canvasH = canvas.getHeight();

  minX = Math.max(0, Math.floor(minX));
  minY = Math.max(0, Math.floor(minY));
  maxX = Math.min(canvasW, Math.ceil(maxX));
  maxY = Math.min(canvasH, Math.ceil(maxY));

  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0 || height <= 0) return null;

  return { left: minX, top: minY, width, height };
}

/* Exports only the content area of the design — no surrounding blank space. */
export function exportDesignDataURL(
  canvas: fabric.Canvas,
  options: { format?: "png" | "jpeg"; multiplier?: number; quality?: number } = {}
): string {
  const { format = "png", multiplier = 2, quality = 1 } = options;
  const region = getTrimmedExportRegion(canvas);
  return canvas.toDataURL({
    format,
    multiplier,
    quality,
    enableRetinaScaling: false,
    ...(region ?? {}),
  });
}
