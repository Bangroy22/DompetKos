export interface Category {
  name: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: Category[] = [
  { name: "Makan", emoji: "🍜", color: "#F59E0B" },
  { name: "Kopi/Jajan", emoji: "🧋", color: "#FB923C" },
  { name: "Transport", emoji: "🛵", color: "#14B8A6" },
  { name: "Kos", emoji: "🏠", color: "#0F766E" },
  { name: "Hiburan", emoji: "🎮", color: "#FB7185" },
  { name: "Lainnya", emoji: "✨", color: "#5EEAD4" },
];

export function categoryMeta(name: string): Category {
  return (
    CATEGORIES.find((c) => c.name === name) ??
    CATEGORIES[CATEGORIES.length - 1]
  );
}
