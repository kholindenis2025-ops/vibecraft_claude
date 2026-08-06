import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationLink } from "@/components/NotificationLink";

export default async function UpdatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { reads: { none: { userId: user.id } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="kicker">Обновления</span>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Что нового на курсе</h1>
        <p className="mt-1 text-text-muted">
          Новые видео, презентации и материалы. Открытая запись пропадает из этого списка.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center text-text-muted">
          <Bell size={28} className="text-text-dim" />
          Новых материалов нет — ты всё посмотрел(а).
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <NotificationLink
              key={n.id}
              notificationId={n.id}
              href={n.href}
              className="card card-hover flex items-start gap-3 p-4 sm:p-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Bell size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold">{n.title}</p>
                  <span className="badge-accent">Новое</span>
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
            </NotificationLink>
          ))}
        </div>
      )}
    </div>
  );
}
