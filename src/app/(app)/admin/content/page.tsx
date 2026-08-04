import Link from "next/link";
import { redirect } from "next/navigation";
import { FileEdit, ClipboardList, PlayCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupByCategory, CATEGORY_SECTION_LABELS, type ModuleCategory } from "@/lib/categories";

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
          Загружай видео, PDF, пиши текст урока, домашку, ссылки и словарь терминов.
        </p>
      </div>

      {grouped.map(({ category, items }) => (
        <div key={category} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-dim">
            {CATEGORY_SECTION_LABELS[category]}
          </h2>
          {items.map((mod) => (
            <div key={mod.id} className="card p-4 sm:p-5">
              <p className="mb-3 font-bold">{mod.title}</p>
              <div className="flex flex-col gap-1.5">
                {mod.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/admin/content/${lesson.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-bg-soft"
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
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
