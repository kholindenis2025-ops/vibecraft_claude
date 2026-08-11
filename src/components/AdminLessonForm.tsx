"use client";

import { useActionState, useRef, useState } from "react";
import { Trash2, Plus, PlayCircle, FileText, CheckCircle2 } from "lucide-react";
import {
  adminUpdateLessonAction,
  type ContentFormState,
} from "@/lib/actions/content-actions";
import { MediaListEditor, type MediaItem } from "@/components/MediaListEditor";
import { ContentImageUpload } from "@/components/ContentImageUpload";
import { QuizEditor, type QuizQuestionItem } from "@/components/QuizEditor";

type Resource = { title: string; url: string };
type Term = { term: string; definition: string };

type Initial = {
  title: string;
  summary: string;
  content: string;
  format: string;
  durationMin: number;
  availableFrom: string;
  videos: MediaItem[];
  slides: MediaItem[];
  resources: Resource[];
  terms: Term[];
  homeworkEnabled: boolean;
  homeworkTitle: string;
  homeworkDescription: string;
  quizEnabled: boolean;
  quizTitle: string;
  quizPassScore: number;
  quizQuestions: QuizQuestionItem[];
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

  const [videos, setVideos] = useState<MediaItem[]>(initial.videos);
  const [slides, setSlides] = useState<MediaItem[]>(initial.slides);
  const [resources, setResources] = useState<Resource[]>(initial.resources);
  const [terms, setTerms] = useState<Term[]>(initial.terms);
  const [homeworkEnabled, setHomeworkEnabled] = useState(initial.homeworkEnabled);
  const [quizEnabled, setQuizEnabled] = useState(initial.quizEnabled);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>(initial.quizQuestions);
  const [videosUploading, setVideosUploading] = useState(false);
  const [slidesUploading, setSlidesUploading] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const homeworkRef = useRef<HTMLTextAreaElement>(null);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="videosJson" value={JSON.stringify(videos)} />
      <input type="hidden" name="slidesJson" value={JSON.stringify(slides)} />
      <input type="hidden" name="resourcesJson" value={JSON.stringify(resources)} />
      <input type="hidden" name="termsJson" value={JSON.stringify(terms)} />
      <input type="hidden" name="quizQuestionsJson" value={JSON.stringify(quizQuestions)} />

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
              min={0}
              placeholder="0 — если видео нет"
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
            Текст урока (поддерживает markdown: ## заголовки, **жирный**, списки, изображения)
          </label>
          <textarea
            ref={contentRef}
            name="content"
            defaultValue={initial.content}
            rows={14}
            className="input resize-y font-mono text-sm"
          />
          <ContentImageUpload textareaRef={contentRef} />
        </div>
      </div>

      <div className="card flex flex-col gap-3 p-5 sm:p-6">
        <h2 className="font-bold">Видео</h2>
        <p className="text-sm text-text-dim">Можно загрузить несколько — например, по частям урока.</p>
        <MediaListEditor
          items={videos}
          onChange={setVideos}
          onBusyChange={setVideosUploading}
          accept="video/*"
          icon={PlayCircle}
          emptyLabel="Видео не загружено"
          uploadLabel="Загрузить видео"
        />
      </div>

      <div className="card flex flex-col gap-3 p-5 sm:p-6">
        <h2 className="font-bold">Презентации (PDF)</h2>
        <p className="text-sm text-text-dim">Можно загрузить несколько PDF-файлов.</p>
        <MediaListEditor
          items={slides}
          onChange={setSlides}
          onBusyChange={setSlidesUploading}
          accept="application/pdf"
          icon={FileText}
          emptyLabel="Презентация не загружена"
          uploadLabel="Загрузить PDF"
        />
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
              ref={homeworkRef}
              name="homeworkDescription"
              defaultValue={initial.homeworkDescription}
              placeholder="Что нужно сделать. Поддерживается разметка: **жирный**, *курсив*, ## заголовок"
              rows={5}
              className="input resize-y"
            />
            <ContentImageUpload textareaRef={homeworkRef} />
          </>
        )}
      </div>

      <div className="card flex flex-col gap-3 p-5 sm:p-6">
        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            name="quizEnabled"
            checked={quizEnabled}
            onChange={(e) => setQuizEnabled(e.target.checked)}
            className="h-4 w-4"
          />
          Тест
        </label>
        {quizEnabled && (
          <>
            <p className="text-sm text-text-dim">
              Обычно тест ставят на завершающий урок модуля («Обратная связь по пройденному модулю»),
              но можно и на любой другой.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-muted">Название теста</label>
                <input
                  name="quizTitle"
                  defaultValue={initial.quizTitle}
                  placeholder="Проверь себя"
                  className="input"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-muted">Проходной балл, %</label>
                <input
                  name="quizPassScore"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={initial.quizPassScore}
                  className="input"
                />
              </div>
            </div>
            <QuizEditor questions={quizQuestions} onChange={setQuizQuestions} />
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

      {(videosUploading || slidesUploading) && (
        <p className="text-sm text-text-dim">
          Дождись, пока файлы загрузятся, прежде чем сохранять.
        </p>
      )}

      <button
        type="submit"
        disabled={pending || videosUploading || slidesUploading}
        className="btn-primary self-start"
      >
        {pending ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  );
}
