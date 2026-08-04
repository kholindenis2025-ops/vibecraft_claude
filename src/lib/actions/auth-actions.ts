"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { issueVerificationCode, checkVerificationCode, canResendCode } from "@/lib/verification";
import { requireUser } from "@/lib/auth";

export type AuthFormState = {
  error?: string;
} | null;

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Имя должно быть не короче 2 символов").max(60),
    email: z.string().trim().toLowerCase().email("Введите корректный email"),
    password: z.string().min(6, "Пароль должен быть не короче 6 символов").max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Пользователь с таким email уже зарегистрирован" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash, emailVerified: false },
  });

  try {
    await issueVerificationCode(user.id, user.email, user.name);
  } catch (err) {
    console.error("Failed to send verification email", err);
  }

  await createSession({ userId: user.id, role: user.role });
  redirect("/verify-email");
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Неверный email или пароль" };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Неверный email или пароль" };
  }

  await createSession({ userId: user.id, role: user.role });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function verifyEmailCodeAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const user = await requireUser();
  if (user.emailVerified) redirect("/dashboard");

  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) {
    return { error: "Код должен состоять из 6 цифр" };
  }

  const result = await checkVerificationCode(user.id, code);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/dashboard");
}

export type ResendState = { error?: string; sent?: boolean; waitSeconds?: number } | null;

export async function resendVerificationCodeAction(): Promise<ResendState> {
  const user = await requireUser();
  if (user.emailVerified) redirect("/dashboard");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { verificationCodeSentAt: true },
  });

  const { ok, waitSeconds } = await canResendCode(dbUser?.verificationCodeSentAt ?? null);
  if (!ok) {
    return { error: `Подожди ещё ${waitSeconds} сек. перед повторной отправкой`, waitSeconds };
  }

  try {
    await issueVerificationCode(user.id, user.email, user.name);
  } catch {
    return { error: "Не удалось отправить письмо. Попробуй позже." };
  }

  return { sent: true };
}
