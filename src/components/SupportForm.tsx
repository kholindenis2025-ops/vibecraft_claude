"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { sendSupportMessageAction, type SupportFormState } from "@/lib/actions/support-actions";

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
        <p className="text-lg font-semibold">Письмо отправлено</p>
        <p className="text-sm text-text-muted">
          Ответим на {identity?.email ?? "указанную почту"}. Обычно это занимает немного времени.
        </p>
        <Link href={identity ? "/dashboard" : "/"} className="btn-secondary">
          Назад
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {identity ? (
        <p className="rounded-lg border border-border bg-bg-soft px-3 py-2 text-sm text-text-muted">
          От: <span className="text-text">{identity.name}</span> · {identity.email}
        </p>
      ) : (
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
              placeholder="Как к тебе обращаться"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-text-muted">
              Email
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
          placeholder="Коротко, о чём вопрос"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-text-muted">
          Текст
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={6}
          className="input min-h-32 resize-y"
          placeholder="Опиши, что случилось и что уже пробовал"
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
