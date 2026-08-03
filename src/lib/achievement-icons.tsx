import {
  Sprout,
  PackageCheck,
  Mountain,
  Trophy,
  Target,
  BrainCog,
  Send,
  BadgeCheck,
  Medal,
  type LucideIcon,
} from "lucide-react";

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  sprout: Sprout,
  "package-check": PackageCheck,
  mountain: Mountain,
  trophy: Trophy,
  target: Target,
  "brain-cog": BrainCog,
  send: Send,
  "badge-check": BadgeCheck,
  medal: Medal,
};

export function AchievementIcon({
  iconKey,
  size = 20,
  className,
}: {
  iconKey: string;
  size?: number;
  className?: string;
}) {
  const Icon = ACHIEVEMENT_ICONS[iconKey] ?? Trophy;
  return <Icon size={size} className={className} />;
}
