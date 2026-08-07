import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  Shield,
  GraduationCap,
  MailWarning,
  MailCheck,
  CheckCircle2,
  Circle,
  FileText,
  Clock,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { ModuleIcon } from "@/lib/module-icons";
import { AchievementIcon } from "@/lib/achievement-icons";
import { HomeworkReviewForm } from "@/components/HomeworkReviewForm";
import { groupByCategory, CATEGORY_SECTION_LABELS, type ModuleCategory } from "@/lib/categories";
import { lessonsWord } from "@/lib/plural";

const ROLE_BADGE: Record<string, { label: string; icon: typeof Shield }> = {
  ADMIN: { label: "Админ", icon: Shield },
  CURATOR: { label: "Куратор", icon: GraduationCap },
};

const STATUS_META = {
  PENDING: { label: "На проверке", icon: Clock, className: "text-warning" },
  APPROVED: { label: "Принято", icon: CheckCircle2, className: "text-accent" },
  REJECTED: { label: "Нужно доработать", icon: XCircle, className: "text-danger" },
} as const;

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "ADMIN" && currentUser.role !== "CURATOR") redirect("/dashboard");

  const { userId } = await params;

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      emailVerified: true,
    },
  });
  if (!student) notFound();

  const [modules, submissions, userAchievements, totalAchievements] = await Promise.all([
    prisma.module.findMany({
      orderBy: { order: "asc" },
      include: {
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            progress: {
              where: { userId: student.id },
              select: { completed: true, completedAt: true },
            },
          },
        },
      },
    }),
    prisma.homeworkSubmission.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: {
        files: true,
        homework: {
          include: { lesson: { include: { module: { select: { title: true } } } } },
        },
      },
    }),
    prisma.userAchievement.findMany({
      where: { userId: student.id },
      include: { achievement: true },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.achievement.count(),
  ]);

  const grouped = groupByCategory(
    modules.map((m) => ({ ...m, category: m.category as ModuleCategory }))
  );

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.progress[0]?.completed).length,
    0
  );
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  const badge = ROLE_BADGE[student.role];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin/users" className="text-sm text-text-muted hover:text-accent">
        ← Пользователи
      </Link>

      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar name={student.name} size={48} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 text-lg font-bold">
            {student.name}
            {badge && (
              <span className="badge-accent !px-2 !py-0.5">
                <badge.icon size={11} /> {badge.label}
              </span>
            )}
          </p>
          <p className="text-sm text-text-dim">{student.email}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-dim">
            <span>
              Регистрация {student.createdAt.toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" })}
            </span>
            {student.emailVerified ? (
              <span className="flex items-center gap-1 text-accent">
                <MailCheck size={13} /> Почта подтверждена
              </span>
            ) : (
              <span className="flex items-center gap-1 text-warning">
                <MailWarning size={13} /> Почта не подтверждена
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <p className="text-2xl font-bold text-accent">{percent}%</p>
          <p className="text-xs text-text-dim">
            {completedLessons} из {totalLessons} {lessonsWord(totalLessons)}
          </p>
          <p className="text-xs text-text-dim">
            Достижений: {userAchievements.length} из {totalAchievements}
          </p>
        </div>
      </div>

      {userAchievements.length > 0 && (
        <div className="card p-5 sm:p-6">
          <h2 className="mb-3 font-bold">Достижения</h2>
          <div className="flex flex-wrap gap-2">
            {userAchievements.map((ua) => (
              <span key={ua.id} className="badge-accent" title={ua.achievement.description}>
                <AchievementIcon iconKey={ua.achievement.icon} size={13} />
                {ua.achievement.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5 sm:p-6">
        <h2 className="mb-4 font-bold">Прогресс по программе</h2>
        <div className="flex flex-col gap-5">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
                {CATEGORY_SECTION_LABELS[category]}
              </p>
              <div className="flex flex-col gap-2">
                {items.map((mod) => {
                  const modCompleted = mod.lessons.filter((l) => l.progress[0]?.completed).length;
                  return (
                    <details key={mod.id} className="rounded-xl border border-border">
                      <summary className="flex cursor-pointer items-center gap-3 p-3 text-sm">
                        <ModuleIcon iconKey={mod.icon} size={16} />
                        <span className="min-w-0 flex-1 truncate font-medium">{mod.title}</span>
                        <span className="shrink-0 text-xs text-text-dim">
                          {modCompleted}/{mod.lessons.length}
                        </span>
                      </summary>
                      <div className="flex flex-col gap-1 border-t border-border p-3">
                        {mod.lessons.map((lesson) => {
                          const isDone = Boolean(lesson.progress[0]?.completed);
                          const completedAt = lesson.progress[0]?.completedAt;
                          return (
                            <div key={lesson.id} className="flex items-center gap-2 text-sm">
                              {isDone ? (
                                <CheckCircle2 size={15} className="shrink-0 text-accent" />
                              ) : (
                                <Circle size={15} className="shrink-0 text-text-dim" />
                              )}
                              <span className={`min-w-0 flex-1 truncate ${isDone ? "" : "text-text-muted"}`}>
                                {lesson.title}
                              </span>
                              {isDone && completedAt && (
                                <span className="shrink-0 whitespace-nowrap text-xs text-text-dim">
                                  {completedAt.toLocaleString("ru-RU", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    timeZone: "Europe/Moscow",
                                  })}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="mb-4 font-bold">Домашние задания ({submissions.length})</h2>
        {submissions.length === 0 && (
          <p className="text-sm text-text-dim">Ещё ничего не отправлял(а).</p>
        )}
        <div className="flex flex-col gap-3">
          {submissions.map((s) => {
            const meta = STATUS_META[s.status];
            return (
              <div key={s.id} className="rounded-xl border border-border p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-text-dim">
                    {s.homework.lesson.module.title} · {s.homework.title}
                  </p>
                  <span className={`flex items-center gap-1.5 text-xs font-semibold ${meta.className}`}>
                    <meta.icon size={13} /> {meta.label}
                  </span>
                </div>
                {s.answerText && (
                  <p className="mb-2 whitespace-pre-wrap rounded-lg bg-bg-soft p-3 text-sm">
                    {s.answerText}
                  </p>
                )}
                {s.answerUrl && (
                  <a
                    href={s.answerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 inline-block text-sm text-accent hover:underline"
                  >
                    {s.answerUrl}
                  </a>
                )}
                {s.files.length > 0 && (
                  <div className="mb-2 flex flex-col gap-1">
                    {s.files.map((f) => (
                      <a
                        key={f.id}
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                      >
                        <FileText size={13} /> {f.name}
                      </a>
                    ))}
                  </div>
                )}
                <p className="mb-2 text-xs text-text-dim">
                  Отправлено {s.createdAt.toLocaleString("ru-RU")}
                </p>
                {s.feedback && (
                  <p className="mb-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
                    <span className="font-semibold">Комментарий куратора: </span>
                    {s.feedback}
                  </p>
                )}
                {s.status === "PENDING" && <HomeworkReviewForm submissionId={s.id} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
