import {
  ShieldAlert,
  Compass,
  Lightbulb,
  Radar,
  LayoutGrid,
  Globe,
  Handshake,
  Flag,
  Map,
  Wrench,
  PiggyBank,
  Bot,
  Smartphone,
  Library,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";

export const MODULE_ICONS: Record<string, LucideIcon> = {
  "shield-alert": ShieldAlert,
  compass: Compass,
  lightbulb: Lightbulb,
  radar: Radar,
  "layout-grid": LayoutGrid,
  globe: Globe,
  handshake: Handshake,
  flag: Flag,
  map: Map,
  wrench: Wrench,
  "piggy-bank": PiggyBank,
  bot: Bot,
  smartphone: Smartphone,
  library: Library,
  "notebook-pen": NotebookPen,
};

export const MODULE_ICON_LABELS: Record<string, string> = {
  "shield-alert": "Предупреждение",
  compass: "Компас",
  lightbulb: "Идея",
  radar: "Радар",
  "layout-grid": "Сетка",
  globe: "Глобус",
  handshake: "Рукопожатие",
  flag: "Флажок",
  map: "Карта",
  wrench: "Инструмент",
  "piggy-bank": "Копилка",
  bot: "Робот",
  smartphone: "Смартфон",
  library: "Библиотека",
  "notebook-pen": "Блокнот",
};

export function ModuleIcon({
  iconKey,
  size = 20,
  className,
}: {
  iconKey: string;
  size?: number;
  className?: string;
}) {
  const Icon = MODULE_ICONS[iconKey] ?? Compass;
  return <Icon size={size} className={className} />;
}
