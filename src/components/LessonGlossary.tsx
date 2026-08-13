"use client";

import { useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

type Term = { term: string; definition: string };

export function LessonGlossary({ terms }: { terms: Term[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (terms.length === 0) return null;

  return (
    <div className="card p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <BookOpen size={20} />
        </span>
        <div>
          <h2 className="font-bold">Словарь урока</h2>
          <p className="text-sm text-text-muted">Нажми на термин, чтобы раскрыть определение</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {terms.map((t, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={t.term}
              className={`rounded-xl border transition-colors ${
                isOpen ? "border-accent/40 bg-accent-soft" : "border-border"
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <BookOpen size={15} />
                </span>
                <span className="flex-1 font-semibold">{t.term}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-text-dim transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="pl-11 pr-4 pb-4 text-sm leading-relaxed text-text-muted">
                  <ReactMarkdown
                    remarkPlugins={[remarkBreaks]}
                    components={{
                      h2: (props) => <h2 className="mb-2 mt-4 font-bold text-text first:mt-0" {...props} />,
                      h3: (props) => <h3 className="mb-1.5 mt-3 font-bold text-text first:mt-0" {...props} />,
                      p: (props) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: (props) => <ul className="mb-2 ml-5 list-disc space-y-1" {...props} />,
                      ol: (props) => <ol className="mb-2 ml-5 list-decimal space-y-1" {...props} />,
                      li: (props) => <li {...props} />,
                      strong: (props) => <strong className="font-semibold text-text" {...props} />,
                      em: (props) => <em className="italic" {...props} />,
                      code: (props) => (
                        <code className="rounded bg-bg-soft px-1 py-0.5 font-mono text-xs" {...props} />
                      ),
                    }}
                  >
                    {t.definition}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
