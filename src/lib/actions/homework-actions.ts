"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireStaff } from "@/lib/auth";
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

  let files: { name: string; url: string; size: number }[] = [];
  const filesJson = formData.get("filesJson");
  if (typeof filesJson === "string" && filesJson) {
    try {
      const parsed = JSON.parse(filesJson);
      if (Array.isArray(parsed)) {
        files = parsed
          .filter((f) => f && typeof f.name === "string" && typeof f.url === "string")
          .map((f) => ({ name: f.name, url: f.url, size: typeof f.size === "number" ? f.size : 0 }));
      }
    } catch {
      // ignore malformed input, submit without files
    }
  }

  if (!answerText && !answerUrl && files.length === 0) {
    return { error: "Опиши, что сделал, и/или приложи ссылку или файл" };
  }

  await prisma.homeworkSubmission.create({
    data: {
      homeworkId,
      studentId: user.id,
      answerText,
      answerUrl: answerUrl || null,
      status: "PENDING",
      files: {
        create: files.map((f) => ({ name: f.name, url: f.url, size: f.size })),
      },
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
  const staff = await requireStaff();

  const submission = await prisma.homeworkSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      feedback: feedback || null,
      reviewedById: staff.id,
      reviewedAt: new Date(),
    },
  });

  if (status === "APPROVED") {
    await evaluateAchievements(submission.studentId);
  }

  revalidatePath("/admin/homework");
  revalidatePath("/achievements");
}
