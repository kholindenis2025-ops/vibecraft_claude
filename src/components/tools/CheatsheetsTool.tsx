"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Lightbulb,
  Sparkles,
  ArrowLeftRight,
  AlertTriangle,
  NotebookPen,
} from "lucide-react";
import { CHEATSHEETS, type CheatsheetBlock } from "@/lib/tools/cheatsheets-data";
import { CopyButton } from "@/components/CopyButton";

const CALLOUT_META = {
  fact: { icon: Sparkles, label: "Факт", cls: "border-accent/30 bg-accent-soft" },
  analogy: { icon: ArrowLeftRight, label: "Аналогия", cls: "border-border-strong bg-bg-soft" },
  tip: { icon: Lightbulb, label: "Совет", cls: "border-accent/30 bg-accent-soft" },
  warning: { icon: AlertTriangle, label: "Важно", cls: "border-warning/30 bg-warning/10" },
} as const;

function Block({ block }: { block: CheatsheetBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-sm text-text-muted">{block.text}</p>;
    case "list":
      return (
        <ul className="flex flex-col gap-1.5 text-sm text-text-muted">
          {block.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-accent">·</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-soft">
                {block.headers.map((h) => (
                  <th key={h} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 align-top text-text-muted">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "callout": {
      const meta = CALLOUT_META[block.kind];
      const Icon = meta.icon;
      return (
        <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm text-text-muted ${meta.cls}`}>
          <Icon size={16} className="mt-0.5 shrink-0 text-accent" />
          <p>
            <strong className="text-text">{meta.label}.</strong> {block.text}
          </p>
        </div>
      );
    }
    case "prompt":
      return (
        <div className="rounded-lg border border-border-strong bg-bg-soft p-4">
          {block.label && <p className="mb-2 font-mono text-xs text-text-dim">{block.label}</p>}
          <pre className="mb-3 whitespace-pre-wrap font-mono text-xs text-text-muted">{block.text}</pre>
          <CopyButton text={block.text} />
        </div>
      );
  }
}

function CheatsheetDetail({ slug, onBack }: { slug: string; onBack: () => void }) {
  const sheet = CHEATSHEETS.find((c) => c.slug === slug);
  if (!sheet) return null;

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="flex w-fit items-center gap-1.5 text-sm text-text-muted hover:text-accent">
        <ArrowLeft size={15} /> Все шпаргалки
      </button>

      <div className="card p-5 sm:p-6">
        <span className="badge-accent">{sheet.moduleTag}</span>
        <h2 className="mt-2 mb-2 text-xl font-bold">{sheet.title}</h2>
        <p className="text-sm text-text-muted">{sheet.summary}</p>
      </div>

      {sheet.sections.map((section) => (
        <section key={section.heading} className="card flex flex-col gap-3 p-5 sm:p-6">
          <h3 className="font-bold">{section.heading}</h3>
          {section.blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </section>
      ))}

      <div className="card p-5 sm:p-6">
        <h3 className="mb-2 flex items-center gap-2 font-bold">
          <NotebookPen size={18} className="text-accent" /> Потренируйся
        </h3>
        <p className="mb-3 text-sm text-text-muted">{sheet.practice.text}</p>
        {sheet.practice.prompt && <CopyButton text={sheet.practice.prompt} />}
      </div>
    </div>
  );
}

export function CheatsheetsTool() {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) {
    return <CheatsheetDetail slug={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-5 sm:p-6">
        <h2 className="mb-2 font-bold">Как пользоваться</h2>
        <p className="text-sm text-text-muted">
          Шесть коротких шпаргалок — по одной на каждый модуль программы. Не заменяют уроки, а
          помогают быстро вспомнить шаги и достать готовый промпт прямо во время работы над своим
          продуктом.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {CHEATSHEETS.map((sheet) => (
          <button
            key={sheet.slug}
            onClick={() => setSelected(sheet.slug)}
            className="card card-hover flex flex-col gap-2 p-4 text-left"
          >
            <span className="badge-accent w-fit">{sheet.moduleTag}</span>
            <p className="font-semibold">{sheet.title}</p>
            <p className="text-sm text-text-muted">{sheet.summary}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {sheet.tags.map((tag) => (
                <span key={tag} className="badge !px-1.5 !py-0 text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
