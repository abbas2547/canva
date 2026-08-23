export interface ElementItem {
  id: string;
  name: string;
  category: string;
  type: "shape" | "line" | "arrow" | "emoji" | "icon";
  svg?: string;
  emoji?: string;
  fabricConfig: Record<string, unknown>;
}

export interface ElementCategory {
  id: string;
  name: string;
  items: ElementItem[];
}

export const elementCategories: ElementCategory[] = [
  {
    id: "basic-shapes",
    name: "Basic Shapes",
    items: [
      {
        id: "rect",
        name: "Rectangle",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "rect", width: 200, height: 200, fill: "#6366f1", rx: 0, ry: 0 },
      },
      {
        id: "rounded-rect",
        name: "Rounded Rectangle",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "rect", width: 200, height: 200, fill: "#8b5cf6", rx: 20, ry: 20 },
      },
      {
        id: "circle",
        name: "Circle",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "circle", radius: 100, fill: "#ec4899" },
      },
      {
        id: "ellipse",
        name: "Ellipse",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "ellipse", rx: 120, ry: 80, fill: "#14b8a6" },
      },
      {
        id: "triangle",
        name: "Triangle",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "triangle", width: 200, height: 200, fill: "#f59e0b" },
      },
      {
        id: "diamond",
        name: "Diamond",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "rect", width: 150, height: 150, fill: "#06b6d4", angle: 45 },
      },
      {
        id: "pentagon",
        name: "Pentagon",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "polygon", points: [{ x: 75, y: 0 }, { x: 150, y: 55 }, { x: 125, y: 140 }, { x: 25, y: 140 }, { x: 0, y: 55 }], fill: "#10b981" },
      },
      {
        id: "hexagon",
        name: "Hexagon",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "polygon", points: [{ x: 80, y: 0 }, { x: 160, y: 45 }, { x: 160, y: 135 }, { x: 80, y: 180 }, { x: 0, y: 135 }, { x: 0, y: 45 }], fill: "#6366f1" },
      },
      {
        id: "star",
        name: "Star",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "polygon", points: [{ x: 100, y: 0 }, { x: 120, y: 70 }, { x: 200, y: 70 }, { x: 140, y: 110 }, { x: 160, y: 180 }, { x: 100, y: 140 }, { x: 40, y: 180 }, { x: 60, y: 110 }, { x: 0, y: 70 }, { x: 80, y: 70 }], fill: "#f59e0b" },
      },
      {
        id: "heart",
        name: "Heart",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "polygon", points: [{ x: 50, y: 30 }, { x: 90, y: 0 }, { x: 130, y: 30 }, { x: 130, y: 70 }, { x: 50, y: 130 }, { x: 50, y: 130 }, { x: 50, y: 130 }, { x: -30, y: 70 }, { x: -30, y: 30 }], fill: "#ef4444" },
      },
      {
        id: "cross",
        name: "Cross",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "polygon", points: [{ x: 60, y: 0 }, { x: 140, y: 0 }, { x: 140, y: 60 }, { x: 200, y: 60 }, { x: 200, y: 140 }, { x: 140, y: 140 }, { x: 140, y: 200 }, { x: 60, y: 200 }, { x: 60, y: 140 }, { x: 0, y: 140 }, { x: 0, y: 60 }, { x: 60, y: 60 }], fill: "#f43f5e" },
      },
      {
        id: "arrow-right",
        name: "Arrow Right",
        category: "basic-shapes",
        type: "shape",
        fabricConfig: { type: "polygon", points: [{ x: 0, y: 50 }, { x: 100, y: 50 }, { x: 100, y: 0 }, { x: 180, y: 80 }, { x: 100, y: 160 }, { x: 100, y: 110 }, { x: 0, y: 110 }], fill: "#3b82f6" },
      },
    ],
  },
  {
    id: "lines",
    name: "Lines & Arrows",
    items: [
      {
        id: "line-h",
        name: "Horizontal Line",
        category: "lines",
        type: "line",
        fabricConfig: { type: "line", x1: 0, y1: 0, x2: 300, y2: 0, stroke: "#1e293b", strokeWidth: 4 },
      },
      {
        id: "line-v",
        name: "Vertical Line",
        category: "lines",
        type: "line",
        fabricConfig: { type: "line", x1: 0, y1: 0, x2: 0, y2: 300, stroke: "#1e293b", strokeWidth: 4 },
      },
      {
        id: "line-diagonal",
        name: "Diagonal Line",
        category: "lines",
        type: "line",
        fabricConfig: { type: "line", x1: 0, y1: 0, x2: 200, y2: 200, stroke: "#1e293b", strokeWidth: 4 },
      },
      {
        id: "arrow-line-h",
        name: "Arrow Right Line",
        category: "lines",
        type: "arrow",
        fabricConfig: { type: "line", x1: 0, y1: 50, x2: 200, y2: 50, stroke: "#3b82f6", strokeWidth: 4 },
      },
      {
        id: "dashed-line",
        name: "Dashed Line",
        category: "lines",
        type: "line",
        fabricConfig: { type: "line", x1: 0, y1: 0, x2: 300, y2: 0, stroke: "#94a3b8", strokeWidth: 3, strokeDashArray: [15, 10] },
      },
      {
        id: "dotted-line",
        name: "Dotted Line",
        category: "lines",
        type: "line",
        fabricConfig: { type: "line", x1: 0, y1: 0, x2: 300, y2: 0, stroke: "#94a3b8", strokeWidth: 6, strokeLineCap: "round" },
      },
      {
        id: "wavy-line",
        name: "Wavy Line",
        category: "lines",
        type: "line",
        fabricConfig: { type: "line", x1: 0, y1: 50, x2: 300, y2: 50, stroke: "#8b5cf6", strokeWidth: 4 },
      },
    ],
  },
  {
    id: "emojis",
    name: "Emojis",
    items: [
      { id: "e-fire", name: "Fire", category: "emojis", type: "emoji", emoji: "🔥", fabricConfig: { type: "i-text", text: "🔥", fontSize: 80 } },
      { id: "e-heart", name: "Heart", category: "emojis", type: "emoji", emoji: "❤️", fabricConfig: { type: "i-text", text: "❤️", fontSize: 80 } },
      { id: "e-star", name: "Star", category: "emojis", type: "emoji", emoji: "⭐", fabricConfig: { type: "i-text", text: "⭐", fontSize: 80 } },
      { id: "e-clap", name: "Clap", category: "emojis", type: "emoji", emoji: "👏", fabricConfig: { type: "i-text", text: "👏", fontSize: 80 } },
      { id: "e-muscle", name: "Muscle", category: "emojis", type: "emoji", emoji: "💪", fabricConfig: { type: "i-text", text: "💪", fontSize: 80 } },
      { id: "e-rocket", name: "Rocket", category: "emojis", type: "emoji", emoji: "🚀", fabricConfig: { type: "i-text", text: "🚀", fontSize: 80 } },
      { id: "e-lightning", name: "Lightning", category: "emojis", type: "emoji", emoji: "⚡", fabricConfig: { type: "i-text", text: "⚡", fontSize: 80 } },
      { id: "e-crown", name: "Crown", category: "emojis", type: "emoji", emoji: "👑", fabricConfig: { type: "i-text", text: "👑", fontSize: 80 } },
      { id: "e-party", name: "Party", category: "emojis", type: "emoji", emoji: "🎉", fabricConfig: { type: "i-text", text: "🎉", fontSize: 80 } },
      { id: "e-100", name: "100", category: "emojis", type: "emoji", emoji: "💯", fabricConfig: { type: "i-text", text: "💯", fontSize: 80 } },
      { id: "e-eyes", name: "Eyes", category: "emojis", type: "emoji", emoji: "👀", fabricConfig: { type: "i-text", text: "👀", fontSize: 80 } },
      { id: "e-rocket2", name: "Comet", category: "emojis", type: "emoji", emoji: "☄️", fabricConfig: { type: "i-text", text: "☄️", fontSize: 80 } },
      { id: "e-sparkles", name: "Sparkles", category: "emojis", type: "emoji", emoji: "✨", fabricConfig: { type: "i-text", text: "✨", fontSize: 80 } },
      { id: "e-magic", name: "Magic", category: "emojis", type: "emoji", emoji: "🪄", fabricConfig: { type: "i-text", text: "🪄", fontSize: 80 } },
      { id: "e-bulb", name: "Bulb", category: "emojis", type: "emoji", emoji: "💡", fabricConfig: { type: "i-text", text: "💡", fontSize: 80 } },
      { id: "e-target", name: "Target", category: "emojis", type: "emoji", emoji: "🎯", fabricConfig: { type: "i-text", text: "🎯", fontSize: 80 } },
      { id: "e-trophy", name: "Trophy", category: "emojis", type: "emoji", emoji: "🏆", fabricConfig: { type: "i-text", text: "🏆", fontSize: 80 } },
      { id: "e-diamond", name: "Diamond", category: "emojis", type: "emoji", emoji: "💎", fabricConfig: { type: "i-text", text: "💎", fontSize: 80 } },
      { id: "e-sun", name: "Sun", category: "emojis", type: "emoji", emoji: "☀️", fabricConfig: { type: "i-text", text: "☀️", fontSize: 80 } },
      { id: "e-moon", name: "Moon", category: "emojis", type: "emoji", emoji: "🌙", fabricConfig: { type: "i-text", text: "🌙", fontSize: 80 } },
      { id: "e-rainbow", name: "Rainbow", category: "emojis", type: "emoji", emoji: "🌈", fabricConfig: { type: "i-text", text: "🌈", fontSize: 80 } },
      { id: "e-smile", name: "Smile", category: "emojis", type: "emoji", emoji: "😊", fabricConfig: { type: "i-text", text: "😊", fontSize: 80 } },
      { id: "e-cool", name: "Cool", category: "emojis", type: "emoji", emoji: "😎", fabricConfig: { type: "i-text", text: "😎", fontSize: 80 } },
      { id: "e-mindblown", name: "Mind Blown", category: "emojis", type: "emoji", emoji: "🤯", fabricConfig: { type: "i-text", text: "🤯", fontSize: 80 } },
    ],
  },
];

export function getAllElements(): ElementItem[] {
  return elementCategories.flatMap((cat) => cat.items);
}

export function getElementsByCategory(categoryId: string): ElementItem[] {
  const category = elementCategories.find((c) => c.id === categoryId);
  return category ? category.items : [];
}
