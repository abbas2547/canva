import { v4 as uuidv4 } from "uuid";
import * as fabric from "fabric";

/**
 * Generate unique ID
 */
const addId = <T extends fabric.FabricObject>(obj: T): T => {
  (obj as any).id = uuidv4();
  return obj;
};

/**
 * TEXT OBJECT
 */
export const createTextObject = (
  text = "Double click to edit"
) => {
  const obj = new fabric.Textbox(text, {
    left: 100,
    top: 100,
    width: 250,
    fontSize: 24,
    fontFamily: "Arial",
    fill: "#111111",
    editable: true,
  });

  return addId(obj);
};

/**
 * RECTANGLE
 */
export const createRect = () => {
  const obj = new fabric.Rect({
    left: 150,
    top: 150,
    width: 150,
    height: 120,
    fill: "#3b82f6",
    stroke: "#1e40af",
    strokeWidth: 0,
    rx: 10,
    ry: 10,
  });

  return addId(obj);
};

/**
 * CIRCLE
 */
export const createCircle = () => {
  const obj = new fabric.Circle({
    left: 200,
    top: 200,
    radius: 60,
    fill: "#f97316",
    stroke: "#c2410c",
    strokeWidth: 0,
  });

  return addId(obj);
};

/**
 * TRIANGLE
 */
export const createTriangle = () => {
  const obj = new fabric.Triangle({
    left: 250,
    top: 250,
    width: 120,
    height: 120,
    fill: "#22c55e",
    stroke: "#15803d",
    strokeWidth: 0,
  });

  return addId(obj);
};

/**
 * LINE
 */
export const createLine = () => {
  const obj = new fabric.Line(
    [0, 0, 200, 0],
    {
      left: 150,
      top: 150,
      stroke: "#000000",
      strokeWidth: 3,
    }
  );

  return addId(obj);
};

/**
 * STAR
 */
export const createStar = () => {
  const obj = new fabric.Polygon(
    [
      { x: 50, y: 0 },
      { x: 65, y: 35 },
      { x: 100, y: 40 },
      { x: 75, y: 65 },
      { x: 80, y: 100 },
      { x: 50, y: 80 },
      { x: 20, y: 100 },
      { x: 25, y: 65 },
      { x: 0, y: 40 },
      { x: 35, y: 35 },
    ],
    {
      left: 200,
      top: 200,
      fill: "#facc15",
      stroke: "#ca8a04",
      strokeWidth: 1,
    }
  );

  return addId(obj);
};

/**
 * STICKER
 */
export const createSticker = (
  emoji = "🔥"
) => {
  const obj = new fabric.Text(emoji, {
    left: 120,
    top: 120,
    fontSize: 40,
  });

  return addId(obj);
};

/**
 * LOCAL IMAGE
 * File Location:
 * public/canva.png
 */
export const createImageObject = async () => {
  const img = await fabric.FabricImage.fromURL(
    "/canva.png"
  );

  img.set({
    left: 100,
    top: 100,
    scaleX: 0.5,
    scaleY: 0.5,
    selectable: true,
    hasControls: true,
    hasBorders: true,
  });

  return addId(img);
};

/**
 * IMAGE FROM URL
 */
export const createImageFromUrl = async (
  url: string
) => {
  const img =
    await fabric.FabricImage.fromURL(
      url
    );

  img.set({
    left: 100,
    top: 100,
    scaleX: 0.5,
    scaleY: 0.5,
    selectable: true,
    hasControls: true,
    hasBorders: true,
  });

  return addId(img);
};