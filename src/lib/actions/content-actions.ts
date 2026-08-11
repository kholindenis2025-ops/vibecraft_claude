"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slugify";

export type ContentFormState = { error?: string; success?: boolean } | null;

const MODULE_CATEGORIES = ["INTRO", "MODULE", "TOOL", "BONUS", "MATERIAL"] as const;

async function uniqueModuleSlug(base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (await prisma.module.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

async function uniqueLessonSlug(moduleId: string, base: string): Promise<string> {
  let slug = base;
  let n = 2;
  while (
    await prisma.lesson.findUnique({
      where: { moduleId_slug: { moduleId, slug } },
      select: { id: true },
    })
  ) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function adminCreateModuleAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const description = String(formData.get("description") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "MODULE");
  const category = MODULE_CATEGORIES.includes(categoryRaw as (typeof MODULE_CATEGORIES)[number])
    ? (categoryRaw as (typeof MODULE_CATEGORIES)[number])
    : "MODULE";
  const icon = String(formData.get("icon") ?? "compass").trim() || "compass";

  const slug = await uniqueModuleSlug(slugify(title));
  const maxOrder = await prisma.module.aggregate({ _max: { order: true } });
  const order = (maxOrder._max.order ?? 0) + 1;

  await prisma.module.create({
    data: { slug, order, category, title, description, icon },
  });

  revalidatePath("/admin/content");
  redirect("/admin/content");
}

export async function adminDeleteModuleAction(moduleId: string): Promise<void> {
  await requireAdmin();
  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath("/admin/content");
}

export async function adminCreateLessonAction(moduleId: string, formData: FormData): Promise<void> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const slug = await uniqueLessonSlug(moduleId, slugify(title));
  const maxOrder = await prisma.lesson.aggregate({
    where: { moduleId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;

  const lesson = await prisma.lesson.create({
    data: { moduleId, slug, order, title },
  });

  revalidatePath("/admin/content");
  redirect(`/admin/content/${lesson.id}`);
}

export async function adminDeleteLessonAction(lessonId: string): Promise<void> {
  await requireAdmin();
  await prisma.lesson.delete({ where: { id: lessonId } });
  revalidatePath("/admin/content");
}

export async function adminReorderLessonsAction(moduleId: string, lessonIds: string[]): Promise<void> {
  await requireAdmin();

  const existing = await prisma.lesson.findMany({
    where: { moduleId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((l) => l.id));
  if (lessonIds.length !== existing.length || !lessonIds.every((id) => existingIds.has(id))) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < lessonIds.length; i++) {
      await tx.lesson.update({ where: { id: lessonIds[i] }, data: { order: -(i + 1) } });
    }
    for (let i = 0; i < lessonIds.length; i++) {
      await tx.lesson.update({ where: { id: lessonIds[i] }, data: { order: i + 1 } });
    }
  });

  revalidatePath("/admin/content");
}

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

function isQuizQuestion(
  v: unknown
): v is { text: string; options: string[]; correctIndex: number; explanation?: string } {
  const q = v as { text?: unknown; options?: unknown; correctIndex?: unknown };
  return (
    typeof q?.text === "string" &&
    q.text.trim() !== "" &&
    Array.isArray(q.options) &&
    q.options.filter((o) => typeof o === "string" && o.trim() !== "").length >= 2 &&
    typeof q.correctIndex === "number"
  );
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

  const durationMin = durationMinRaw ? Number(durationMinRaw) : 0;
  if (!Number.isFinite(durationMin) || durationMin < 0) {
    return { error: "Длительность не может быть отрицательной" };
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

  const existing = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      videos: { select: { url: true } },
      slides: { select: { url: true } },
      module: { select: { title: true } },
    },
  });
  if (!existing) {
    return { error: "Урок не найден" };
  }
  const existingVideoUrls = new Set(existing.videos.map((v) => v.url));
  const existingSlideUrls = new Set(existing.slides.map((s) => s.url));
  const newVideoCount = videos.filter((v) => !existingVideoUrls.has(v.url)).length;
  const newSlideCount = slides.filter((s) => !existingSlideUrls.has(s.url)).length;

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
        contentUpdatedAt: new Date(),
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

  if (newVideoCount > 0 || newSlideCount > 0) {
    const parts: string[] = [];
    if (newVideoCount > 0) {
      parts.push(newVideoCount > 1 ? `новое видео (${newVideoCount})` : "новое видео");
    }
    if (newSlideCount > 0) {
      parts.push(newSlideCount > 1 ? `новая презентация (${newSlideCount})` : "новая презентация");
    }
    await prisma.notification.create({
      data: {
        title: `${existing.module.title} · ${title}`,
        message: `Добавлено: ${parts.join(" и ")}`,
        href: lessonPath,
      },
    });
  }

  revalidatePath(lessonPath);
  revalidatePath("/admin/content");
  revalidatePath("/updates");
  return { success: true };
}

export async function adminUpdateModuleQuizAction(
  moduleId: string,
  modulePath: string,
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  await requireAdmin();

  const title = String(formData.get("quizTitle") ?? "").trim() || "Проверь себя";
  const passScoreRaw = String(formData.get("quizPassScore") ?? "").trim();
  const passScore = passScoreRaw ? Number(passScoreRaw) : 70;
  const questions = parseJsonArray(formData.get("quizQuestionsJson"), isQuizQuestion);

  if (!Number.isFinite(passScore) || passScore < 0 || passScore > 100) {
    return { error: "Проходной балл должен быть от 0 до 100" };
  }
  if (questions.length === 0) {
    return { error: "Добавь хотя бы один вопрос" };
  }

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { title: true, quiz: { select: { id: true } } },
  });
  if (!mod) {
    return { error: "Модуль не найден" };
  }
  const isNewQuiz = !mod.quiz;

  await prisma.$transaction(async (tx) => {
    const quiz = await tx.quiz.upsert({
      where: { moduleId },
      update: { title, passScore },
      create: { moduleId, title, passScore },
    });
    await tx.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
    await tx.quizQuestion.createMany({
      data: questions.map((q, i) => ({
        quizId: quiz.id,
        order: i + 1,
        text: q.text,
        options: JSON.stringify(q.options),
        correctIndex: Math.min(Math.max(q.correctIndex, 0), q.options.length - 1),
        explanation: q.explanation ?? "",
      })),
    });
  });

  if (isNewQuiz) {
    await prisma.notification.create({
      data: {
        title: mod.title,
        message: "Добавлен новый тест по модулю",
        href: `${modulePath}/test`,
      },
    });
  }

  revalidatePath(modulePath);
  revalidatePath(`${modulePath}/test`);
  revalidatePath("/admin/content");
  revalidatePath("/updates");
  return { success: true };
}

export async function adminDeleteModuleQuizAction(moduleId: string): Promise<void> {
  await requireAdmin();
  await prisma.quiz.deleteMany({ where: { moduleId } });
  revalidatePath("/admin/content");
}
