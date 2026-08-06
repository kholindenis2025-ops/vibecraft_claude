"use client";

import { useState } from "react";
import { MODULE_ICONS, MODULE_ICON_LABELS, ModuleIcon } from "@/lib/module-icons";

export function IconPicker({ name, defaultValue = "compass" }: { name: string; defaultValue?: string }) {
  const [selected, setSelected] = useState(defaultValue);

  return (
    <div>
      <input type="hidden" name={name} value={selected} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {Object.keys(MODULE_ICONS).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-2.5 text-center transition-colors ${
              selected === key
                ? "border-accent bg-accent-soft text-accent"
                : "border-border text-text-muted hover:border-border-strong hover:bg-bg-soft"
            }`}
          >
            <ModuleIcon iconKey={key} size={20} />
            <span className="text-[11px] leading-tight">{MODULE_ICON_LABELS[key] ?? key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
