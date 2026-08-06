"use client";

import { useState } from "react";
import { PlayCircle, Presentation, Link2, Download, AlertTriangle } from "lucide-react";
import { toEmbedUrl } from "@/lib/media";

export function VideoEmbed({ url, directSrc }: { url?: string | null; directSrc?: string | null }) {
  const [playbackFailed, setPlaybackFailed] = useState(false);

  if (!url) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg-soft text-text-dim">
        <PlayCircle size={28} />
        <p className="text-sm">Видео появится здесь</p>
      </div>
    );
  }

  const unavailable = directSrc && playbackFailed;
  const downloadHref = directSrc ? `${directSrc}?download=1` : url;

  if (unavailable) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-bg-soft p-8 text-center text-text-dim">
        <AlertTriangle size={24} />
        <p className="text-sm">
          Не удалось встроить плеер прямо на странице. Открой видео по ссылке ниже.
        </p>
        <a href={downloadHref} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
          <Download size={15} /> Открыть / скачать видео
        </a>
      </div>
    );
  }

  if (directSrc) {
    return (
      <div className="flex flex-col gap-2">
        <div className="aspect-video overflow-hidden rounded-xl border border-border bg-black">
          <video
            controls
            preload="metadata"
            src={directSrc}
            className="h-full w-full"
            onError={() => setPlaybackFailed(true)}
          />
        </div>
        <a
          href={downloadHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 self-start text-xs text-text-dim hover:text-accent"
        >
          <Download size={13} /> Скачать видео
        </a>
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

export function SlidesEmbed({ url, directSrc }: { url?: string | null; directSrc?: string | null }) {
  if (!url) {
    return (
      <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg-soft text-text-dim">
        <Presentation size={28} />
        <p className="text-sm">Презентация появится здесь</p>
      </div>
    );
  }

  const downloadHref = directSrc ? `${directSrc}?download=1` : url;

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-video overflow-hidden rounded-xl border border-border">
        <iframe src={directSrc ?? toEmbedUrl(url)} className="h-full w-full" allowFullScreen />
      </div>
      <a
        href={downloadHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 self-start text-xs text-text-dim hover:text-accent"
      >
        <Download size={13} /> Скачать презентацию
      </a>
    </div>
  );
}

export function ResourceLinks({ resources }: { resources: { id: string; title: string; url: string }[] }) {
  if (resources.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {resources.map((r) => (
        <a
          key={r.id}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="badge-accent hover:bg-accent/20"
        >
          <Link2 size={13} /> {r.title}
        </a>
      ))}
    </div>
  );
}
