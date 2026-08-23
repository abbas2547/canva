export interface FrameItem {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  shape: "circle" | "rectangle" | "rounded" | "heart" | "diamond" | "hexagon" | "octagon";
  rx?: number;
  ry?: number;
  radius?: number;
}

export interface FrameCategory {
  id: string;
  name: string;
  frames: FrameItem[];
}

export const frameCategories: FrameCategory[] = [
  {
    id: "circle-frames",
    name: "Circle",
    frames: [
      { id: "frame-circle-sm", name: "Small Circle", category: "circle-frames", width: 200, height: 200, shape: "circle", radius: 100 },
      { id: "frame-circle-md", name: "Medium Circle", category: "circle-frames", width: 300, height: 300, shape: "circle", radius: 150 },
      { id: "frame-circle-lg", name: "Large Circle", category: "circle-frames", width: 400, height: 400, shape: "circle", radius: 200 },
    ],
  },
  {
    id: "rectangle-frames",
    name: "Rectangle",
    frames: [
      { id: "frame-rect-sm", name: "Small Rectangle", category: "rectangle-frames", width: 300, height: 200, shape: "rectangle" },
      { id: "frame-rect-md", name: "Medium Rectangle", category: "rectangle-frames", width: 400, height: 300, shape: "rectangle" },
      { id: "frame-rect-lg", name: "Large Rectangle", category: "rectangle-frames", width: 500, height: 400, shape: "rectangle" },
      { id: "frame-rect-portrait", name: "Portrait", category: "rectangle-frames", width: 300, height: 400, shape: "rectangle" },
      { id: "frame-rect-square", name: "Square", category: "rectangle-frames", width: 350, height: 350, shape: "rectangle" },
    ],
  },
  {
    id: "rounded-frames",
    name: "Rounded",
    frames: [
      { id: "frame-round-sm", name: "Small Rounded", category: "rounded-frames", width: 300, height: 200, shape: "rounded", rx: 20, ry: 20 },
      { id: "frame-round-md", name: "Medium Rounded", category: "rounded-frames", width: 400, height: 300, shape: "rounded", rx: 30, ry: 30 },
      { id: "frame-round-lg", name: "Large Rounded", category: "rounded-frames", width: 500, height: 400, shape: "rounded", rx: 40, ry: 40 },
    ],
  },
  {
    id: "creative-frames",
    name: "Creative",
    frames: [
      { id: "frame-heart", name: "Heart", category: "creative-frames", width: 300, height: 300, shape: "heart" },
      { id: "frame-diamond", name: "Diamond", category: "creative-frames", width: 300, height: 300, shape: "diamond" },
      { id: "frame-hexagon", name: "Hexagon", category: "creative-frames", width: 300, height: 300, shape: "hexagon" },
      { id: "frame-octagon", name: "Octagon", category: "creative-frames", width: 300, height: 300, shape: "octagon" },
    ],
  },
];

export function getAllFrames(): FrameItem[] {
  return frameCategories.flatMap((cat) => cat.frames);
}

export function getFramesByCategory(categoryId: string): FrameItem[] {
  const category = frameCategories.find((c) => c.id === categoryId);
  return category ? category.frames : [];
}
