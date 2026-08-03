import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getCourseSummary } from "@/lib/progress";
import {
  CATEGORY_SECTION_LABELS,
  CATEGORY_DESCRIPTIONS,
  categoryBadge,
  groupByCategory,
} from "@/lib/categories";
import { ModuleIcon } from "@/lib/module-icons";
import { lessonsWord } from "@/lib/plural";

export default async function LearnPage() {
  const user = await requireUser();
  const summary = await getCourseSummary(user.id);
  const groups = groupByCategory(summary.modules);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <span className="kicker">Программа курса</span>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Vibe Coding: от нуля до про</h1>
        <p className="mt-1 text-text-muted">
          {summary.modules.length} блоков — введение, основные модули, инструментарий, бонусы и
          материалы.
        </p>
      </div>

      {groups.map((group) => (
        <section key={group.category} className="flex flex-col gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <span className="badge-accent">{CATEGORY_SECTION_LABELS[group.category]}</span>
            </h2>
            <p className="mt-1 text-sm text-text-muted">{CATEGORY_DESCRIPTIONS[group.category]}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.items.map((m, idx) => (
              <Link key={m.id} href={`/modules/${m.slug}`} className="card card-hover p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <ModuleIcon iconKey={m.icon} size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-text-dim">{categoryBadge(group.category, idx + 1)}</p>
                    <p className="truncate font-bold leading-snug">{m.title}</p>
                  </div>
                  {m.isComplete && <CheckCircle2 className="shrink-0 text-accent" size={20} />}
                </div>
                <p className="mb-3 text-sm text-text-muted line-clamp-2">{m.description}</p>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${m.percent}%` }} />
                </div>
                <p className="mt-2 text-xs text-text-dim">
                  {m.completedLessons} / {m.totalLessons} {lessonsWord(m.totalLessons)} ·{" "}
                  {m.percent}%
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
