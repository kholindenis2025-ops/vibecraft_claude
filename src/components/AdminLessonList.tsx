"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { FileEdit, ClipboardList, PlayCircle, FileText, AlignLeft, GripVertical } from "lucide-react";
import { adminReorderLessonsAction } from "@/lib/actions/content-actions";
import { AdminDeleteLessonButton } from "@/components/AdminDeleteLessonButton";

export type LessonRow = {
  id: string;
  title: string;
  hasHomework: boolean;
  hasContent: boolean;
  videoCount: number;
  slideCount: number;
  contentUpdatedAt: Date | null;
};

export function AdminLessonList({ moduleId, lessons }: { moduleId: string; lessons: LessonRow[] }) {
  const [items, setItems] = useState(lessons);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => setItems(lessons), [lessons]);

  function handleDrop(targetId: string) {
    const draggedId = dragId;
    setDragId(null);
    if (!draggedId || draggedId === targetId) return;

    const fromIndex = items.findIndex((i) => i.id === draggedId);
    const toIndex = items.findIndex((i) => i.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setItems(next);

    startTransition(async () => {
      await adminReorderLessonsAction(moduleId, next.map((i) => i.id));
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((lesson) => (
        <div
          key={lesson.id}
          draggable={!isPending}
          onDragStart={() => setDragId(lesson.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(lesson.id)}
          onDragEnd={() => setDragId(null)}
          className={`flex items-center gap-1 rounded-lg transition-opacity ${
            dragId === lesson.id ? "opacity-40" : ""
          }`}
        >
          <span className="shrink-0 cursor-grab px-1 text-text-dim active:cursor-grabbing">
            <GripVertical size={15} />
          </span>
          <Link
            href={`/admin/content/${lesson.id}`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-bg-soft"
          >
            <FileEdit size={15} className="shrink-0 text-text-dim" />
            <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
            {lesson.hasContent && (
              <span title="Есть текст урока">
                <AlignLeft size={14} className="shrink-0 text-accent" />
              </span>
            )}
            {lesson.videoCount > 0 && (
              <span title="Есть видео">
                <PlayCircle size={14} className="shrink-0 text-accent" />
              </span>
            )}
            {lesson.slideCount > 0 && (
              <span title="Есть презентация (PDF)">
                <FileText size={14} className="shrink-0 text-accent" />
              </span>
            )}
            {lesson.hasHomework && (
              <span title="Есть домашнее задание">
                <ClipboardList size={14} className="shrink-0 text-accent" />
              </span>
            )}
            {lesson.contentUpdatedAt && (
              <span
                title="Материал обновлён"
                className="shrink-0 whitespace-nowrap text-xs text-text-dim"
              >
                {new Date(lesson.contentUpdatedAt).toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            )}
          </Link>
          <AdminDeleteLessonButton lessonId={lesson.id} lessonTitle={lesson.title} />
        </div>
      ))}
    </div>
  );
}
