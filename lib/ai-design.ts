export type AIDesignElement =
  | { type: "text"; text: string; x: number; y: number; width?: number; fontSize: number; color: string; fontFamily?: string; fontWeight?: "normal" | "bold"; align?: "left" | "center" | "right" }
  | { type: "rect" | "circle" | "triangle"; x: number; y: number; width: number; height: number; color: string; opacity?: number }
  | { type: "line"; x: number; y: number; x2: number; y2: number; color: string; strokeWidth: number };

export interface AIDesignSpec {
  width: number;
  height: number;
  background: string;
  elements: AIDesignElement[];
}

const COLOR_PATTERN = /^(#[0-9a-f]{6}|rgba?\([^)]+\)|transparent)$/i;

export function validateAIDesignSpec(value: unknown): AIDesignSpec | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const width = Number(candidate.width);
  const height = Number(candidate.height);
  const background = typeof candidate.background === "string" ? candidate.background : "";
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || width > 10000 || height > 10000 || !COLOR_PATTERN.test(background)) return null;
  if (!Array.isArray(candidate.elements) || candidate.elements.length > 40) return null;

  const elements: AIDesignElement[] = [];
  for (const raw of candidate.elements) {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    const type = item.type;
    const x = Number(item.x);
    const y = Number(item.y);
    const color = typeof item.color === "string" ? item.color : "";
    if (!["text", "rect", "circle", "triangle", "line"].includes(String(type)) || !Number.isFinite(x) || !Number.isFinite(y) || !COLOR_PATTERN.test(color)) return null;
    const normalizedType = type as AIDesignElement["type"];
    if (normalizedType === "text") {
      const text = typeof item.text === "string" ? item.text.trim() : "";
      const fontSize = Number(item.fontSize);
      if (!text || text.length > 500 || !Number.isFinite(fontSize) || fontSize < 8 || fontSize > 240) return null;
      elements.push({ type: normalizedType, text, x, y, width: Number.isFinite(Number(item.width)) ? Number(item.width) : undefined, fontSize, color, fontFamily: typeof item.fontFamily === "string" ? item.fontFamily.slice(0, 80) : undefined, fontWeight: item.fontWeight === "bold" ? "bold" : "normal", align: item.align === "center" || item.align === "right" ? item.align : "left" });
    } else if (normalizedType === "line") {
      const x2 = Number(item.x2);
      const y2 = Number(item.y2);
      const strokeWidth = Number(item.strokeWidth);
      if (!Number.isFinite(x2) || !Number.isFinite(y2) || !Number.isFinite(strokeWidth) || strokeWidth < 1 || strokeWidth > 40) return null;
      elements.push({ type: normalizedType, x, y, x2, y2, color, strokeWidth });
    } else {
      const elementWidth = Number(item.width);
      const elementHeight = Number(item.height);
      if (!Number.isFinite(elementWidth) || !Number.isFinite(elementHeight) || elementWidth < 1 || elementHeight < 1 || elementWidth > 10000 || elementHeight > 10000) return null;
      elements.push({ type: normalizedType, x, y, width: elementWidth, height: elementHeight, color, opacity: Number.isFinite(Number(item.opacity)) ? Math.min(1, Math.max(0, Number(item.opacity))) : 1 });
    }
  }
  return { width, height, background, elements };
}
