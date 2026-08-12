import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLessonForm } from "@/components/AdminLessonForm";

export default async function AdminEditLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const { lessonId } = await params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { select: { slug: true, title: true } },
      terms: { orderBy: { order: "asc" } },
      resources: { orderBy: { order: "asc" } },
      videos: { orderBy: { order: "asc" } },
      slides: { orderBy: { order: "asc" } },
      materials: { orderBy: { order: "asc" } },
      homework: true,
    },
  });
  if (!lesson) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/content" className="text-sm text-text-muted hover:text-accent">
          ← Материалы курса
        </Link>
        <p className="mt-2 text-sm text-text-dim">{lesson.module.title}</p>
        <h1 className="text-2xl font-bold sm:text-3xl">{lesson.title}</h1>
      </div>

      <AdminLessonForm
        lessonId={lesson.id}
        lessonPath={`/modules/${lesson.module.slug}/${lesson.slug}`}
        initial={{
          title: lesson.title,
          summary: lesson.summary,
          content: lesson.content,
          format: lesson.format ?? "",
          durationMin: lesson.durationMin,
          availableFrom: lesson.availableFrom
            ? new Date(lesson.availableFrom.getTime() - lesson.availableFrom.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16)
            : "",
          videos: lesson.videos.map((v) => ({ title: v.title ?? "", url: v.url })),
          slides: lesson.slides.map((s) => ({ title: s.title ?? "", url: s.url })),
          materials: lesson.materials.map((m) => ({ title: m.title ?? "", url: m.url })),
          resources: lesson.resources.map((r) => ({ title: r.title, url: r.url })),
          terms: lesson.terms.map((t) => ({ term: t.term, definition: t.definition })),
          homeworkEnabled: Boolean(lesson.homework),
          homeworkTitle: lesson.homework?.title ?? "Задание",
          homeworkDescription: lesson.homework?.description ?? "",
        }}
      />
    </div>
  );
}
