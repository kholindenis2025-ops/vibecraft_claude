import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, CalendarClock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LessonContent } from "@/components/LessonContent";
import { VideoEmbed, SlidesEmbed, DriveLink } from "@/components/MediaEmbed";
import { isYandexDiskUrl, resolveYandexDiskDirectUrl } from "@/lib/yandex-disk";
import { LessonCompleteButton } from "@/components/LessonCompleteButton";
import { QuizBlock } from "@/components/QuizBlock";
import { HomeworkForm } from "@/components/HomeworkForm";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}) {
  const { moduleSlug, lessonSlug } = await params;
  const user = await requireUser();

  const mod = await prisma.module.findUnique({
    where: { slug: moduleSlug },
    include: { lessons: { orderBy: { order: "asc" }, select: { id: true, slug: true, title: true } } },
  });
  if (!mod) notFound();

  const lesson = await prisma.lesson.findUnique({
    where: { moduleId_slug: { moduleId: mod.id, slug: lessonSlug } },
    include: {
      progress: { where: { userId: user.id } },
      quiz: { include: { questions: { orderBy: { order: "asc" } } } },
      homework: {
        include: {
          submissions: {
            where: { studentId: user.id },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });
  if (!lesson) notFound();

  const modulePath = `/modules/${mod.slug}`;
  const lessonPath = `/modules/${mod.slug}/${lesson.slug}`;
  const isCompleted = Boolean(lesson.progress[0]?.completed);

  const index = mod.lessons.findIndex((l) => l.id === lesson.id);
  const prevLesson = index > 0 ? mod.lessons[index - 1] : null;
  const nextLesson = index < mod.lessons.length - 1 ? mod.lessons[index + 1] : null;

  const videoDirectSrc =
    lesson.videoUrl && isYandexDiskUrl(lesson.videoUrl)
      ? await resolveYandexDiskDirectUrl(lesson.videoUrl)
      : null;

  const lastSubmission = lesson.homework?.submissions[0]
    ? {
        status: lesson.homework.submissions[0].status,
        answerText: lesson.homework.submissions[0].answerText,
        answerUrl: lesson.homework.submissions[0].answerUrl,
        feedback: lesson.homework.submissions[0].feedback,
      }
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={modulePath} className="text-sm text-text-muted hover:text-accent">
          ← {mod.title}
        </Link>
        <span className="flex items-center gap-1.5 text-xs text-text-dim">
          <Clock size={13} /> {lesson.durationMin} мин
        </span>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="kicker">
            Урок {index + 1} из {mod.lessons.length}
          </span>
          {lesson.format && <span className="badge">{lesson.format}</span>}
        </div>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
        {lesson.summary && <p className="mt-2 text-text-muted">{lesson.summary}</p>}
        {lesson.availableFrom && lesson.availableFrom > new Date() && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-text-dim">
            <CalendarClock size={13} />
            Доступно с{" "}
            {lesson.availableFrom.toLocaleDateString("ru-RU", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <VideoEmbed url={lesson.videoUrl} directSrc={videoDirectSrc} />

      <div className="card p-5 sm:p-6">
        <LessonContent content={lesson.content} />
      </div>

      {lesson.slidesUrl && (
        <div>
          <h2 className="mb-3 font-bold">Презентация</h2>
          <SlidesEmbed url={lesson.slidesUrl} />
        </div>
      )}

      {lesson.driveUrl && (
        <div>
          <DriveLink url={lesson.driveUrl} />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <LessonCompleteButton
          lessonId={lesson.id}
          initialCompleted={isCompleted}
          modulePath={modulePath}
          lessonPath={lessonPath}
        />
      </div>

      {lesson.quiz && lesson.quiz.questions.length > 0 && (
        <QuizBlock
          quizId={lesson.quiz.id}
          title={lesson.quiz.title}
          passScore={lesson.quiz.passScore}
          questions={lesson.quiz.questions.map((q) => ({
            id: q.id,
            text: q.text,
            options: JSON.parse(q.options) as string[],
          }))}
          modulePath={modulePath}
          lessonPath={lessonPath}
        />
      )}

      {lesson.homework && (
        <HomeworkForm
          homeworkId={lesson.homework.id}
          title={lesson.homework.title}
          description={lesson.homework.description}
          modulePath={modulePath}
          lessonPath={lessonPath}
          lastSubmission={lastSubmission}
        />
      )}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-6">
        {prevLesson ? (
          <Link href={`/modules/${mod.slug}/${prevLesson.slug}`} className="btn-secondary">
            <ChevronLeft size={16} /> Предыдущий
          </Link>
        ) : (
          <span />
        )}
        {nextLesson ? (
          <Link href={`/modules/${mod.slug}/${nextLesson.slug}`} className="btn-secondary">
            Следующий <ChevronRight size={16} />
          </Link>
        ) : (
          <Link href="/dashboard" className="btn-primary">
            К дашборду
          </Link>
        )}
      </div>
    </div>
  );
}
