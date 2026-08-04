"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  verifyEmailCodeAction,
  resendVerificationCodeAction,
  logoutAction,
  type AuthFormState,
  type ResendState,
} from "@/lib/actions/auth-actions";

export function VerifyEmailForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    verifyEmailCodeAction,
    null
  );
  const [resendState, setResendState] = useState<ResendState>(null);
  const [resendPending, setResendPending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleResend() {
    setResendPending(true);
    const result = await resendVerificationCodeAction();
    setResendState(result);
    if (result?.sent) setCooldown(60);
    if (result?.waitSeconds) setCooldown(result.waitSeconds);
    setResendPending(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="code" className="text-sm font-medium text-text-muted">
            Код из письма
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            autoFocus
            className="input text-center text-2xl tracking-[0.5em]"
            placeholder="000000"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Проверяем…" : "Подтвердить"}
        </button>
      </form>

      <div className="flex flex-col items-center gap-2 border-t border-border pt-4">
        {resendState?.sent && (
          <p className="flex items-center gap-1.5 text-sm text-accent">
            <CheckCircle2 size={15} /> Новый код отправлен
          </p>
        )}
        {resendState?.error && <p className="text-sm text-danger">{resendState.error}</p>}
        <button
          type="button"
          onClick={handleResend}
          disabled={resendPending || cooldown > 0}
          className="btn-ghost text-sm"
        >
          {cooldown > 0
            ? `Отправить снова через ${cooldown} сек.`
            : resendPending
              ? "Отправляем…"
              : "Отправить код ещё раз"}
        </button>
        <form action={logoutAction}>
          <button type="submit" className="text-xs text-text-dim hover:text-accent">
            Выйти и войти позже
          </button>
        </form>
      </div>
    </div>
  );
}
