"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { sendSupportMessageAction, type SupportFormState } from "@/lib/actions/support-actions";
import { formatSupportSentMessage } from "@/lib/support";

type Props = {
  identity: { name: string; email: string } | null;
};

export function SupportForm({ identity }: Props) {
  const [state, formAction, pending] = useActionState<SupportFormState, FormData>(
    sendSupportMessageAction,
    null
  );

  if (state?.sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <CheckCircle2 size={24} />
        </span>
        <p className="text-lg font-semibold">Обращение отправлено</p>
        <p className="text-sm text-text-muted">
          {formatSupportSentMessage()}
        </p>
        <Link href={identity ? "/dashboard" : "/"} className="btn-secondary">
          Назад
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {!identity && (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-text-muted">
              Имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={60}
              className="input"
              placeholder="Как к вам обращаться"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-text-muted">
              Почта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
              placeholder="you@example.com"
            />
          </div>
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="text-sm font-medium text-text-muted">
          Тема
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          minLength={2}
          maxLength={120}
          className="input"
          placeholder="Коротко, в чём дело"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-text-muted">
          Сообщение
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          className="input min-h-32 resize-y"
          placeholder="Что случилось и что уже пробовали"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-full">
        {pending ? "Отправляем…" : "Отправить"}
      </button>
    </form>
  );
}
