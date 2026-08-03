"use client";

import { useActionState, useState } from "react";
import { KeyRound, CheckCircle2 } from "lucide-react";
import { adminSetUserPasswordAction, type AdminFormState } from "@/lib/actions/admin-actions";
import { PasswordInput } from "@/components/PasswordInput";

export function AdminPasswordForm({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const boundAction = adminSetUserPasswordAction.bind(null, userId);
  const [state, formAction, pending] = useActionState<AdminFormState, FormData>(
    boundAction,
    null
  );

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost !px-2 !py-1.5 text-xs">
        <KeyRound size={14} /> Сменить пароль
      </button>
    );
  }

  if (state?.success) {
    return (
      <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
        <CheckCircle2 size={14} /> Пароль обновлён
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <PasswordInput
        name="newPassword"
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="Новый пароль"
      />
      <PasswordInput
        name="confirmPassword"
        required
        minLength={6}
        autoComplete="new-password"
        placeholder="Повторите пароль"
      />
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary !px-3 !py-1.5 text-xs">
          {pending ? "Сохраняем…" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-ghost !px-3 !py-1.5 text-xs"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
