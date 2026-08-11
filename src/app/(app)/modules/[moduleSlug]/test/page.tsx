import Link from "next/link";
import { notFound } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ModuleIcon } from "@/lib/module-icons";
import { QuizBlock } from "@/components/QuizBlock";

export default async function ModuleTestPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  await requireUser();

  const mod = await prisma.module.findUnique({
    where: { slug: moduleSlug },
    include: {
      quiz: { include: { questions: { orderBy: { order: "asc" } } } },
    },
  });
  if (!mod || !mod.quiz || mod.quiz.questions.length === 0) notFound();

  const modulePath = `/modules/${mod.slug}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={modulePath} className="text-sm text-text-muted hover:text-accent">
          ← {mod.title}
        </Link>
      </div>

      <div className="card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <ModuleIcon iconKey={mod.icon} size={28} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-xs text-text-dim">
              <HelpCircle size={13} /> Тест по модулю
            </p>
            <h1 className="text-xl font-bold sm:text-2xl">{mod.title}</h1>
          </div>
        </div>
      </div>

      <QuizBlock
        quizId={mod.quiz.id}
        title={mod.quiz.title}
        passScore={mod.quiz.passScore}
        questions={mod.quiz.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: JSON.parse(q.options) as string[],
        }))}
        modulePath={modulePath}
        lessonPath={`${modulePath}/test`}
      />

      <div className="flex items-center justify-between border-t border-border pt-6">
        <Link href={modulePath} className="btn-secondary">
          ← К модулю
        </Link>
      </div>
    </div>
  );
}
