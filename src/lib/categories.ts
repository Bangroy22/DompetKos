export interface Category {
  name: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { name: "Makan", emoji: "🍜", color: "#F59E0B" },
  { name: "Kopi/Jajan", emoji: "🧋", color: "#FB923C" },
  { name: "Transport", emoji: "🛵", color: "#10B981" },
  { name: "Kos", emoji: "🏠", color: "#047857" },
  { name: "Hiburan", emoji: "🎮", color: "#FB7185" },
  { name: "Lainnya", emoji: "✨", color: "#6CE9B7" },
];

export function categoryMeta(name: string): Category {
  return (
    CATEGORIES.find((c) => c.name === name) ??
    CATEGORIES[CATEGORIES.length - 1]
  );
}
