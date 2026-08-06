"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { adminDeleteLessonAction } from "@/lib/actions/content-actions";

export function AdminDeleteLessonButton({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        `Удалить урок «${lessonTitle}»? Материалы, прогресс учеников и домашние задания по нему будут удалены безвозвратно.`
      )
    )
      return;
    startTransition(async () => {
      await adminDeleteLessonAction(lessonId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="shrink-0 rounded-lg p-1.5 text-text-dim transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-50"
      title="Удалить урок"
    >
      <Trash2 size={14} />
    </button>
  );
}
