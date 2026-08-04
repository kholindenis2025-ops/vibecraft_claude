"use client";

import { useTransition } from "react";
import { BadgeCheck } from "lucide-react";
import { adminVerifyUserAction } from "@/lib/actions/admin-actions";

export function AdminVerifyUserButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await adminVerifyUserAction(userId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="btn-ghost !px-2 !py-1.5 text-xs text-accent hover:text-accent"
    >
      <BadgeCheck size={14} /> {isPending ? "Подтверждаем…" : "Подтвердить почту"}
    </button>
  );
}
