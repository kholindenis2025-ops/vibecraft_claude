"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Upload, Trash2, Plus, Loader2, type LucideIcon } from "lucide-react";

export type MediaItem = { title: string; url: string };

type Row = MediaItem & { key: string; uploading: boolean; progress: number; error: string | null };

let keyCounter = 0;
function newKey(): string {
  keyCounter += 1;
  return `media_${Date.now()}_${keyCounter}`;
}

export function MediaListEditor({
  items,
  onChange,
  onBusyChange,
  accept,
  icon: Icon,
  emptyLabel,
  uploadLabel,
}: {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  onBusyChange?: (busy: boolean) => void;
  accept: string;
  icon: LucideIcon;
  emptyLabel: string;
  uploadLabel: string;
}) {
  const [rows, setRows] = useState<Row[]>(() =>
    items.map((it) => ({ ...it, key: newKey(), uploading: false, progress: 0, error: null }))
  );
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    onBusyChange?.(rows.some((r) => r.uploading));
  }, [rows, onBusyChange]);

  function sync(next: Row[]) {
    setRows(next);
    onChange(next.map(({ title, url }) => ({ title, url })));
  }

  function addRow() {
    sync([...rows, { key: newKey(), title: "", url: "", uploading: false, progress: 0, error: null }]);
  }

  function removeRow(key: string) {
    sync(rows.filter((r) => r.key !== key));
  }

  function updateTitle(key: string, title: string) {
    sync(rows.map((r) => (r.key === key ? { ...r, title } : r)));
  }

  async function handleFile(key: string, file: File | undefined) {
    if (!file) return;
    setRows((prev) =>
      prev.map((r) => (r.key === key ? { ...r, uploading: true, progress: 0, error: null } : r))
    );
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/lesson-upload",
        multipart: true,
        onUploadProgress: (event) => {
          setRows((prev) =>
            prev.map((r) => (r.key === key ? { ...r, progress: event.percentage } : r))
          );
        },
      });
      setRows((prev) => {
        const next = prev.map((r) =>
          r.key === key ? { ...r, url: blob.url, uploading: false, progress: 100 } : r
        );
        onChange(next.map(({ title, url }) => ({ title, url })));
        return next;
      });
    } catch {
      setRows((prev) =>
        prev.map((r) => (r.key === key ? { ...r, uploading: false, error: "Не удалось загрузить" } : r))
      );
    } finally {
      const input = fileInputs.current[key];
      if (input) input.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && <p className="text-sm text-text-dim">{emptyLabel}</p>}
      {rows.map((r) => (
        <div key={r.key} className="flex flex-col gap-2 rounded-lg border border-border p-3">
          <div className="flex items-center gap-2">
            <input
              value={r.title}
              onChange={(e) => updateTitle(r.key, e.target.value)}
              placeholder="Название (необязательно)"
              className="input flex-1"
            />
            <button
              type="button"
              onClick={() => removeRow(r.key)}
              className="btn-ghost !px-2 text-danger"
            >
              <Trash2 size={15} />
            </button>
          </div>

          {r.uploading && (
            <div className="flex flex-col gap-1">
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${r.progress}%` }} />
              </div>
              <p className="text-xs text-text-dim">{Math.round(r.progress)}%</p>
            </div>
          )}

          {!r.uploading && r.url && (
            <div className="flex items-center gap-2 rounded-lg bg-bg-soft px-3 py-2 text-sm">
              <Icon size={16} className="shrink-0 text-accent" />
              <span className="min-w-0 flex-1 truncate">{r.url}</span>
            </div>
          )}

          {r.error && <p className="text-xs text-danger">{r.error}</p>}

          <input
            ref={(el) => {
              fileInputs.current[r.key] = el;
            }}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => handleFile(r.key, e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInputs.current[r.key]?.click()}
            disabled={r.uploading}
            className="btn-secondary self-start text-sm"
          >
            {r.uploading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> {Math.round(r.progress)}%
              </>
            ) : (
              <>
                <Upload size={15} /> {r.url ? "Заменить файл" : uploadLabel}
              </>
            )}
          </button>
        </div>
      ))}
      <button type="button" onClick={addRow} className="btn-ghost self-start text-sm">
        <Plus size={15} /> Добавить
      </button>
    </div>
  );
}
