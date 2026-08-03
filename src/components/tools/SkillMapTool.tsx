import { Compass } from "lucide-react";
import { SKILL_MAP_STAGES, SKILL_MAP_ITEMS, SKILL_MAP_QUICKSTART } from "@/lib/tools/skill-map-data";

export function SkillMapTool() {
  return (
    <div className="flex flex-col gap-8">
      <div className="card p-5 sm:p-6">
        <h2 className="mb-1 font-bold">Маршрут проекта</h2>
        <p className="text-sm text-text-muted">
          Иди слева направо. На каждом этапе выбирай роль, которая нужна именно сейчас.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {SKILL_MAP_STAGES.map((s) => (
            <div key={s.key} className="rounded-lg border border-border-strong bg-bg-soft p-3">
              <p className="kicker !text-[10px]">{s.order}</p>
              <p className="mt-1 text-sm font-semibold">{s.title}</p>
            </div>
          ))}
        </div>
      </div>

      {SKILL_MAP_STAGES.map((stage) => (
        <section key={stage.key} className="flex flex-col gap-3">
          <div>
            <span className="badge-accent">{stage.order}</span>
            <h3 className="mt-2 text-lg font-bold">{stage.title}</h3>
            <p className="text-sm text-text-muted">{stage.description}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILL_MAP_ITEMS.filter((i) => i.stage === stage.key).map((item) => (
              <div key={item.n} className="card p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="badge !px-1.5 !py-0 text-[10px]">
                    {item.n.toString().padStart(2, "0")}
                  </span>
                  <code className="text-sm font-semibold text-accent">${item.slug}</code>
                </div>
                <p className="text-sm text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="card p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Compass className="text-accent" size={18} />
          <h2 className="font-bold">Не знаешь, с чего начать?</h2>
        </div>
        <p className="mb-4 text-sm text-text-muted">
          Выбери ближайшую задачу — она подскажет первую роль, которую стоит позвать в Codex.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SKILL_MAP_QUICKSTART.map((q) => (
            <div
              key={q.question}
              className="flex items-center justify-between gap-3 rounded-lg border border-border-strong bg-bg-soft px-3.5 py-2.5"
            >
              <span className="text-sm text-text-muted">{q.question}</span>
              <code className="shrink-0 text-sm font-semibold text-accent">${q.skill}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
