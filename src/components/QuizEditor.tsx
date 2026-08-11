"use client";

import { Plus, Trash2, X } from "lucide-react";

export type QuizQuestionItem = {
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export function QuizEditor({
  questions,
  onChange,
}: {
  questions: QuizQuestionItem[];
  onChange: (questions: QuizQuestionItem[]) => void;
}) {
  function updateQuestion(qi: number, patch: Partial<QuizQuestionItem>) {
    onChange(questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  }

  function updateOption(qi: number, oi: number, value: string) {
    const q = questions[qi];
    updateQuestion(qi, { options: q.options.map((o, i) => (i === oi ? value : o)) });
  }

  function addOption(qi: number) {
    updateQuestion(qi, { options: [...questions[qi].options, ""] });
  }

  function removeOption(qi: number, oi: number) {
    const q = questions[qi];
    const options = q.options.filter((_, i) => i !== oi);
    const correctIndex = q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex;
    updateQuestion(qi, { options, correctIndex });
  }

  function addQuestion() {
    onChange([...questions, { text: "", options: ["", ""], correctIndex: 0, explanation: "" }]);
  }

  function removeQuestion(qi: number) {
    onChange(questions.filter((_, i) => i !== qi));
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, qi) => (
        <div key={qi} className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-semibold text-text-dim">Вопрос {qi + 1}</span>
            <input
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              placeholder="Текст вопроса"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => removeQuestion(qi)}
              className="btn-ghost !px-2 text-danger"
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correctIndex === oi}
                  onChange={() => updateQuestion(qi, { correctIndex: oi })}
                  title="Правильный вариант"
                  className="h-4 w-4 shrink-0 accent-accent"
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                  placeholder={`Вариант ${oi + 1}`}
                  className="input flex-1"
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(qi, oi)}
                    className="btn-ghost !px-2 text-text-dim"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addOption(qi)}
              className="btn-ghost self-start text-xs"
            >
              <Plus size={13} /> Добавить вариант
            </button>
          </div>

          <textarea
            value={q.explanation}
            onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
            placeholder="Объяснение (необязательно) — покажется, если ответили неверно"
            rows={2}
            className="input resize-none"
          />
        </div>
      ))}
      <button type="button" onClick={addQuestion} className="btn-ghost self-start text-sm">
        <Plus size={15} /> Добавить вопрос
      </button>
    </div>
  );
}
