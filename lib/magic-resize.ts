import type { Canvas } from "fabric";

export interface ResizePreset {
  name: string;
  width: number;
  height: number;
}

export const MAGIC_RESIZE_PRESETS: ResizePreset[] = [
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "YouTube Thumbnail", width: 1280, height: 720 },
  { name: "YouTube Banner", width: 2560, height: 1440 },
  { name: "LinkedIn Post", width: 1200, height: 627 },
  { name: "Facebook Post", width: 1200, height: 630 },
  { name: "Twitter Post", width: 1200, height: 675 },
  { name: "Presentation", width: 1920, height: 1080 },
  { name: "Presentation 4:3", width: 1440, height: 1080 },
  { name: "A4 Portrait", width: 794, height: 1123 },
  { name: "A4 Landscape", width: 1123, height: 794 },
  { name: "Poster", width: 800, height: 1200 },
  { name: "Business Card", width: 1050, height: 600 },
];

export function resizeCanvasObjects(canvas: Canvas, width: number, height: number): void {
  const oldWidth = canvas.getWidth();
  const oldHeight = canvas.getHeight();
  if (oldWidth <= 0 || oldHeight <= 0) return;

  const scale = Math.min(width / oldWidth, height / oldHeight);
  const offsetX = (width - oldWidth * scale) / 2;
  const offsetY = (height - oldHeight * scale) / 2;

  canvas.getObjects().forEach((object) => {
    const position = object.getXY();
    object.set({
      left: position.x * scale + offsetX,
      top: position.y * scale + offsetY,
      scaleX: (object.scaleX || 1) * scale,
      scaleY: (object.scaleY || 1) * scale,
      strokeWidth: object.strokeWidth ? object.strokeWidth * scale : object.strokeWidth,
    });
    if ("fontSize" in object && typeof object.fontSize === "number") {
      object.set({ fontSize: object.fontSize * scale });
    }
    object.setCoords();
  });

  canvas.setDimensions({ width, height });
  canvas.discardActiveObject();
  canvas.requestRenderAll();
}
