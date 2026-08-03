"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, RotateCcw, CheckCircle2, Circle } from "lucide-react";
import { CHECKLIST_30, CHECKLIST_CATEGORIES } from "@/lib/tools/checklist-data";

const STORAGE_KEY = "vibecraft:checklist-30";

export function ChecklistTool() {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Все ошибки");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time hydration from localStorage after mount, to avoid SSR/client mismatch.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setChecked(new Set(JSON.parse(raw) as number[]));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
  }, [checked, hydrated]);

  function toggle(n: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  function reset() {
    setChecked(new Set());
  }

  const filtered = useMemo(() => {
    return CHECKLIST_30.filter((item) => {
      const matchesCategory = category === "Все ошибки" || item.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || item.title.toLowerCase().includes(q) || item.risk.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5 sm:p-6">
        <h2 className="mb-2 font-bold">Как пользоваться</h2>
        <p className="text-sm text-text-muted">
          AI-инструмент может быстро написать код, но качество результата зависит от процесса
          вокруг него. Большинство проблем появляется не из-за конкретной модели, а из-за неясной
          цели, отсутствия проверок, лишних разрешений и потери контекста.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Пройдите пункты по порядку: сначала настройте задачу, затем работу с кодом, потом
          проверку, безопасность и сопровождение. Важные решения оставляйте под человеческим
          контролем.
        </p>
      </div>

      <div className="card sticky top-16 z-10 flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по ошибкам"
              className="input pl-9"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-sm font-semibold text-accent">
              {checked.size}/30 отмечено
            </span>
            <button onClick={reset} className="btn-ghost !px-2 !py-1.5 text-xs">
              <RotateCcw size={13} /> Сбросить
            </button>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(checked.size / 30) * 100}%` }} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Все ошибки", ...CHECKLIST_CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={category === c ? "badge-accent" : "badge hover:text-text"}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((item) => {
          const isChecked = checked.has(item.n);
          return (
            <button
              key={item.n}
              onClick={() => toggle(item.n)}
              className={`card card-hover flex items-start gap-3 p-4 text-left transition-colors ${
                isChecked ? "border-accent/40 bg-accent-soft" : ""
              }`}
            >
              {isChecked ? (
                <CheckCircle2 className="mt-0.5 shrink-0 text-accent" size={20} />
              ) : (
                <Circle className="mt-0.5 shrink-0 text-text-dim" size={20} />
              )}
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span className="badge !px-1.5 !py-0 text-[10px]">{item.n.toString().padStart(2, "0")}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">
                    {item.category}
                  </span>
                </div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-text-muted">
                  <span className="font-medium text-text">Риск:</span> {item.risk}
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  <span className="font-medium text-text">Что сделать:</span> {item.action}
                </p>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="card p-8 text-center text-text-muted">Ничего не найдено.</div>
        )}
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="mb-3 font-bold">Перед тем как сказать «готово»</h2>
        <p className="mb-3 text-sm text-text-muted">
          Отметить ошибку — не значит идеально закрыть риск. Это сигнал, что у вас есть конкретная
          проверка или правило, которое защищает проект.
        </p>
        <ul className="flex flex-col gap-1.5 text-sm text-text-muted">
          <li>
            <span className="font-medium text-text">Покажите результат.</span> Попросите AI
            объяснить, что именно изменилось.
          </li>
          <li>
            <span className="font-medium text-text">Запустите проверки.</span> Тесты, сборку,
            линтер и ручной сценарий.
          </li>
          <li>
            <span className="font-medium text-text">Посмотрите diff.</span> Убедитесь, что нет
            лишних файлов и изменений.
          </li>
          <li>
            <span className="font-medium text-text">Проверьте секреты.</span> Перед публикацией
            исключите ключи и персональные данные.
          </li>
          <li>
            <span className="font-medium text-text">Оставьте след.</span> Запишите решение,
            ограничения и способ отката.
          </li>
        </ul>
        <p className="mt-3 text-sm text-text-muted">
          Простое правило: агент может ускорить выполнение, но ответственность за то, что попадёт
          к пользователю, остаётся у команды.
        </p>
      </div>
    </div>
  );
}
