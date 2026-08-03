import { FileText, Bot, Zap } from "lucide-react";
import {
  AGENT_SPECIALISTS,
  SUPERPOWERS_COMMANDS,
  FINAL_STEP_PROMPT,
} from "@/lib/tools/agent-skills-data";
import { CopyButton } from "@/components/CopyButton";

export function AgentSkillsTool() {
  return (
    <div className="flex flex-col gap-8">
      <div className="card p-5 sm:p-6">
        <h2 className="mb-1 font-bold">Стартовый набор: скиллы для твоего агента</h2>
        <p className="mb-4 text-sm text-text-muted">
          Готовые специалисты, которые подключаются к Claude Code одной фразой. Подключил — и
          агент уже не один, а с командой.
        </p>
        <div className="flex flex-wrap gap-2">
          {AGENT_SPECIALISTS.map((s) => (
            <span key={s.name} className="badge">
              {s.emoji} {s.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <FileText className="mb-2 text-accent" size={20} />
          <p className="mb-1 text-sm font-semibold">Должностная инструкция</p>
          <p className="text-xs text-text-muted">
            Скилл — текстовый файл SKILL.md в папке .claude/skills/ вашего проекта. Внутри —
            правила: когда включаться и как работать.
          </p>
        </div>
        <div className="card p-4">
          <Bot className="mb-2 text-accent" size={20} />
          <p className="mb-1 text-sm font-semibold">Агент сам выбирает</p>
          <p className="text-xs text-text-muted">
            Вы пишете задачу — агент сам понимает, какой скилл подходит, и вызывает его.
          </p>
        </div>
        <div className="card p-4">
          <Zap className="mb-2 text-accent" size={20} />
          <p className="mb-1 text-sm font-semibold">Установка одной фразой</p>
          <p className="text-xs text-text-muted">
            Никаких терминалов. Пишете фразу в окне Claude Code — он скачивает и кладёт скилл куда
            нужно.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {AGENT_SPECIALISTS.map((s) => (
          <div key={s.name} className="card p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className="font-bold">{s.name}</p>
                <p className="text-xs text-text-dim">{s.codeName}</p>
              </div>
              <span className="badge-accent ml-auto">{s.badge}</span>
            </div>
            <p className="mb-3 text-sm text-text-muted">{s.whatItDoes}</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {s.whenComes.map((w) => (
                <span key={w} className="badge">
                  {w}
                </span>
              ))}
            </div>
            {s.name === "Superpowers" && (
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {SUPERPOWERS_COMMANDS.map((c) => (
                  <div key={c.command} className="rounded-lg bg-bg-soft p-3">
                    <code className="text-sm font-semibold text-accent">{c.command}</code>
                    <p className="mt-1 text-xs font-medium text-text-muted">{c.when}</p>
                    <p className="mt-1 text-xs text-text-dim">{c.desc}</p>
                  </div>
                ))}
              </div>
            )}
            {s.prompt && (
              <div className="rounded-lg border border-border-strong bg-bg-soft p-4">
                <p className="mb-2 font-mono text-xs text-text-dim">установка — в окно Claude Code</p>
                <pre className="mb-3 whitespace-pre-wrap font-mono text-xs text-text-muted">
                  {s.prompt}
                </pre>
                <CopyButton text={s.prompt} />
              </div>
            )}
            {s.note && <p className="mt-3 text-xs text-text-dim">{s.note}</p>}
          </div>
        ))}
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="mb-2 font-bold">После установки всех скиллов</h2>
        <p className="mb-3 text-sm text-text-muted">
          Скажите агенту, что у него теперь есть команда — один раз, и агент запомнит своих
          специалистов навсегда.
        </p>
        <div className="rounded-lg border border-border-strong bg-bg-soft p-4">
          <p className="mb-2 font-mono text-xs text-text-dim">вставьте в окно Claude Code</p>
          <pre className="mb-3 whitespace-pre-wrap font-mono text-xs text-text-muted">
            {FINAL_STEP_PROMPT}
          </pre>
          <CopyButton text={FINAL_STEP_PROMPT} />
        </div>
        <p className="mt-3 text-xs text-text-dim">
          Проверьте: напечатайте в Claude Code — «Покажи какие скиллы и плагины у тебя сейчас
          установлены».
        </p>
      </div>
    </div>
  );
}
