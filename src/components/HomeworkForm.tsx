"use client";

import { useActionState } from "react";
import { ClipboardList, Clock, CheckCircle2, XCircle } from "lucide-react";
import { submitHomeworkAction, type HomeworkFormState } from "@/lib/actions/homework-actions";

type LastSubmission = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  answerText: string;
  answerUrl: string | null;
  feedback: string | null;
} | null;

type Props = {
  homeworkId: string;
  title: string;
  description: string;
  modulePath: string;
  lessonPath: string;
  lastSubmission: LastSubmission;
};

export function HomeworkForm({
  homeworkId,
  title,
  description,
  modulePath,
  lessonPath,
  lastSubmission,
}: Props) {
  const boundAction = submitHomeworkAction.bind(null, homeworkId, { modulePath, lessonPath });
  const [state, formAction, pending] = useActionState<HomeworkFormState, FormData>(
    boundAction,
    null
  );

  const canResubmit = !lastSubmission || lastSubmission.status === "REJECTED";

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-2 flex items-center gap-2">
        <ClipboardList className="text-accent" size={20} />
        <h2 className="font-bold">{title}</h2>
      </div>
      <p className="mb-4 whitespace-pre-line text-sm text-text-muted">{description}</p>

      {lastSubmission && (
        <div className="mb-4 rounded-xl border border-border-strong bg-bg-soft p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            {lastSubmission.status === "PENDING" && (
              <>
                <Clock size={16} className="text-warning" /> На проверке
              </>
            )}
            {lastSubmission.status === "APPROVED" && (
              <>
                <CheckCircle2 size={16} className="text-accent" /> Принято
              </>
            )}
            {lastSubmission.status === "REJECTED" && (
              <>
                <XCircle size={16} className="text-danger" /> Нужно доработать
              </>
            )}
          </div>
          {lastSubmission.answerText && (
            <p className="whitespace-pre-wrap text-sm text-text-muted">{lastSubmission.answerText}</p>
          )}
          {lastSubmission.answerUrl && (
            <a
              href={lastSubmission.answerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-accent hover:underline"
            >
              {lastSubmission.answerUrl}
            </a>
          )}
          {lastSubmission.feedback && (
            <p className="mt-2 rounded-lg bg-card px-3 py-2 text-sm">
              <span className="font-semibold">Комментарий куратора: </span>
              {lastSubmission.feedback}
            </p>
          )}
        </div>
      )}

      {canResubmit && (
        <form action={formAction} className="flex flex-col gap-3">
          <textarea
            name="answerText"
            rows={4}
            className="input resize-none"
            placeholder="Опиши, что сделал(а)…"
          />
          <input
            name="answerUrl"
            type="url"
            className="input"
            placeholder="Ссылка на результат (Google Диск, продукт и т.д.)"
          />
          {state?.error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <button type="submit" disabled={pending} className="btn-primary self-start">
            {pending ? "Отправляем…" : "Отправить на проверку"}
          </button>
        </form>
      )}
    </div>
  );
}
