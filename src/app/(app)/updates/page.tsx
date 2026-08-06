import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UpdatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [notifications, state] = await Promise.all([
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.notificationState.findUnique({ where: { userId: user.id } }),
  ]);

  const previousSeenAt = state?.lastSeenAt ?? new Date(0);

  await prisma.notificationState.upsert({
    where: { userId: user.id },
    update: { lastSeenAt: new Date() },
    create: { userId: user.id, lastSeenAt: new Date() },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="kicker">Обновления</span>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Что нового на курсе</h1>
        <p className="mt-1 text-text-muted">
          Здесь появляются новые видео, презентации и материалы по мере добавления.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center text-text-muted">
          <Bell size={28} className="text-text-dim" />
          Пока новых материалов нет — загляни позже.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const isNew = n.createdAt > previousSeenAt;
            return (
              <Link
                key={n.id}
                href={n.href}
                className="card card-hover flex items-start gap-3 p-4 sm:p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Bell size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{n.title}</p>
                    {isNew && <span className="badge-accent">Новое</span>}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{n.message}</p>
                  <p className="mt-1.5 text-xs text-text-dim">
                    {n.createdAt.toLocaleDateString("ru-RU", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "Europe/Moscow",
                    })}
                  </p>
                </div>
                <ArrowRight size={16} className="mt-2 shrink-0 text-text-dim" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
