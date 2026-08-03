"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/auth";
import { evaluateAchievements } from "@/lib/achievements";

export type HomeworkFormState = { error?: string; success?: boolean } | null;

export async function submitHomeworkAction(
  homeworkId: string,
  revalidate: { modulePath: string; lessonPath: string },
  _prevState: HomeworkFormState,
  formData: FormData
): Promise<HomeworkFormState> {
  const user = await requireUser();

  const answerText = String(formData.get("answerText") ?? "").trim();
  const answerUrl = String(formData.get("answerUrl") ?? "").trim();

  if (!answerText && !answerUrl) {
    return { error: "Опиши, что сделал, и/или приложи ссылку на результат" };
  }

  await prisma.homeworkSubmission.create({
    data: {
      homeworkId,
      studentId: user.id,
      answerText,
      answerUrl: answerUrl || null,
      status: "PENDING",
    },
  });

  const unlocked = await evaluateAchievements(user.id);

  revalidatePath(revalidate.modulePath);
  revalidatePath(revalidate.lessonPath);
  revalidatePath("/achievements");
  revalidatePath("/admin/homework");
  void unlocked;

  return { success: true };
}

export async function reviewHomeworkAction(
  submissionId: string,
  status: "APPROVED" | "REJECTED",
  feedback: string
) {
  const admin = await requireAdmin();

  const submission = await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      feedback: feedback || null,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  if (status === "APPROVED") {
    await evaluateAchievements(submission.studentId);
  }

  revalidatePath("/admin/homework");
  revalidatePath("/achievements");
}
