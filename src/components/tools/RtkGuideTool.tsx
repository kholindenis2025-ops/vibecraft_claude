"use client";

import { useState } from "react";
import { ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

const CLAUDE_PROMPT = `Установи мне утилиту rtk (github.com/rtk-ai/rtk) — она сжимает вывод команд и экономит токены.
1) Сначала попробуй безопасный способ через Homebrew:
brew install rtk
Если Homebrew нет или это не Mac — тогда установи так:
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
2) Настрой хук для Claude Code командой:
rtk init -g
3) Проверь установку: rtk --version
Потом скажи, что всё готово и что нужно перезапустить Claude Code.`;

const CODEX_PROMPT = `Установи мне утилиту rtk (github.com/rtk-ai/rtk) — она сжимает вывод команд и экономит токены.
1) Сначала попробуй безопасный способ через Homebrew:
brew install rtk
Если Homebrew нет или это не Mac — тогда установи так:
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
2) Настрой хук для Codex командой:
rtk init -g --codex
3) Проверь установку: rtk --version
Потом скажи, что всё готово и что нужно перезапустить Codex.`;

const CHECK_PROMPT = "Выполни команду rtk gain --graph и покажи, сколько токенов я сэкономил.";

export function RtkGuideTool() {
  const [agent, setAgent] = useState<"claude" | "codex">("claude");

  return (
    <div className="flex flex-col gap-8">
      <div className="card p-5 text-center sm:p-8">
        <span className="kicker">Реалити · Claude Code против Codex</span>
        <h2 className="mt-2 text-2xl font-bold">Claude и Codex на 80% дешевле</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-text-muted">
          Пока идёт битва, нашлась утилита, которая экономит токены обоим. Ставится за 3 минуты — и
          ни одной команды руками.
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div>
            <p className="text-2xl font-bold text-accent">−80%</p>
            <p className="text-xs text-text-dim">токенов на рутинных командах</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">3 мин</p>
            <p className="text-xs text-text-dim">на установку без терминала</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">15+</p>
            <p className="text-xs text-text-dim">агентов: Claude, Codex, Cursor…</p>
          </div>
        </div>
      </div>

      <section className="card p-5 sm:p-6">
        <span className="badge-accent">01</span>
        <h3 className="mt-2 mb-2 font-bold">Что это</h3>
        <p className="text-sm text-text-muted">
          <strong className="text-text">rtk (Rust Token Killer)</strong> — маленькая прокладка между
          ИИ-агентом и терминалом.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          Когда агент дёргает команды — смотрит git, гоняет тесты, читает файлы — их вывод летит в
          модель целиком. Огромные простыни текста, за которые ты платишь токенами. rtk перехватывает
          этот вывод и сжимает его до сути перед тем, как он попадёт в модель. Тесты — только
          упавшие. Логи — 500 одинаковых строк схлопывает в одну.
        </p>
        <p className="mt-2 rounded-lg bg-bg-soft p-3 text-xs text-text-muted">
          За 30 минут работы агент прогоняет через себя ~118 000 токенов на одних командах терминала
          — это примерно полтома «Войны и мира» на выводах git и тестов, которые даже не нужны
          целиком. rtk убирает этот мусор.
        </p>
      </section>

      <section className="card p-5 sm:p-6">
        <span className="badge-accent">02</span>
        <h3 className="mt-2 mb-3 font-bold">Как поставить</h3>
        <p className="mb-4 text-sm text-text-muted">
          Ты не трогаешь терминал. Копируешь промпт, вставляешь агенту — он всё делает сам.
        </p>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setAgent("claude")}
            className={agent === "claude" ? "btn-primary" : "btn-secondary"}
          >
            Claude Code
          </button>
          <button
            onClick={() => setAgent("codex")}
            className={agent === "codex" ? "btn-primary" : "btn-secondary"}
          >
            Codex
          </button>
        </div>

        <div className="rounded-lg border border-border-strong bg-bg-soft p-4">
          <p className="mb-2 font-mono text-xs text-text-dim">
            prompt · {agent === "claude" ? "claude code" : "codex"}
          </p>
          <pre className="mb-3 whitespace-pre-wrap font-mono text-xs text-text-muted">
            {agent === "claude" ? CLAUDE_PROMPT : CODEX_PROMPT}
          </pre>
          <CopyButton text={agent === "claude" ? CLAUDE_PROMPT : CODEX_PROMPT} />
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-text-muted">
          <p>
            <strong className="text-text">Шаг 3.</strong> Когда агент напишет «готово» — полностью
            закрой и снова открой Claude Code / Codex. Без этого экономия не включится.
          </p>
          <p>
            <strong className="text-text">Шаг 4.</strong> Поработай минут 10 как обычно, затем
            вставь агенту команду ниже — увидишь график сэкономленных токенов.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-border-strong bg-bg-soft p-4">
          <p className="mb-2 font-mono text-xs text-text-dim">prompt · проверка</p>
          <pre className="mb-3 whitespace-pre-wrap font-mono text-xs text-text-muted">{CHECK_PROMPT}</pre>
          <CopyButton text={CHECK_PROMPT} />
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="text-accent" size={18} />
          <span className="badge-accent">03</span>
        </div>
        <h3 className="mb-3 font-bold">Безопасно ли это ставить?</h3>
        <p className="mb-3 text-sm text-text-muted">Коротко: да, но с головой.</p>
        <ul className="flex flex-col gap-2 text-sm text-text-muted">
          <li>
            <strong className="text-text">Ставь через Homebrew, если можешь.</strong> Команда{" "}
            <code className="rounded bg-bg-soft px-1 py-0.5 font-mono text-xs">brew install rtk</code>{" "}
            безопаснее, чем «скачай скрипт и сразу запусти».
          </li>
          <li>
            <strong className="text-text">rtk — посредник.</strong> Код открытый, слежка выключена
            по умолчанию — ничего никуда не отправляется, пока сам не включишь.
          </li>
          <li>
            <strong className="text-text">Обкатай на «кошках».</strong> Не ставь сразу туда, где
            лежат боевые пароли и доступы.
          </li>
          <li>
            <strong className="text-text">Всё обратимо.</strong> Не понравилось — удаляешь rtk, и
            настройки агента снова чистые.
          </li>
        </ul>
      </section>

      <section className="card p-5 sm:p-6">
        <span className="badge-accent">04</span>
        <h3 className="mt-2 mb-3 font-bold">Честно, без иллюзий</h3>
        <ul className="flex flex-col gap-2 text-sm text-text-muted">
          <li>Экономит на выводе команд (git, тесты, чтение файлов), а не «всю работу на 90%».</li>
          <li>−90% — это на конкретных командах. В среднем по сессии выходит меньше, но −70–80% реальны.</li>
          <li>Если ты на подписке (Max/Pro) — это не рубли в кармане, а меньше упираешься в лимиты.</li>
        </ul>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-text-muted">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-warning" />
          <p>
            <strong className="text-text">Важно для Windows:</strong> rtk родом из мира Mac/Linux. На
            Mac и Windows с WSL ставится без проблем. На «голом» Windows установка через curl может
            не пройти — сначала поставь WSL, потом повтори шаги.
          </p>
        </div>
        <a
          href="https://github.com/rtk-ai/rtk"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-4 inline-flex"
        >
          <ExternalLink size={14} /> Открыть на GitHub
        </a>
      </section>
    </div>
  );
}
