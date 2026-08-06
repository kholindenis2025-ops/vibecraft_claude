"use client";

import { useRef, useState, type RefObject } from "react";
import { upload } from "@vercel/blob/client";
import { ImagePlus, Loader2 } from "lucide-react";

export function ContentImageUpload({
  textareaRef,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function insertAtCursor(markdown: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const needsLeadingBreak = before.length > 0 && !before.endsWith("\n\n");
    const insertion = `${needsLeadingBreak ? "\n\n" : ""}${markdown}\n\n`;

    textarea.value = before + insertion + after;
    const cursor = (before + insertion).length;
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
  }

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/lesson-upload",
      });
      insertAtCursor(`![](${blob.url})`);
    } catch {
      setError("Не удалось загрузить изображение. Попробуй ещё раз.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="btn-ghost self-start text-xs"
      >
        {uploading ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Загружаем…
          </>
        ) : (
          <>
            <ImagePlus size={14} /> Вставить изображение
          </>
        )}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
