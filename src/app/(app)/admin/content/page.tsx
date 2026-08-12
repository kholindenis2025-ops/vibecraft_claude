import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, HelpCircle, Pencil } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupByCategory, CATEGORY_SECTION_LABELS, CATEGORY_CARD_LABELS, CATEGORY_ORDER, type ModuleCategory } from "@/lib/categories";
import { adminCreateModuleAction, adminCreateLessonAction, adminUpdateModuleAction } from "@/lib/actions/content-actions";
import { AdminDeleteModuleButton } from "@/components/AdminDeleteModuleButton";
import { AdminLessonList } from "@/components/AdminLessonList";
import { IconPicker } from "@/components/IconPicker";

export default async function AdminContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    include: {
      quiz: { select: { id: true, _count: { select: { questions: true } } } },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          content: true,
          contentUpdatedAt: true,
          homework: { select: { id: true } },
          _count: { select: { videos: true, slides: true, materials: true } },
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
          или удаляй ненужные. Перетаскивай уроки за иконку {"⠿"} слева, чтобы менять их порядок.
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
          <select name="category" defaultValue="MODULE" className="input !w-auto">
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_CARD_LABELS[c]}
              </option>
            ))}
          </select>
          <div>
            <p className="mb-2 text-xs font-medium text-text-dim">Иконка модуля</p>
            <IconPicker name="icon" defaultValue="compass" />
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
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/content/quiz/${mod.id}`}
                    className="btn-ghost !px-2 !py-1.5 text-xs"
                  >
                    <HelpCircle size={14} />
                    {mod.quiz ? `Тест (${mod.quiz._count.questions})` : "Добавить тест"}
                  </Link>
                  <AdminDeleteModuleButton moduleId={mod.id} moduleTitle={mod.title} />
                </div>
              </div>

              <details className="mb-3 rounded-lg border border-border p-3">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-text-dim">
                  <Pencil size={12} /> Изменить модуль
                </summary>
                <form
                  action={adminUpdateModuleAction.bind(null, mod.id)}
                  className="mt-3 flex flex-col gap-3"
                >
                  <input
                    name="title"
                    required
                    defaultValue={mod.title}
                    placeholder="Название модуля"
                    className="input"
                  />
                  <textarea
                    name="description"
                    defaultValue={mod.description}
                    placeholder="Краткое описание модуля"
                    rows={2}
                    className="input resize-y"
                  />
                  <select name="category" defaultValue={mod.category} className="input !w-auto">
                    {CATEGORY_ORDER.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_CARD_LABELS[c]}
                      </option>
                    ))}
                  </select>
                  <div>
                    <p className="mb-2 text-xs font-medium text-text-dim">Иконка модуля</p>
                    <IconPicker name="icon" defaultValue={mod.icon} />
                  </div>
                  <button type="submit" className="btn-primary self-start text-sm">
                    Сохранить изменения
                  </button>
                </form>
              </details>

              <AdminLessonList
                moduleId={mod.id}
                lessons={mod.lessons.map((lesson) => ({
                  id: lesson.id,
                  title: lesson.title,
                  hasHomework: Boolean(lesson.homework),
                  hasContent: lesson.content.trim().length > 0,
                  videoCount: lesson._count.videos,
                  slideCount: lesson._count.slides,
                  materialCount: lesson._count.materials,
                  contentUpdatedAt: lesson.contentUpdatedAt,
                }))}
              />
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
