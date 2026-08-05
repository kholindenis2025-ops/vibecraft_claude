"use client";

import { useState } from "react";
import { Download, X, Share, SquarePlus } from "lucide-react";
import { useInstallApp } from "@/components/InstallAppProvider";

export function InstallAppButton({
  className = "btn-secondary",
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const { canInstall, isInstalled, isIOS, promptInstall } = useInstallApp();
  const [showIOSHint, setShowIOSHint] = useState(false);

  if (isInstalled) return null;
  if (!canInstall && !isIOS) return null;

  return (
    <>
      <button
        type="button"
        onClick={canInstall ? promptInstall : () => setShowIOSHint(true)}
        className={className}
        title="Установить приложение"
      >
        <Download size={16} /> {!iconOnly && "Установить приложение"}
      </button>

      {showIOSHint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowIOSHint(false)}
        >
          <div
            className="card max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Установка на iPhone/iPad</h2>
              <button onClick={() => setShowIOSHint(false)} className="text-text-dim hover:text-text">
                <X size={18} />
              </button>
            </div>
            <ol className="flex flex-col gap-3 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  1
                </span>
                <span>
                  Открой этот сайт в браузере <strong className="text-text">Safari</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  2
                </span>
                <span className="flex items-center gap-1.5">
                  Нажми кнопку «Поделиться» <Share size={14} className="inline text-accent" />
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                  3
                </span>
                <span className="flex items-center gap-1.5">
                  Выбери «На экран «Домой»» <SquarePlus size={14} className="inline text-accent" />
                </span>
              </li>
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
