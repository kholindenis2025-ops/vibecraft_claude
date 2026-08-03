"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyButton({ text, label = "Копировать промпт" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently ignore
    }
  }

  return (
    <button type="button" onClick={handleCopy} className="btn-secondary !py-2 text-xs">
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Скопировано" : label}
    </button>
  );
}
