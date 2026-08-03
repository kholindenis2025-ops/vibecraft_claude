"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { adminDeleteUserAction } from "@/lib/actions/admin-actions";

export function AdminDeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Удалить пользователя «${userName}»? Это действие необратимо.`)) return;
    startTransition(async () => {
      await adminDeleteUserAction(userId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn-ghost !px-2 !py-1.5 text-xs text-danger hover:text-danger"
    >
      <Trash2 size={14} /> {isPending ? "Удаляем…" : "Удалить"}
    </button>
  );
}
