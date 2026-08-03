"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/lib/actions/auth-actions";
import { PasswordInput } from "@/components/PasswordInput";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    registerAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-text-muted">
          Имя
        </label>
        <input id="name" name="name" type="text" required className="input" placeholder="Как к тебе обращаться" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-text-muted">
          Email
        </label>
        <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-text-muted">
          Пароль
        </label>
        <PasswordInput
          id="password"
          name="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Минимум 6 символов"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-text-muted">
          Повторите пароль
        </label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Введите пароль ещё раз"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-full">
        {pending ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </button>

      <p className="text-center text-sm text-text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
