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
