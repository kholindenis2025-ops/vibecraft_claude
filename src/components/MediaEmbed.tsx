"use client";

import { useState } from "react";
import { PlayCircle, Presentation, FolderOpen, Download, AlertTriangle } from "lucide-react";
import { toEmbedUrl } from "@/lib/media";
import { isYandexDiskUrl } from "@/lib/yandex-disk";

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

  const unavailable = (directSrc && playbackFailed) || (!directSrc && isYandexDiskUrl(url));

  if (unavailable) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-bg-soft p-8 text-center text-text-dim">
        <AlertTriangle size={24} />
        <p className="text-sm">
          Не удалось встроить плеер прямо на странице. Открой видео по ссылке ниже.
        </p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
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
          href={url}
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
