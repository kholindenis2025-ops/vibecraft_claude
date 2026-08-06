import Link from "next/link";
import { redirect } from "next/navigation";
import { FileEdit, ClipboardList, PlayCircle, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupByCategory, CATEGORY_SECTION_LABELS, CATEGORY_CARD_LABELS, CATEGORY_ORDER, type ModuleCategory } from "@/lib/categories";
import { MODULE_ICONS } from "@/lib/module-icons";
import { adminCreateModuleAction, adminCreateLessonAction } from "@/lib/actions/content-actions";
import { AdminDeleteModuleButton } from "@/components/AdminDeleteModuleButton";
import { AdminDeleteLessonButton } from "@/components/AdminDeleteLessonButton";

export default async function AdminContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          homework: { select: { id: true } },
          _count: { select: { videos: true } },
        },
      },
    },
  });

  const grouped = groupByCategory(
    modules.map((m) => ({ ...m, category: m.category as ModuleCategory }))
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="kicker">Администратор</span>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Материалы курса</h1>
        <p className="mt-1 text-text-muted">
          Загружай видео, PDF, пиши текст урока, домашку, ссылки и словарь терминов. Добавляй новые модули и уроки
          или удаляй ненужные.
        </p>
      </div>

      <details className="card p-4 sm:p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-accent">
          <Plus size={16} /> Новый модуль
        </summary>
        <form action={adminCreateModuleAction} className="mt-4 flex flex-col gap-3">
          <input name="title" required placeholder="Название модуля" className="input" />
          <textarea
            name="description"
            placeholder="Краткое описание модуля"
            rows={2}
            className="input resize-y"
          />
          <div className="flex flex-wrap gap-3">
            <select name="category" defaultValue="MODULE" className="input !w-auto">
              {CATEGORY_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_CARD_LABELS[c]}
                </option>
              ))}
            </select>
            <select name="icon" defaultValue="compass" className="input !w-auto">
              {Object.keys(MODULE_ICONS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary self-start">
            Создать модуль
          </button>
        </form>
      </details>

      {grouped.map(({ category, items }) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-dim">
            {CATEGORY_SECTION_LABELS[category]}
          </h2>
          {items.map((mod) => (
            <div key={mod.id} className="card p-4 sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-bold">{mod.title}</p>
                <AdminDeleteModuleButton moduleId={mod.id} moduleTitle={mod.title} />
              </div>
              <div className="flex flex-col gap-1.5">
                {mod.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-1">
                    <Link
                      href={`/admin/content/${lesson.id}`}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-bg-soft"
                    >
                      <FileEdit size={15} className="shrink-0 text-text-dim" />
                      <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                      {lesson._count.videos > 0 && (
                        <span title="Есть видео">
                          <PlayCircle size={14} className="shrink-0 text-accent" />
                        </span>
                      )}
                      {lesson.homework && (
                        <span title="Есть домашнее задание">
                          <ClipboardList size={14} className="shrink-0 text-accent" />
                        </span>
                      )}
                    </Link>
                    <AdminDeleteLessonButton lessonId={lesson.id} lessonTitle={lesson.title} />
                  </div>
                ))}
              </div>
              <form
                action={adminCreateLessonAction.bind(null, mod.id)}
                className="mt-2 flex items-center gap-2 border-t border-border pt-3"
              >
                <input
                  name="title"
                  required
                  placeholder="Название нового урока"
                  className="input !py-1.5 text-sm"
                />
                <button type="submit" className="btn-ghost shrink-0 !py-1.5 text-xs">
                  <Plus size={14} /> Добавить урок
                </button>
              </form>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
