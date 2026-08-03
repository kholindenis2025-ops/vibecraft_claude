import Link from "next/link";
import { LayoutDashboard, BookOpen, Trophy, ClipboardCheck, Users, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth-actions";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";

type Props = {
  user: {
    name: string;
    email: string;
    role: "STUDENT" | "ADMIN";
  };
};

export function SiteHeader({ user }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold tracking-tight">
          <Logo size={32} />
          <span className="hidden sm:inline">
            VIBE<span className="text-accent">CRAFT</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Дашборд</span>
          </Link>
          <Link
            href="/learn"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
          >
            <BookOpen size={16} />
            <span className="hidden sm:inline">Программа</span>
          </Link>
          <Link
            href="/achievements"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
          >
            <Trophy size={16} />
            <span className="hidden sm:inline">Достижения</span>
          </Link>
          {user.role === "ADMIN" && (
            <>
              <Link
                href="/admin/homework"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
              >
                <ClipboardCheck size={16} />
                <span className="hidden sm:inline">Проверка ДЗ</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-text-muted transition-colors hover:bg-card hover:text-text"
              >
                <Users size={16} />
                <span className="hidden sm:inline">Пользователи</span>
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
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
