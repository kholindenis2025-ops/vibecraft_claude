import { BookOpen, Download } from "lucide-react";

export function LessonMaterials({
  materials,
}: {
  materials: { id: string; title: string | null; url: string }[];
}) {
  if (materials.length === 0) return null;

  return (
    <div className="card flex flex-col gap-2 p-5 sm:p-6">
      <h2 className="font-bold">Материалы</h2>
      {materials.map((m, i) => (
        <a
          key={m.id}
          href={`/api/materials/${m.id}`}
          className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-bg-soft"
        >
          <BookOpen size={16} className="shrink-0 text-accent" />
          <span className="min-w-0 flex-1 truncate">{m.title || `Материал ${i + 1}`}</span>
          <Download size={14} className="shrink-0 text-text-dim" />
        </a>
      ))}
    </div>
  );
}
