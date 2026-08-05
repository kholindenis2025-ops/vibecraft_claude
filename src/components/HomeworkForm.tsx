"use client";

import { useActionState, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Paperclip,
  X,
  FileText,
  Loader2,
} from "lucide-react";
import { submitHomeworkAction, type HomeworkFormState } from "@/lib/actions/homework-actions";
import { LessonContent } from "@/components/LessonContent";

type SubmissionFile = { name: string; url: string; size: number };

type LastSubmission = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  answerText: string;
  answerUrl: string | null;
  feedback: string | null;
  files: { name: string; url: string }[];
} | null;

type Props = {
  homeworkId: string;
  title: string;
  description: string;
  modulePath: string;
  lessonPath: string;
  lastSubmission: LastSubmission;
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

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

  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canResubmit = !lastSubmission || lastSubmission.status === "REJECTED";

  async function handleFilesSelected(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      for (const file of Array.from(selected)) {
        if (file.size > MAX_FILE_SIZE) {
          setUploadError(`«${file.name}» больше 100 МБ — не загружен`);
          continue;
        }
        setUploadProgress(0);
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/homework-upload",
          onUploadProgress: (event) => setUploadProgress(event.percentage),
        });
        setFiles((prev) => [...prev, { name: file.name, url: blob.url, size: file.size }]);
      }
    } catch {
      setUploadError("Не удалось загрузить файл. Попробуй ещё раз.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeFile(url: string) {
    setFiles((prev) => prev.filter((f) => f.url !== url));
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-2 flex items-center gap-2">
        <ClipboardList className="text-accent" size={20} />
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="mb-4 text-sm">
        <LessonContent content={description} />
      </div>

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
          {lastSubmission.files.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {lastSubmission.files.map((f) => (
                <a
                  key={f.url}
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

          <input type="hidden" name="filesJson" value={JSON.stringify(files)} />

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-ghost self-start text-sm"
            >
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Загружаем… {Math.round(uploadProgress)}%
                </>
              ) : (
                <>
                  <Paperclip size={15} /> Добавить файлы
                </>
              )}
            </button>
            {uploading && (
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
            <p className="text-xs text-text-dim">Максимальный размер файла — 100 МБ</p>

            {files.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {files.map((f) => (
                  <div
                    key={f.url}
                    className="flex items-center gap-2 rounded-lg bg-bg-soft px-3 py-1.5 text-sm"
                  >
                    <FileText size={14} className="shrink-0 text-text-dim" />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    <span className="shrink-0 text-xs text-text-dim">{formatSize(f.size)}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(f.url)}
                      className="shrink-0 text-text-dim hover:text-danger"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploadError && <p className="text-xs text-danger">{uploadError}</p>}
          </div>

          {state?.error && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}
          <button
            type="submit"
            disabled={pending || uploading}
            className="btn-primary self-start"
          >
            {pending ? "Отправляем…" : "Отправить на проверку"}
          </button>
        </form>
      )}
    </div>
  );
}
