"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type ContentFormState = { error?: string; success?: boolean } | null;

function parseJsonArray<T>(raw: FormDataEntryValue | null, guard: (v: unknown) => v is T): T[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
}

function isResource(v: unknown): v is { title: string; url: string } {
  const r = v as { title?: unknown; url?: unknown };
  return typeof r?.title === "string" && r.title.trim() !== "" && typeof r?.url === "string" && r.url.trim() !== "";
}

function isTerm(v: unknown): v is { term: string; definition: string } {
  const t = v as { term?: unknown; definition?: unknown };
  return typeof t?.term === "string" && t.term.trim() !== "" && typeof t?.definition === "string" && t.definition.trim() !== "";
}

function isMedia(v: unknown): v is { title?: string; url: string } {
  const m = v as { title?: unknown; url?: unknown };
  return typeof m?.url === "string" && m.url.trim() !== "";
}

export async function adminUpdateLessonAction(
  lessonId: string,
  lessonPath: string,
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const format = String(formData.get("format") ?? "").trim();
  const durationMinRaw = String(formData.get("durationMin") ?? "").trim();
  const availableFromRaw = String(formData.get("availableFrom") ?? "").trim();

  if (!title) {
    return { error: "Название урока не может быть пустым" };
  }

  const durationMin = durationMinRaw ? Number(durationMinRaw) : 10;
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    return { error: "Длительность должна быть положительным числом" };
  }

  const availableFrom = availableFromRaw ? new Date(availableFromRaw) : null;
  if (availableFromRaw && Number.isNaN(availableFrom?.getTime())) {
    return { error: "Некорректная дата доступности" };
  }

  const resources = parseJsonArray(formData.get("resourcesJson"), isResource);
  const terms = parseJsonArray(formData.get("termsJson"), isTerm);
  const videos = parseJsonArray(formData.get("videosJson"), isMedia);
  const slides = parseJsonArray(formData.get("slidesJson"), isMedia);

  const homeworkEnabled = formData.get("homeworkEnabled") === "on";
  const homeworkTitle = String(formData.get("homeworkTitle") ?? "").trim();
  const homeworkDescription = String(formData.get("homeworkDescription") ?? "").trim();

  if (homeworkEnabled && !homeworkTitle) {
    return { error: "У домашнего задания должно быть название" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        summary,
        content,
        format: format || null,
        durationMin,
        availableFrom,
      },
    });

    await tx.lessonVideo.deleteMany({ where: { lessonId } });
    if (videos.length > 0) {
      await tx.lessonVideo.createMany({
        data: videos.map((v, i) => ({ lessonId, order: i + 1, title: v.title || null, url: v.url })),
      });
    }

    await tx.lessonSlide.deleteMany({ where: { lessonId } });
    if (slides.length > 0) {
      await tx.lessonSlide.createMany({
        data: slides.map((s, i) => ({ lessonId, order: i + 1, title: s.title || null, url: s.url })),
      });
    }

    await tx.lessonResource.deleteMany({ where: { lessonId } });
    if (resources.length > 0) {
      await tx.lessonResource.createMany({
        data: resources.map((r, i) => ({ lessonId, order: i + 1, title: r.title, url: r.url })),
      });
    }

    await tx.lessonTerm.deleteMany({ where: { lessonId } });
    if (terms.length > 0) {
      await tx.lessonTerm.createMany({
        data: terms.map((t, i) => ({ lessonId, order: i + 1, term: t.term, definition: t.definition })),
      });
    }

    if (homeworkEnabled) {
      await tx.homework.upsert({
        where: { lessonId },
        update: { title: homeworkTitle, description: homeworkDescription },
        create: { lessonId, title: homeworkTitle, description: homeworkDescription },
      });
    } else {
      await tx.homework.deleteMany({ where: { lessonId } });
    }
  });

  revalidatePath(lessonPath);
  revalidatePath("/admin/content");
  return { success: true };
}
