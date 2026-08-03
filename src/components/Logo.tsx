import { Gem } from "lucide-react";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-lg bg-accent text-accent-contrast"
      style={{ width: size, height: size }}
    >
      <Gem size={Math.round(size * 0.55)} strokeWidth={2} />
    </span>
  );
}
