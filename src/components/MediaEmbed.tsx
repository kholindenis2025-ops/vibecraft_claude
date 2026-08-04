import { PlayCircle, Presentation, FolderOpen } from "lucide-react";
import { toEmbedUrl } from "@/lib/media";

export function VideoEmbed({ url, directSrc }: { url?: string | null; directSrc?: string | null }) {
  if (!url) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg-soft text-text-dim">
        <PlayCircle size={28} />
        <p className="text-sm">Видео появится здесь</p>
      </div>
    );
  }

  if (directSrc) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl border border-border bg-black">
        <video controls preload="metadata" src={directSrc} className="h-full w-full" />
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-border">
      <iframe
        src={toEmbedUrl(url)}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function SlidesEmbed({ url }: { url?: string | null }) {
  if (!url) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg-soft text-text-dim">
        <Presentation size={28} />
        <p className="text-sm">Презентация появится здесь</p>
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-border">
      <iframe src={toEmbedUrl(url)} className="h-full w-full" allowFullScreen />
    </div>
  );
}

export function DriveLink({ url }: { url?: string | null }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="badge-accent hover:bg-accent/20"
    >
      <FolderOpen size={13} /> Материалы на Google Диске
    </a>
  );
}
