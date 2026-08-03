"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, HelpCircle, Award, Lightbulb } from "lucide-react";
import { submitQuizAttempt, type QuizResult } from "@/lib/actions/quiz-actions";

type Question = { id: string; text: string; options: string[] };

type Props = {
  quizId: string;
  title: string;
  passScore: number;
  questions: Question[];
  modulePath: string;
  lessonPath: string;
};

export function QuizBlock({ quizId, title, passScore, questions, modulePath, lessonPath }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  function submit() {
    const ordered = questions.map((q) => answers[q.id] ?? -1);
    startTransition(async () => {
      const res = await submitQuizAttempt(quizId, ordered, { modulePath, lessonPath });
      setResult(res);
    });
  }

  function retry() {
    setResult(null);
    setAnswers({});
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <HelpCircle className="text-accent" size={20} />
        <h2 className="font-bold">{title}</h2>
      </div>

      <div className="flex flex-col gap-5">
        {questions.map((q, qi) => {
          const questionResult = result?.perQuestion[qi];
          return (
            <div key={q.id}>
              <p className="mb-2 text-sm font-medium">
                {qi + 1}. {q.text}
              </p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[q.id] === oi;
                  let stateClass = "border-border-strong";
                  if (result && questionResult) {
                    if (oi === questionResult.correctIndex) {
                      stateClass = "border-accent bg-accent-soft";
                    } else if (selected && !questionResult.wasCorrect) {
                      stateClass = "border-danger bg-danger/10";
                    }
                  } else if (selected) {
                    stateClass = "border-accent";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={Boolean(result)}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: oi }))}
                      className={`flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${stateClass}`}
                    >
                      <span>{opt}</span>
                      {result &&
                        questionResult &&
                        (oi === questionResult.correctIndex ? (
                          <CheckCircle2 className="shrink-0 text-accent" size={16} />
                        ) : selected ? (
                          <XCircle className="shrink-0 text-danger" size={16} />
                        ) : null)}
                    </button>
                  );
                })}
              </div>
              {result && questionResult && !questionResult.wasCorrect && questionResult.explanation && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-text-muted">
                  <Lightbulb size={14} className="mt-0.5 shrink-0 text-accent" />
                  {questionResult.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!result ? (
        <button
          onClick={submit}
          disabled={!allAnswered || isPending}
          className="btn-primary mt-5 w-full sm:w-auto"
        >
          {isPending ? "Проверяем…" : "Проверить ответы"}
        </button>
      ) : (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              result.passed
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-warning/40 bg-warning/10 text-warning"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {result.passed && <CheckCircle2 size={16} />}
              {result.passed ? "Тест сдан" : "Пока не сдано"}
            </span>{" "}
            · {result.score}% ({result.correctCount}/{result.totalCount}), нужно {passScore}%+
          </div>
          {!result.passed && (
            <button onClick={retry} className="btn-secondary">
              Попробовать снова
            </button>
          )}
          {result.unlocked.length > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-accent">
              <Award size={16} /> {result.unlocked.map((a) => a.title).join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
