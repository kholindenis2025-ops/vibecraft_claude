import Link from "next/link";
import {
  Rocket,
  PlayCircle,
  ClipboardCheck,
  Trophy,
  BarChart3,
  Sparkles,
  MonitorSmartphone,
  ArrowRight,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_SECTION_LABELS, categoryBadge, groupByCategory } from "@/lib/categories";
import { ModuleIcon } from "@/lib/module-icons";
import { Logo } from "@/components/Logo";
import { InstallAppButton } from "@/components/InstallAppButton";
import { lessonsWord } from "@/lib/plural";

export default async function HomePage() {
  const user = await getCurrentUser();
  const modules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    select: {
      slug: true,
      category: true,
      title: true,
      icon: true,
      description: true,
      lessons: { select: { id: true } },
    },
  });

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const coreModuleCount = modules.filter((m) => m.category === "MODULE").length;
  const groups = groupByCategory(modules);
  const ctaHref = user ? "/dashboard" : "/register";
  const ctaLabel = user ? "Перейти в дашборд" : "Начать бесплатно";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <div className="flex items-center gap-2 font-extrabold tracking-tight">
          <Logo size={36} />
          VIBE<span className="text-accent">CRAFT</span>
        </div>
        <div className="flex items-center gap-2">
          <InstallAppButton className="btn-ghost" />
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              В дашборд
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Войти
              </Link>
              <Link href="/register" className="btn-primary">
                Начать
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-24">
        <span className="kicker">Обучающая платформа нового поколения</span>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
          Vibe Coding<span className="text-accent">.</span>
          <br />
          От нуля до про.
        </h1>
        <p className="max-w-xl text-lg text-text-muted">
          Создавай реальные продукты с помощью ИИ — даже если раньше никогда не программировал.{" "}
          {coreModuleCount} модулей от идеи до дохода, плюс инструментарий, бонусы и материалы —{" "}
          {totalLessons} {lessonsWord(totalLessons)}, тесты, домашние задания с проверкой,
          прогресс и достижения.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href={ctaHref} className="btn-primary text-base">
            {ctaLabel} <ArrowRight size={18} />
          </Link>
          {!user && (
            <Link href="/login" className="btn-secondary text-base">
              У меня уже есть аккаунт
            </Link>
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:gap-4 sm:px-6">
        {[
          { icon: PlayCircle, label: "Видео + текст + презентации" },
          { icon: ClipboardCheck, label: "Тесты и домашние задания" },
          { icon: BarChart3, label: "Прогресс по каждому модулю" },
          { icon: Trophy, label: "Достижения за успехи" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="card flex flex-col items-start gap-3 p-4 sm:p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <Icon size={20} />
            </span>
            <p className="text-sm font-medium text-text-muted">{label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="kicker">Программа курса</span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              {coreModuleCount} модулей — от идеи до дохода
            </h2>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.category}>
              <span className="badge-accent mb-3 inline-flex">
                {CATEGORY_SECTION_LABELS[group.category]}
              </span>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((m, i) => (
                  <div key={m.slug} className="card card-hover p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                        <ModuleIcon iconKey={m.icon} size={20} />
                      </span>
                      <span className="badge">{categoryBadge(group.category, i + 1)}</span>
                      <span className="ml-auto text-xs text-text-dim">
                        {m.lessons.length} {lessonsWord(m.lessons.length)}
                      </span>
                    </div>
                    <h3 className="mb-1.5 font-bold leading-snug">{m.title}</h3>
                    <p className="text-sm text-text-muted">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="card flex flex-col items-center gap-4 p-8 text-center sm:p-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Rocket size={28} />
          </span>
          <h2 className="max-w-lg text-2xl font-bold sm:text-3xl">
            Готов создать свой первый продукт с ИИ?
          </h2>
          <p className="max-w-md text-text-muted">
            Регистрация занимает 30 секунд. Прогресс, достижения и домашки сохраняются под твоим
            аккаунтом.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={ctaHref} className="btn-primary text-base">
              {ctaLabel}
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-text-dim">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} /> Скиллы для Claude Code и Codex
            </span>
            <span className="flex items-center gap-1.5">
              <MonitorSmartphone size={14} /> Можно учиться с телефона
            </span>
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-border px-4 py-6 text-center text-xs text-text-dim sm:px-6">
        © {new Date().getFullYear()} VIBECRAFT — платформа обучения вайб-кодингу
      </footer>
    </div>
  );
}
