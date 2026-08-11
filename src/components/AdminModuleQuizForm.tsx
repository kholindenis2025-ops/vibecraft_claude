"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2 } from "lucide-react";
import {
  adminUpdateModuleQuizAction,
  adminDeleteModuleQuizAction,
  type ContentFormState,
} from "@/lib/actions/content-actions";
import { QuizEditor, type QuizQuestionItem } from "@/components/QuizEditor";

type Initial = {
  quizTitle: string;
  quizPassScore: number;
  quizQuestions: QuizQuestionItem[];
  hasQuiz: boolean;
};

export function AdminModuleQuizForm({
  moduleId,
  modulePath,
  initial,
}: {
  moduleId: string;
  modulePath: string;
  initial: Initial;
}) {
  const router = useRouter();
  const boundAction = adminUpdateModuleQuizAction.bind(null, moduleId, modulePath);
  const [state, formAction, pending] = useActionState<ContentFormState, FormData>(
    boundAction,
    null
  );
  const [questions, setQuestions] = useState<QuizQuestionItem[]>(
    initial.quizQuestions.length > 0
      ? initial.quizQuestions
      : [{ text: "", options: ["", ""], correctIndex: 0, explanation: "" }]
  );
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Удалить тест модуля целиком? Это действие необратимо.")) return;
    startDeleteTransition(async () => {
      await adminDeleteModuleQuizAction(moduleId);
      router.push("/admin/content");
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="quizQuestionsJson" value={JSON.stringify(questions)} />

      <div className="card flex flex-col gap-4 p-5 sm:p-6">
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
        <QuizEditor questions={questions} onChange={setQuestions} />
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

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
        {initial.hasQuiz && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn-ghost text-danger"
          >
            <Trash2 size={15} /> {isDeleting ? "Удаляем…" : "Удалить тест"}
          </button>
        )}
      </div>
    </form>
  );
}
