"use client";

import { useTransition } from "react";
import { Check, Ban, Undo2 } from "lucide-react";
import type { AccessStatus } from "@/lib/access";
import { adminSetUserAccessAction } from "@/lib/actions/admin-actions";

export function AdminAccessButtons({
  userId,
  accessStatus,
}: {
  userId: string;
  accessStatus: AccessStatus;
}) {
  const [isPending, startTransition] = useTransition();

  function setAccess(next: AccessStatus) {
    startTransition(async () => {
      await adminSetUserAccessAction(userId, next);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {accessStatus !== "ACTIVE" && (
        <button
          type="button"
          onClick={() => setAccess("ACTIVE")}
          disabled={isPending}
          className="btn-ghost !px-2 !py-1.5 text-xs text-accent hover:text-accent"
        >
          <Check size={14} /> {isPending ? "Сохраняем…" : "Выдать"}
        </button>
      )}
      {accessStatus !== "REJECTED" && (
        <button
          type="button"
          onClick={() => setAccess("REJECTED")}
          disabled={isPending}
          className="btn-ghost !px-2 !py-1.5 text-xs text-danger hover:text-danger"
        >
          <Ban size={14} /> Отклонить
        </button>
      )}
      {accessStatus === "ACTIVE" && (
        <button
          type="button"
          onClick={() => setAccess("PENDING")}
          disabled={isPending}
          className="btn-ghost !px-2 !py-1.5 text-xs text-warning hover:text-warning"
        >
          <Undo2 size={14} /> Снять доступ
        </button>
      )}
    </div>
  );
}
