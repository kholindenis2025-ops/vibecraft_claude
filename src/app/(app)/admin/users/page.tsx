import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield, GraduationCap, MailWarning, Clock, Ban, CheckCircle2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getAllUsersWithStats } from "@/lib/admin-data";
import { Avatar } from "@/components/Avatar";
import { AdminPasswordForm } from "@/components/AdminPasswordForm";
import { AdminDeleteUserButton } from "@/components/AdminDeleteUserButton";
import { AdminVerifyUserButton } from "@/components/AdminVerifyUserButton";
import { AdminRoleSelect } from "@/components/AdminRoleSelect";
import { AdminAccessButtons } from "@/components/AdminAccessButtons";
import type { AccessStatus } from "@/lib/access";

const ROLE_BADGE: Record<string, { label: string; icon: typeof Shield }> = {
  ADMIN: { label: "Админ", icon: Shield },
  CURATOR: { label: "Куратор", icon: GraduationCap },
};

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");
  if (currentUser.role !== "ADMIN" && currentUser.role !== "CURATOR") redirect("/dashboard");

  const isAdmin = currentUser.role === "ADMIN";
  const users = await getAllUsersWithStats();
  const reviewQueue = users.filter((u) => u.readyForReview);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="kicker">{isAdmin ? "Администратор" : "Куратор"}</span>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Пользователи</h1>
        <p className="mt-1 text-text-muted">{users.length} зарегистрировано</p>
      </div>

      <section className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Заявки на доступ</h2>
          <span className="text-xs text-text-dim">{reviewQueue.length}</span>
        </div>
        {reviewQueue.length === 0 ? (
          <p className="text-sm text-text-muted">
            Сейчас никто не ждёт одобрения. Сюда попадают только те, кто подтвердил почту.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {reviewQueue.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center"
              >
                <Link href={`/admin/users/${u.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.name}</p>
                  <p className="truncate text-sm text-text-dim">{u.email}</p>
                </Link>
                {isAdmin && <AdminAccessButtons userId={u.id} accessStatus={u.accessStatus} />}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="flex flex-col gap-3">
        {users.map((u) => {
          const badge = ROLE_BADGE[u.role];
          return (
            <div key={u.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <Link
                href={`/admin/users/${u.id}`}
                className="-m-2 flex min-w-0 flex-1 flex-col gap-4 rounded-lg p-2 transition-colors hover:bg-bg-soft sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={u.name} size={36} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate font-semibold">
                      {u.name}
                      {badge && (
                        <span className="badge-accent !px-2 !py-0.5">
                          <badge.icon size={11} /> {badge.label}
                        </span>
                      )}
                      {!u.emailVerified && (
                        <span className="badge !px-2 !py-0.5 text-warning">
                          <MailWarning size={11} /> Почта не подтверждена
                        </span>
                      )}
                      {u.role === "STUDENT" && <AccessBadge status={u.accessStatus} emailVerified={u.emailVerified} />}
                    </p>
                    <p className="truncate text-sm text-text-dim">{u.email}</p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-1 sm:w-48">
                  <div className="flex items-center justify-between text-xs text-text-dim">
                    <span>Прогресс</span>
                    <span>
                      {u.completedLessons}/{u.totalLessons} · {u.percent}%
                    </span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${u.percent}%` }} />
                  </div>
                  <p className="text-xs text-text-dim">Достижений: {u.achievementsCount}</p>
                </div>
              </Link>

              {isAdmin && (
                <div className="flex shrink-0 flex-wrap items-start gap-2 sm:w-64 sm:justify-end">
                  {u.id !== currentUser.id && <AdminRoleSelect userId={u.id} role={u.role} />}
                  <AdminPasswordForm userId={u.id} />
                  {!u.emailVerified && <AdminVerifyUserButton userId={u.id} />}
                  {u.role === "STUDENT" && (
                    <AdminAccessButtons userId={u.id} accessStatus={u.accessStatus} />
                  )}
                  {u.id !== currentUser.id && (
                    <AdminDeleteUserButton userId={u.id} userName={u.name} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AccessBadge({
  status,
  emailVerified,
}: {
  status: AccessStatus;
  emailVerified: boolean;
}) {
  if (status === "ACTIVE") {
    return (
      <span className="badge !px-2 !py-0.5 text-accent">
        <CheckCircle2 size={11} /> доступ открыт
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="badge !px-2 !py-0.5 text-danger">
        <Ban size={11} /> отклонён
      </span>
    );
  }
  if (!emailVerified) {
    return (
      <span className="badge !px-2 !py-0.5 text-warning">
        <MailWarning size={11} /> ждёт почту
      </span>
    );
  }
  return (
    <span className="badge !px-2 !py-0.5 text-warning">
      <Clock size={11} /> ждёт доступ
    </span>
  );
}
