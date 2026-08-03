export type ModuleCategory = "INTRO" | "MODULE" | "TOOL" | "BONUS" | "MATERIAL";

export const CATEGORY_ORDER: ModuleCategory[] = ["INTRO", "MODULE", "TOOL", "BONUS", "MATERIAL"];

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  INTRO: "Введение",
  MODULE: "Модуль",
  TOOL: "Инструмент",
  BONUS: "Бонус",
  MATERIAL: "Материалы",
};

export const CATEGORY_DESCRIPTIONS: Record<ModuleCategory, string> = {
  INTRO: "Настройся на курс перед стартом",
  MODULE: "Основная программа — шесть модулей от идеи до дохода",
  TOOL: "Чек-листы и скиллы для Claude Code и Codex",
  BONUS: "Дополнительные возможности курса",
  MATERIAL: "Статьи и материалы для углублённого изучения",
};

export function categoryBadge(category: ModuleCategory, indexInCategory: number): string {
  if (category === "MODULE") return `Модуль ${indexInCategory}`;
  return CATEGORY_LABELS[category];
}

export function groupByCategory<T extends { category: ModuleCategory }>(
  items: T[]
): { category: ModuleCategory; items: T[] }[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}
