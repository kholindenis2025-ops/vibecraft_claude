import { ExternalLink, Terminal } from "lucide-react";
import { SKILLS_LIBRARY } from "@/lib/tools/skills-library-data";
import { CopyButton } from "@/components/CopyButton";

export function SkillsLibraryTool() {
  return (
    <div className="flex flex-col gap-8">
      <div className="card p-5 sm:p-6">
        <h2 className="mb-3 font-bold">Как установить — 10 секунд</h2>
        <ol className="flex flex-col gap-1.5 text-sm text-text-muted">
          <li>1. Скопируй промпт с любой карточки ниже.</li>
          <li>2. Вставь его в чат Claude Code или Codex.</li>
          <li>3. Ассистент сам скачает скилл и подключит. Со следующего сообщения он работает.</li>
        </ol>
        <p className="mt-3 text-xs text-text-dim">
          Для тех, кто дружит с терминалом — на карточках движков указана прямая команда.
        </p>
      </div>

      {SKILLS_LIBRARY.map((section) => (
        <section key={section.key} className="flex flex-col gap-3">
          <div>
            <h3 className="text-lg font-bold">{section.title}</h3>
            <p className="text-sm text-text-muted">{section.description}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {section.cards.map((card) => (
              <div key={card.name} className="card flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{card.name}</span>
                  <span className="badge !px-2 !py-0.5 text-[10px]">{card.badge}</span>
                </div>
                <p className="text-sm text-text-muted">{card.description}</p>
                <ul className="flex flex-col gap-1 text-xs text-text-dim">
                  {card.useCases.map((u) => (
                    <li key={u}>· {u}</li>
                  ))}
                </ul>
                {card.terminalCmd && (
                  <div className="flex items-center gap-1.5 rounded-md bg-bg-soft px-2.5 py-1.5 font-mono text-xs text-text-muted">
                    <Terminal size={12} className="shrink-0" />
                    {card.terminalCmd}
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <CopyButton text={card.prompt} />
                  <a
                    href={card.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost !px-2 !py-2 text-xs"
                  >
                    <ExternalLink size={13} /> GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="card p-5 text-xs text-text-dim sm:p-6">
        Честно про звёзды. Движки (yt-dlp, Whisper, FFmpeg) — фундамент на 60–180 тыс. звёзд,
        проверенный годами. Готовые узкие скиллы новее, звёзд у них меньше — экосистеме
        Claude-скиллов меньше года. Поэтому каждый скилл выше стоит на проверенном движке.
      </div>
    </div>
  );
}
