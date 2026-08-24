import * as fabric from "fabric";

const EMBEDDED_SRC_THRESHOLD = 100_000;
const UPLOAD_TIMEOUT_MS = 20_000;
const FALLBACK_MAX_BYTES = 280_000;

let storageCooldownUntil = 0;

export function isStorageCoolingDown(): boolean {
  return Date.now() < storageCooldownUntil;
}

function markStorageFailure(): void {
  storageCooldownUntil = Date.now() + 5 * 60_000;
}

async function uploadImageToCloud(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.url) {
    throw new Error(data?.error || `Upload failed (${res.status})`);
  }
  return data.url as string;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Upload timed out")),
      ms
    );
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not read image file"));
      img.src = objectUrl;
    });
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  }
}

let webpSupported: boolean | null = null;
function supportsWebP(): boolean {
  if (webpSupported === null) {
    try {
      webpSupported =
        document
          .createElement("canvas")
          .toDataURL("image/webp")
          .startsWith("data:image/webp");
    } catch {
      webpSupported = false;
    }
  }
  return webpSupported;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), type, quality)
  );
}

export interface PreparedImage {
  dataUrl: string;
  blob: Blob;
}

export async function prepareImageForEditor(
  file: File,
  maxDim = 1600
): Promise<PreparedImage> {
  const img = await loadImageElement(file);
  const srcW = img.naturalWidth || img.width;
  const srcH = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, w, h);

  const losslessSource =
    file.type === "image/png" ||
    file.type === "image/webp" ||
    file.type === "image/gif";
  const preferredType =
    losslessSource && supportsWebP() ? "image/webp" : "image/jpeg";

  const qualities = [0.85, 0.75, 0.65, 0.55];
  for (const q of qualities) {
    const blob = await canvasToBlob(canvas, preferredType, q);
    if (blob && blob.size <= FALLBACK_MAX_BYTES) {
      return { dataUrl: canvas.toDataURL(preferredType, q), blob };
    }
  }

  let shrink = 1;
  let lastDataUrl = canvas.toDataURL(preferredType, 0.55);
  let lastBlob = await canvasToBlob(canvas, preferredType, 0.55);
  while (shrink > 0.25) {
    shrink -= 0.15;
    const sw = Math.max(1, Math.round(w * shrink));
    const sh = Math.max(1, Math.round(h * shrink));
    canvas.width = sw;
    canvas.height = sh;
    ctx.drawImage(img, 0, 0, sw, sh);
    lastDataUrl = canvas.toDataURL(preferredType, 0.55);
    lastBlob = await canvasToBlob(canvas, preferredType, 0.55);
    if (lastBlob && lastBlob.size <= FALLBACK_MAX_BYTES) break;
  }
  return {
    dataUrl: lastDataUrl,
    blob:
      lastBlob ??
      new Blob([], { type: preferredType }),
  };
}

export async function placeImageOnCanvas(
  canvas: fabric.Canvas,
  url: string,
  maxSize = 600
): Promise<fabric.FabricImage> {
  const image = await fabric.FabricImage.fromURL(url, {
    crossOrigin: "anonymous",
  });

  if (image.width && image.width > maxSize) {
    image.scaleToWidth(maxSize);
  }

  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();

  image.set({
    left: (canvasWidth - (image.getScaledWidth() || 0)) / 2,
    top: (canvasHeight - (image.getScaledHeight() || 0)) / 2,
    selectable: true,
    evented: true,
  });

  canvas.add(image);
  return image;
}

function extForType(type: string): string {
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  return ".jpg";
}

/* WebGL texture upload and toDataURL fail when a canvas holds an image that
   was loaded without CORS approval. Re-loads the element anonymously so
   filters/exports work on images restored from older saved designs. */
export async function ensureUntaintedImage(
  obj: fabric.FabricImage
): Promise<boolean> {
  const el = obj.getElement();
  if (!(el instanceof HTMLImageElement)) return true;
  if (el.crossOrigin === "anonymous") return true;

  const src = obj.getSrc?.() || el.src;
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
    return true;
  }

  try {
    const fresh = new Image();
    fresh.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      fresh.onload = () => resolve();
      fresh.onerror = () => reject(new Error("cors-load-failed"));
      fresh.src = src;
    });
    obj.setElement(fresh);
    obj.dirty = true;
    return true;
  } catch {
    return false;
  }
}

export interface AddImageResult {
  image: fabric.FabricImage;
  url: string;
  stored: boolean;
}

export async function addUploadedImageToCanvas(
  canvas: fabric.Canvas,
  userId: string,
  file: File
): Promise<AddImageResult> {
  const prepared = await prepareImageForEditor(file);
  const image = await placeImageOnCanvas(canvas, prepared.dataUrl);

  if (!userId || isStorageCoolingDown()) {
    return { image, url: prepared.dataUrl, stored: false };
  }

  try {
    const storageFile = new File([prepared.blob], `upload_${Date.now()}${extForType(prepared.blob.type || file.type)}`, {
      type: prepared.blob.type || file.type,
    });
    const url = await withTimeout(
      uploadImageToCloud(storageFile),
      UPLOAD_TIMEOUT_MS
    );
    try {
      await image.setSrc(url);
      image.set({
        left: (canvas.getWidth() - (image.getScaledWidth() || 0)) / 2,
        top: (canvas.getHeight() - (image.getScaledHeight() || 0)) / 2,
      });
      canvas.requestRenderAll();
    } catch {
      // keep local preview if swapping fails
    }
    return { image, url, stored: true };
  } catch (error) {
    markStorageFailure();
    console.warn(
      "Cloud storage unavailable, keeping compressed local copy:",
      error instanceof Error ? error.message : error
    );
    return { image, url: prepared.dataUrl, stored: false };
  }
}

/* Walks serialized canvas JSON and replaces large base64 data-URLs with
   Firebase Storage URLs so documents stay under Firestore's ~1MB limit.
   Mutates the object in place; call before JSON.stringify on save. */
export async function migrateEmbeddedImages(
  jsonObj: Record<string, unknown>,
  userId: string
): Promise<void> {
  if (!userId || isStorageCoolingDown()) return;

  const candidates: Array<{
    container: Record<string, unknown>;
    key: string;
  }> = [];

  const objects = jsonObj?.objects;
  if (Array.isArray(objects)) {
    for (const o of objects) {
      if (
        o &&
        typeof o === "object" &&
        typeof (o as Record<string, unknown>).src === "string"
      ) {
        candidates.push({
          container: o as Record<string, unknown>,
          key: "src",
        });
      }
    }
  }
  const bg = jsonObj?.backgroundImage;
  if (
    bg &&
    typeof bg === "object" &&
    typeof (bg as Record<string, unknown>).src === "string"
  ) {
    candidates.push({ container: bg as Record<string, unknown>, key: "src" });
  }

  for (const { container, key } of candidates) {
    const src = container[key] as string;
    if (!src.startsWith("data:") || src.length < EMBEDDED_SRC_THRESHOLD)
      continue;
    try {
      const blob = await (
        await fetch(src)
      ).blob();
      const file = new File(
        [blob],
        `embedded_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 6)}${extForType(blob.type || "image/png")}`,
        { type: blob.type || "image/png" }
      );
      const url = await withTimeout(
        uploadImageToCloud(file),
        UPLOAD_TIMEOUT_MS
      );
      container[key] = url;
    } catch (error) {
      markStorageFailure();
      console.warn(
        "Skipping embedded-image migration:",
        error instanceof Error ? error.message : error
      );
      return;
    }
  }
}
