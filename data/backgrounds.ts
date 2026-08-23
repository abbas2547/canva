export interface BackgroundItem {
  id: string;
  name: string;
  type: "solid" | "gradient" | "pattern";
  value: string;
  preview?: string;
}

export interface BackgroundCategory {
  id: string;
  name: string;
  items: BackgroundItem[];
}

export const backgroundCategories: BackgroundCategory[] = [
  {
    id: "solid-colors",
    name: "Solid Colors",
    items: [
      { id: "bg-white", name: "White", type: "solid", value: "#ffffff" },
      { id: "bg-black", name: "Black", type: "solid", value: "#000000" },
      { id: "bg-gray-50", name: "Gray 50", type: "solid", value: "#f9fafb" },
      { id: "bg-gray-100", name: "Gray 100", type: "solid", value: "#f3f4f6" },
      { id: "bg-gray-200", name: "Gray 200", type: "solid", value: "#e5e7eb" },
      { id: "bg-gray-800", name: "Gray 800", type: "solid", value: "#1f2937" },
      { id: "bg-gray-900", name: "Gray 900", type: "solid", value: "#111827" },
      { id: "bg-red-500", name: "Red", type: "solid", value: "#ef4444" },
      { id: "bg-orange-500", name: "Orange", type: "solid", value: "#f97316" },
      { id: "bg-yellow-400", name: "Yellow", type: "solid", value: "#facc15" },
      { id: "bg-green-500", name: "Green", type: "solid", value: "#22c55e" },
      { id: "bg-teal-500", name: "Teal", type: "solid", value: "#14b8a6" },
      { id: "bg-blue-500", name: "Blue", type: "solid", value: "#3b82f6" },
      { id: "bg-indigo-500", name: "Indigo", type: "solid", value: "#6366f1" },
      { id: "bg-purple-500", name: "Purple", type: "solid", value: "#a855f7" },
      { id: "bg-pink-500", name: "Pink", type: "solid", value: "#ec4899" },
      { id: "bg-rose-500", name: "Rose", type: "solid", value: "#f43f5e" },
      { id: "bg-amber-500", name: "Amber", type: "solid", value: "#f59e0b" },
      { id: "bg-lime-500", name: "Lime", type: "solid", value: "#84cc16" },
      { id: "bg-emerald-500", name: "Emerald", type: "solid", value: "#10b981" },
      { id: "bg-cyan-500", name: "Cyan", type: "solid", value: "#06b6d4" },
      { id: "bg-sky-500", name: "Sky", type: "solid", value: "#0ea5e9" },
      { id: "bg-violet-500", name: "Violet", type: "solid", value: "#8b5cf6" },
      { id: "bg-fuchsia-500", name: "Fuchsia", type: "solid", value: "#d946ef" },
    ],
  },
  {
    id: "gradients",
    name: "Gradients",
    items: [
      { id: "grad-sunset", name: "Sunset", type: "gradient", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
      { id: "grad-ocean", name: "Ocean", type: "gradient", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
      { id: "grad-forest", name: "Forest", type: "gradient", value: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
      { id: "grad-fire", name: "Fire", type: "gradient", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
      { id: "grad-midnight", name: "Midnight", type: "gradient", value: "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)" },
      { id: "grad-candy", name: "Candy", type: "gradient", value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
      { id: "grad-royal", name: "Royal", type: "gradient", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
      { id: "grad-peach", name: "Peach", type: "gradient", value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
      { id: "grad-aurora", name: "Aurora", type: "gradient", value: "linear-gradient(135deg, #00c6fb 0%, #005bea 100%)" },
      { id: "grad-lavender", name: "Lavender", type: "gradient", value: "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)" },
      { id: "grad-mint", name: "Mint", type: "gradient", value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
      { id: "grad-blaze", name: "Blaze", type: "gradient", value: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)" },
      { id: "grad-twilight", name: "Twilight", type: "gradient", value: "linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)" },
      { id: "grad-rose", name: "Rose Gold", type: "gradient", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
      { id: "grad-neon", name: "Neon", type: "gradient", value: "linear-gradient(135deg, #00f260 0%, #0575e6 100%)" },
      { id: "grad-vintage", name: "Vintage", type: "gradient", value: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)" },
      { id: "grad-dark-ocean", name: "Dark Ocean", type: "gradient", value: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
      { id: "grad-shifter", name: "Shifter", type: "gradient", value: "linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)" },
      { id: "grad-mega-tron", name: "Megatron", type: "gradient", value: "linear-gradient(135deg, #c3cfe2 0%, #f5f7fa 100%)" },
      { id: "grad-clear-sky", name: "Clear Sky", type: "gradient", value: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)" },
    ],
  },
  {
    id: "dark-backgrounds",
    name: "Dark",
    items: [
      { id: "dark-void", name: "Void", type: "solid", value: "#000000" },
      { id: "dark-charcoal", name: "Charcoal", type: "solid", value: "#1a1a2e" },
      { id: "dark-navy", name: "Navy", type: "solid", value: "#0f3460" },
      { id: "dark-forest", name: "Deep Forest", type: "solid", value: "#1a2332" },
      { id: "dark-purple", name: "Deep Purple", type: "solid", value: "#16213e" },
      { id: "dark-slate", name: "Slate", type: "solid", value: "#1e293b" },
      { id: "dark-midnight", name: "Midnight", type: "solid", value: "#0c0c1d" },
      { id: "dark-space", name: "Space", type: "solid", value: "#0d1117" },
      { id: "dark-obsidian", name: "Obsidian", type: "solid", value: "#121212" },
      { id: "dark-coal", name: "Coal", type: "solid", value: "#222222" },
    ],
  },
];

export function getAllBackgrounds(): BackgroundItem[] {
  return backgroundCategories.flatMap((cat) => cat.items);
}

export function getBackgroundsByCategory(categoryId: string): BackgroundItem[] {
  const category = backgroundCategories.find((c) => c.id === categoryId);
  return category ? category.items : [];
}
