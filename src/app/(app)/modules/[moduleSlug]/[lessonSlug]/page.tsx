import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, CalendarClock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LessonContent } from "@/components/LessonContent";
import { VideoEmbed, SlidesEmbed, ResourceLinks } from "@/components/MediaEmbed";
import { isProxiedSlideUrl } from "@/lib/media";
import { LessonCompleteButton } from "@/components/LessonCompleteButton";
import { QuizBlock } from "@/components/QuizBlock";
import { HomeworkForm } from "@/components/HomeworkForm";
import { LessonGlossary } from "@/components/LessonGlossary";

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
      terms: { orderBy: { order: "asc" } },
      resources: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
      slides: { orderBy: { order: "asc" } },
      homework: {
        include: {
          submissions: {
            where: { studentId: user.id },
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { files: true },
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

  // Always proxy through our own domain — never hand the browser a
  // third-party URL directly, since hosting domains like Yandex Disk or
  // blob.vercel-storage.com aren't reliably reachable in Russia without a VPN.
  function videoDirectSrc(video: { id: string }): string {
    return `/api/video/${video.id}`;
  }

  function slideDirectSrc(slide: { id: string; url: string }): string | null {
    return isProxiedSlideUrl(slide.url) ? `/api/slides/${slide.id}` : null;
  }

  const lastSubmission = lesson.homework?.submissions[0]
    ? {
        status: lesson.homework.submissions[0].status,
        answerText: lesson.homework.submissions[0].answerText,
        answerUrl: lesson.homework.submissions[0].answerUrl,
        feedback: lesson.homework.submissions[0].feedback,
        files: lesson.homework.submissions[0].files.map((f) => ({ name: f.name, url: f.url })),
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

      {lesson.videos.length > 0 ? (
        lesson.videos.map((video, i) => (
          <div key={video.id}>
            {(video.title || lesson.videos.length > 1) && (
              <h2 className="mb-2 font-bold">{video.title || `Видео ${i + 1}`}</h2>
            )}
            <VideoEmbed url={video.url} directSrc={videoDirectSrc(video)} />
          </div>
        ))
      ) : (
        <VideoEmbed url={null} />
      )}

      <div className="card p-5 sm:p-6">
        <LessonContent content={lesson.content} />
      </div>

      {lesson.terms.length > 0 && <LessonGlossary terms={lesson.terms} />}

      {lesson.slides.map((slide, i) => (
        <div key={slide.id}>
          <h2 className="mb-3 font-bold">
            {slide.title || (lesson.slides.length > 1 ? `Презентация ${i + 1}` : "Презентация")}
          </h2>
          <SlidesEmbed url={slide.url} directSrc={slideDirectSrc(slide)} />
        </div>
      ))}

      {lesson.resources.length > 0 && <ResourceLinks resources={lesson.resources} />}

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
