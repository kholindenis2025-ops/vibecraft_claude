import Link from "next/link";
import { Trophy, Flame, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getCourseSummary } from "@/lib/progress";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const user = await requireUser();
  const summary = await getCourseSummary(user.id);
  const unlockedCount = await prisma.userAchievement.count({ where: { userId: user.id } });
  const totalAchievements = await prisma.achievement.count();

  const coreModules = summary.modules.filter((m) => m.category === "MODULE");
  const completedCoreModules = coreModules.filter((m) => m.isComplete).length;

  const nextModule =
    summary.modules.find((m) => !m.isComplete && m.completedLessons > 0) ??
    summary.modules.find((m) => !m.isComplete);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="kicker">Дашборд</span>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
          Привет, {user.name} {user.avatarEmoji}
        </h1>
        <p className="mt-1 text-text-muted">Продолжай в том же темпе — ты уже неплохо продвинулся.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">Прогресс курса</span>
            <span className="text-lg font-bold text-accent">{summary.percent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${summary.percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-text-dim">
            {summary.completedLessons} из {summary.totalLessons} уроков
          </p>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2 text-text-muted">
            <CheckCircle2 size={16} />
            <span className="text-sm font-medium">Модули пройдены</span>
          </div>
          <p className="text-2xl font-bold">
            {completedCoreModules}
            <span className="text-base font-normal text-text-dim"> / {coreModules.length}</span>
          </p>
        </div>

        <Link href="/achievements" className="card card-hover p-5">
          <div className="mb-3 flex items-center gap-2 text-text-muted">
            <Trophy size={16} />
            <span className="text-sm font-medium">Достижения</span>
          </div>
          <p className="text-2xl font-bold">
            {unlockedCount}
            <span className="text-base font-normal text-text-dim"> / {totalAchievements}</span>
          </p>
        </Link>
      </div>

      {nextModule && (
        <Link
          href={`/modules/${nextModule.slug}`}
          className="card card-hover flex items-center gap-4 p-5 sm:p-6"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-2xl">
            {nextModule.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-accent">
              <Flame size={13} /> Продолжить обучение
            </p>
            <p className="truncate font-bold">{nextModule.title}</p>
            <p className="text-sm text-text-muted">
              {nextModule.completedLessons} из {nextModule.totalLessons} уроков пройдено
            </p>
          </div>
          <ArrowRight className="shrink-0 text-text-dim" size={20} />
        </Link>
      )}

      <Link href="/learn" className="card card-hover flex items-center gap-4 p-5 sm:p-6">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <BookOpen size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">Вся программа курса</p>
          <p className="text-sm text-text-muted">
            Введение · {coreModules.length} модулей · инструментарий · бонус и материалы
          </p>
        </div>
        <ArrowRight className="shrink-0 text-text-dim" size={20} />
      </Link>
    </div>
  );
}
