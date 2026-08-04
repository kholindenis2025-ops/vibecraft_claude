import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HomeworkReviewForm } from "@/components/HomeworkReviewForm";
import { Avatar } from "@/components/Avatar";

const TABS = [
  { key: "PENDING", label: "На проверке" },
  { key: "APPROVED", label: "Принятые" },
  { key: "REJECTED", label: "Отклонённые" },
] as const;

export default async function AdminHomeworkPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "CURATOR") redirect("/dashboard");

  const { status } = await searchParams;
  const activeStatus = (status ?? "PENDING") as "PENDING" | "APPROVED" | "REJECTED";

  const submissions = await prisma.homeworkSubmission.findMany({
    where: { status: activeStatus },
    orderBy: { createdAt: "asc" },
    include: {
      student: { select: { name: true, email: true } },
      files: true,
      homework: {
        include: { lesson: { include: { module: { select: { title: true } } } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="kicker">Куратор</span>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Проверка домашних заданий</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/homework?status=${tab.key}`}
            className={activeStatus === tab.key ? "btn-primary" : "btn-secondary"}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {submissions.length === 0 && (
        <div className="card p-8 text-center text-text-muted">Здесь пока пусто.</div>
      )}

      <div className="flex flex-col gap-3">
        {submissions.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Avatar name={s.student.name} size={28} />
                <div>
                  <p className="text-sm font-semibold">{s.student.name}</p>
                  <p className="text-xs text-text-dim">{s.student.email}</p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-text-dim">
                <Clock size={13} /> {new Date(s.createdAt).toLocaleString("ru-RU")}
              </span>
            </div>

            <p className="mb-2 text-xs text-text-dim">
              {s.homework.lesson.module.title} · {s.homework.title}
            </p>

            {s.answerText && (
              <p className="mb-2 whitespace-pre-wrap rounded-lg bg-bg-soft p-3 text-sm">
                {s.answerText}
              </p>
            )}
            {s.answerUrl && (
              <a
                href={s.answerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 inline-block text-sm text-accent hover:underline"
              >
                {s.answerUrl}
              </a>
            )}

            {s.files.length > 0 && (
              <div className="mb-3 flex flex-col gap-1.5">
                {s.files.map((f) => (
                  <a
                    key={f.id}
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-accent hover:underline"
                  >
                    <FileText size={14} /> {f.name}
                  </a>
                ))}
              </div>
            )}

            {activeStatus === "PENDING" ? (
              <HomeworkReviewForm submissionId={s.id} />
            ) : (
              <div className="flex items-center gap-2 text-sm">
                {activeStatus === "APPROVED" ? (
                  <CheckCircle2 size={16} className="text-accent" />
                ) : (
                  <XCircle size={16} className="text-danger" />
                )}
                {s.feedback && <span className="text-text-muted">{s.feedback}</span>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
