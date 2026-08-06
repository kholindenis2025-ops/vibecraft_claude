import Link from "next/link";
import { LayoutDashboard, BookOpen, Trophy, ClipboardCheck, Users, FileEdit, LogOut, Bell } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { InstallAppButton } from "@/components/InstallAppButton";

type Props = {
  user: {
    name: string;
    email: string;
    role: "STUDENT" | "CURATOR" | "ADMIN";
  };
  unreadCount?: number;
};

export function SiteHeader({ user, unreadCount = 0 }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight">
          <Logo size={32} />
          <span className="hidden lg:inline">
            VIBE<span className="text-accent">CRAFT</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
          >
            <LayoutDashboard size={16} />
            <span className="hidden lg:inline">Дашборд</span>
          </Link>
          <Link
            href="/learn"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
          >
            <BookOpen size={16} />
            <span className="hidden lg:inline">Программа</span>
          </Link>
          <Link
            href="/achievements"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
          >
            <Trophy size={16} />
            <span className="hidden lg:inline">Достижения</span>
          </Link>
          {(user.role === "ADMIN" || user.role === "CURATOR") && (
            <>
              <Link
                href="/admin/homework"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
              >
                <ClipboardCheck size={16} />
                <span className="hidden lg:inline">Проверка ДЗ</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
              >
                <Users size={16} />
                <span className="hidden lg:inline">Пользователи</span>
              </Link>
            </>
          )}
          {user.role === "ADMIN" && (
            <Link
              href="/admin/content"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
            >
              <FileEdit size={16} />
              <span className="hidden lg:inline">Материалы</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/updates"
            className="relative flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-accent"
            title="Что нового"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <InstallAppButton
            iconOnly
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-accent"
          />
          <div className="hidden items-center gap-2 lg:flex">
            <Avatar name={user.name} size={32} />
            <span className="text-sm font-medium">{user.name}</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-text-muted transition-colors hover:bg-card hover:text-danger"
              title="Выйти"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
