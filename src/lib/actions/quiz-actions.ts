"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { evaluateAchievements } from "@/lib/achievements";

export type QuizResult = {
  score: number;
  passed: boolean;
  correctCount: number;
  totalCount: number;
  perQuestion: { correctIndex: number; explanation: string; wasCorrect: boolean }[];
  unlocked: { title: string; icon: string }[];
};

export async function submitQuizAttempt(
  quizId: string,
  answers: number[],
  revalidate: { modulePath: string; lessonPath: string }
): Promise<QuizResult> {
  const user = await requireUser();

  const quiz = await prisma.quiz.findUniqueOrThrow({
    where: { id: quizId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  const perQuestion = quiz.questions.map((q, i) => ({
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    wasCorrect: answers[i] === q.correctIndex,
  }));

  const correctCount = perQuestion.filter((q) => q.wasCorrect).length;
  const totalCount = quiz.questions.length;
  const score = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100);
  const passed = score >= quiz.passScore;

  await prisma.quizAttempt.create({
    data: {
      quizId,
      userId: user.id,
      score,
      passed,
      answers: JSON.stringify(answers),
    },
  });

  const unlocked = await evaluateAchievements(user.id);

  revalidatePath(revalidate.modulePath);
  revalidatePath(revalidate.lessonPath);
  revalidatePath("/achievements");

  return {
    score,
    passed,
    correctCount,
    totalCount,
    perQuestion,
    unlocked: unlocked.map((a) => ({ title: a.title, icon: a.icon })),
  };
}
