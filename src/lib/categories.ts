export interface Category {
  name: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { name: "Makan", emoji: "🍜", color: "#f97316" },
  { name: "Kopi/Jajan", emoji: "🧋", color: "#eab308" },
  { name: "Transport", emoji: "🛵", color: "#3b82f6" },
  { name: "Kos", emoji: "🏠", color: "#8b5cf6" },
  { name: "Hiburan", emoji: "🎮", color: "#ec4899" },
  { name: "Lainnya", emoji: "✨", color: "#14b8a6" },
];

export function categoryMeta(name: string): Category {
  return (
    CATEGORIES.find((c) => c.name === name) ??
    CATEGORIES[CATEGORIES.length - 1]
  );
}
