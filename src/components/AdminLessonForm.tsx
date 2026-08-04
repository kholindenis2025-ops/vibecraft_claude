"use client";

import { useActionState, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import {
  Loader2,
  Upload,
  Trash2,
  Plus,
  PlayCircle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import {
  adminUpdateLessonAction,
  type ContentFormState,
} from "@/lib/actions/content-actions";

type Resource = { title: string; url: string };
type Term = { term: string; definition: string };

type Initial = {
  title: string;
  summary: string;
  content: string;
  format: string;
  durationMin: number;
  availableFrom: string;
  videoUrl: string;
  slidesUrl: string;
  resources: Resource[];
  terms: Term[];
  homeworkEnabled: boolean;
  homeworkTitle: string;
  homeworkDescription: string;
};

export function AdminLessonForm({
  lessonId,
  lessonPath,
  initial,
}: {
  lessonId: string;
  lessonPath: string;
  initial: Initial;
}) {
  const boundAction = adminUpdateLessonAction.bind(null, lessonId, lessonPath);
  const [state, formAction, pending] = useActionState<ContentFormState, FormData>(
    boundAction,
    null
  );

  const [videoUrl, setVideoUrl] = useState(initial.videoUrl);
  const [videoUploading, setVideoUploading] = useState(false);
  const [slidesUrl, setSlidesUrl] = useState(initial.slidesUrl);
  const [slidesUploading, setSlidesUploading] = useState(false);
  const [resources, setResources] = useState<Resource[]>(initial.resources);
  const [terms, setTerms] = useState<Term[]>(initial.terms);
  const [homeworkEnabled, setHomeworkEnabled] = useState(initial.homeworkEnabled);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const slidesInputRef = useRef<HTMLInputElement>(null);

  async function handleVideoUpload(file: File | undefined) {
    if (!file) return;
    setVideoUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/lesson-upload",
      });
      setVideoUrl(blob.url);
    } catch {
      alert("Не удалось загрузить видео");
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  }

  async function handleSlidesUpload(file: File | undefined) {
    if (!file) return;
    setSlidesUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/lesson-upload",
      });
      setSlidesUrl(blob.url);
    } catch {
      alert("Не удалось загрузить PDF");
    } finally {
      setSlidesUploading(false);
      if (slidesInputRef.current) slidesInputRef.current.value = "";
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="videoUrl" value={videoUrl} />
      <input type="hidden" name="slidesUrl" value={slidesUrl} />
      <input type="hidden" name="resourcesJson" value={JSON.stringify(resources)} />
      <input type="hidden" name="termsJson" value={JSON.stringify(terms)} />

      <div className="card flex flex-col gap-4 p-5 sm:p-6">
        <h2 className="font-bold">Основное</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-muted">Название урока</label>
          <input name="title" defaultValue={initial.title} required className="input" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-muted">Краткое описание</label>
          <input name="summary" defaultValue={initial.summary} className="input" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Формат</label>
            <input
              name="format"
              defaultValue={initial.format}
              placeholder="Урок в записи"
              className="input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Длительность, мин</label>
            <input
              name="durationMin"
              type="number"
              min={1}
              defaultValue={initial.durationMin}
              className="input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-muted">Доступен с</label>
            <input
              name="availableFrom"
              type="datetime-local"
              defaultValue={initial.availableFrom}
              className="input"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-muted">
            Текст урока (поддерживает markdown: ## заголовки, **жирный**, списки)
          </label>
          <textarea
            name="content"
            defaultValue={initial.content}
            rows={14}
            className="input resize-y font-mono text-sm"
          />
        </div>
      </div>

      <div className="card flex flex-col gap-3 p-5 sm:p-6">
        <h2 className="font-bold">Видео</h2>
        {videoUrl ? (
          <div className="flex items-center gap-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
            <PlayCircle size={16} className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1 truncate">{videoUrl}</span>
            <button
              type="button"
              onClick={() => setVideoUrl("")}
              className="shrink-0 text-text-dim hover:text-danger"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          <p className="text-sm text-text-dim">Видео не загружено</p>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleVideoUpload(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          disabled={videoUploading}
          className="btn-secondary self-start text-sm"
        >
          {videoUploading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Загружаем…
            </>
          ) : (
            <>
              <Upload size={15} /> {videoUrl ? "Заменить видео" : "Загрузить видео"}
            </>
          )}
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-5 sm:p-6">
        <h2 className="font-bold">Презентация (PDF)</h2>
        {slidesUrl ? (
          <div className="flex items-center gap-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
            <FileText size={16} className="shrink-0 text-accent" />
            <span className="min-w-0 flex-1 truncate">{slidesUrl}</span>
            <button
              type="button"
              onClick={() => setSlidesUrl("")}
              className="shrink-0 text-text-dim hover:text-danger"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          <p className="text-sm text-text-dim">Презентация не загружена</p>
        )}
        <input
          ref={slidesInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleSlidesUpload(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => slidesInputRef.current?.click()}
          disabled={slidesUploading}
          className="btn-secondary self-start text-sm"
        >
          {slidesUploading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Загружаем…
            </>
          ) : (
            <>
              <Upload size={15} /> {slidesUrl ? "Заменить PDF" : "Загрузить PDF"}
            </>
          )}
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-5 sm:p-6">
        <h2 className="font-bold">Ссылки на ресурсы</h2>
        <p className="text-sm text-text-dim">
          Дополнительные ссылки — на материалы, статьи, шаблоны. Необязательно.
        </p>
        {resources.map((r, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={r.title}
              onChange={(e) =>
                setResources((prev) =>
                  prev.map((item, idx) => (idx === i ? { ...item, title: e.target.value } : item))
                )
              }
              placeholder="Название ссылки"
              className="input sm:w-56"
            />
            <input
              value={r.url}
              onChange={(e) =>
                setResources((prev) =>
                  prev.map((item, idx) => (idx === i ? { ...item, url: e.target.value } : item))
                )
              }
              placeholder="https://…"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => setResources((prev) => prev.filter((_, idx) => idx !== i))}
              className="btn-ghost !px-2 text-danger"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setResources((prev) => [...prev, { title: "", url: "" }])}
          className="btn-ghost self-start text-sm"
        >
          <Plus size={15} /> Добавить ссылку
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-5 sm:p-6">
        <h2 className="font-bold">Словарь терминов</h2>
        <p className="text-sm text-text-dim">Термины, которые раскрываются по клику. Необязательно.</p>
        {terms.map((t, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <input
                value={t.term}
                onChange={(e) =>
                  setTerms((prev) =>
                    prev.map((item, idx) => (idx === i ? { ...item, term: e.target.value } : item))
                  )
                }
                placeholder="Термин"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => setTerms((prev) => prev.filter((_, idx) => idx !== i))}
                className="btn-ghost !px-2 text-danger"
              >
                <Trash2 size={15} />
              </button>
            </div>
            <textarea
              value={t.definition}
              onChange={(e) =>
                setTerms((prev) =>
                  prev.map((item, idx) => (idx === i ? { ...item, definition: e.target.value } : item))
                )
              }
              placeholder="Определение"
              rows={2}
              className="input resize-none"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setTerms((prev) => [...prev, { term: "", definition: "" }])}
          className="btn-ghost self-start text-sm"
        >
          <Plus size={15} /> Добавить термин
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-5 sm:p-6">
        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            name="homeworkEnabled"
            checked={homeworkEnabled}
            onChange={(e) => setHomeworkEnabled(e.target.checked)}
            className="h-4 w-4"
          />
          Домашнее задание
        </label>
        {homeworkEnabled && (
          <>
            <input
              name="homeworkTitle"
              defaultValue={initial.homeworkTitle}
              placeholder="Название задания"
              className="input"
            />
            <textarea
              name="homeworkDescription"
              defaultValue={initial.homeworkDescription}
              placeholder="Что нужно сделать"
              rows={5}
              className="input resize-y"
            />
          </>
        )}
      </div>

      {state?.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="flex items-center gap-1.5 text-sm text-accent">
          <CheckCircle2 size={15} /> Сохранено
        </p>
      )}

      <button
        type="submit"
        disabled={pending || videoUploading || slidesUploading}
        className="btn-primary self-start"
      >
        {pending ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  );
}
