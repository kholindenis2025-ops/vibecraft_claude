import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Clock, HelpCircle, ClipboardList } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ModulePage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const user = await requireUser();

  const mod = await prisma.module.findUnique({
    where: { slug: moduleSlug },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          progress: { where: { userId: user.id } },
          quiz: { select: { id: true } },
          homework: { select: { id: true } },
        },
      },
    },
  });

  if (!mod) notFound();

  const total = mod.lessons.length;
  const completed = mod.lessons.filter((l) => l.progress[0]?.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/learn" className="text-sm text-text-muted hover:text-accent">
          ← Вся программа
        </Link>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-3xl">
            {mod.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold sm:text-2xl">{mod.title}</h1>
            <p className="mt-1 text-text-muted">{mod.description}</p>
          </div>
        </div>
        <div className="mt-5">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-text-dim">
            {completed} из {total} уроков пройдено · {percent}%
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {mod.lessons.map((lesson, i) => {
          const isDone = Boolean(lesson.progress[0]?.completed);
          return (
            <Link
              key={lesson.id}
              href={`/modules/${mod.slug}/${lesson.slug}`}
              className="card card-hover flex items-center gap-4 p-4"
            >
              {isDone ? (
                <CheckCircle2 className="shrink-0 text-accent" size={22} />
              ) : (
                <Circle className="shrink-0 text-text-dim" size={22} />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-dim">Урок {i + 1}</p>
                <p className="truncate font-medium">{lesson.title}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-text-dim">
                <span className="hidden items-center gap-1 text-xs sm:flex">
                  <Clock size={13} /> {lesson.durationMin} мин
                </span>
                {lesson.quiz && (
                  <span title="Есть тест">
                    <HelpCircle size={16} />
                  </span>
                )}
                {lesson.homework && (
                  <span title="Есть домашнее задание">
                    <ClipboardList size={16} />
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
