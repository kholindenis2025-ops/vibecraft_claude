import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminModuleQuizForm } from "@/components/AdminModuleQuizForm";

export default async function AdminModuleQuizPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const { moduleId } = await params;

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { quiz: { include: { questions: { orderBy: { order: "asc" } } } } },
  });
  if (!mod) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/content" className="text-sm text-text-muted hover:text-accent">
          ← Материалы курса
        </Link>
        <p className="mt-2 text-sm text-text-dim">{mod.title}</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Тест модуля</h1>
        <p className="mt-1 text-text-muted">
          Показывается ученику последним шагом модуля — перед «Обратная связь по пройденному
          модулю».
        </p>
      </div>

      <AdminModuleQuizForm
        moduleId={mod.id}
        modulePath={`/modules/${mod.slug}`}
        initial={{
          quizTitle: mod.quiz?.title ?? "Проверь себя",
          quizPassScore: mod.quiz?.passScore ?? 70,
          hasQuiz: Boolean(mod.quiz),
          quizQuestions: (mod.quiz?.questions ?? []).map((q) => ({
            text: q.text,
            options: JSON.parse(q.options) as string[],
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          })),
        }}
      />
    </div>
  );
}
