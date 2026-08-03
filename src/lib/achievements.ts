import "server-only";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS } from "@/lib/achievements-data";

export { ACHIEVEMENTS };

export async function evaluateAchievements(userId: string) {
  const [
    completedLessonsCount,
    totalLessonsCount,
    modules,
    quizAttempts,
    homeworkSubmissions,
    unlockedCodes,
  ] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId, completed: true } }),
    prisma.lesson.count(),
    prisma.module.findMany({
      select: { id: true, lessons: { select: { id: true } } },
    }),
    prisma.quizAttempt.findMany({ where: { userId } }),
    prisma.homeworkSubmission.findMany({ where: { studentId: userId } }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievement: { select: { code: true } } },
    }),
  ]);

  const already = new Set(unlockedCodes.map((u) => u.achievement.code));
  const toUnlock = new Set<string>();

  if (completedLessonsCount >= 1) toUnlock.add("first_lesson");
  if (totalLessonsCount > 0 && completedLessonsCount >= totalLessonsCount * 0.5) {
    toUnlock.add("halfway");
  }
  if (totalLessonsCount > 0 && completedLessonsCount >= totalLessonsCount) {
    toUnlock.add("course_complete");
  }

  const completedLessonIds = new Set(
    (
      await prisma.lessonProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true },
      })
    ).map((p) => p.lessonId)
  );

  let completedModulesCount = 0;
  for (const mod of modules) {
    if (mod.lessons.length === 0) continue;
    const allDone = mod.lessons.every((l) => completedLessonIds.has(l.id));
    if (allDone) completedModulesCount += 1;
  }
  if (completedModulesCount >= 1) toUnlock.add("first_module");
  if (completedModulesCount >= 5) toUnlock.add("marathon");

  if (quizAttempts.some((a) => a.score === 100)) toUnlock.add("quiz_ace");
  const passedQuizzes = new Set(quizAttempts.filter((a) => a.passed).map((a) => a.quizId));
  if (passedQuizzes.size >= 5) toUnlock.add("quiz_master");

  if (homeworkSubmissions.length >= 1) toUnlock.add("first_homework");
  if (homeworkSubmissions.some((s) => s.status === "APPROVED")) {
    toUnlock.add("homework_approved");
  }

  const newCodes = [...toUnlock].filter((code) => !already.has(code));
  if (newCodes.length === 0) return [];

  const achievementRows = await prisma.achievement.findMany({
    where: { code: { in: newCodes } },
  });

  await prisma.userAchievement.createMany({
    data: achievementRows.map((a) => ({ userId, achievementId: a.id })),
  });

  return achievementRows;
}
