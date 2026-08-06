"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { adminDeleteModuleAction } from "@/lib/actions/content-actions";

export function AdminDeleteModuleButton({ moduleId, moduleTitle }: { moduleId: string; moduleTitle: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Удалить модуль «${moduleTitle}» вместе со всеми его уроками, тестами и домашними заданиями? Это действие необратимо.`
      )
    )
      return;
    startTransition(async () => {
      await adminDeleteModuleAction(moduleId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn-ghost !px-2 !py-1.5 text-xs text-danger hover:text-danger"
      title="Удалить модуль"
    >
      <Trash2 size={14} /> {isPending ? "Удаляем…" : "Удалить модуль"}
    </button>
  );
}
