"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/lib/actions/auth-actions";
import { PasswordInput } from "@/components/PasswordInput";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          placeholder="Твой пароль"
        />
      </div>

      {state?.error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary mt-2 w-full">
        {pending ? "Входим…" : "Войти"}
      </button>

      <p className="text-center text-sm text-text-muted">
        Ещё нет аккаунта?{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
