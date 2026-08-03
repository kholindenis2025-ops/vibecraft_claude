"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { evaluateAchievements } from "@/lib/achievements";

export async function setLessonCompleted(
  lessonId: string,
  completed: boolean,
  revalidate: { modulePath: string; lessonPath: string }
) {
  const user = await requireUser();

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { userId: user.id, lessonId, completed, completedAt: completed ? new Date() : null },
  });

  const unlocked = completed ? await evaluateAchievements(user.id) : [];

  revalidatePath(revalidate.modulePath);
  revalidatePath(revalidate.lessonPath);
  revalidatePath("/dashboard");
  revalidatePath("/achievements");

  return { unlocked: unlocked.map((a) => ({ title: a.title, icon: a.icon })) };
}
