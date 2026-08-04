"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export type AdminFormState = { error?: string; success?: boolean } | null;

const setPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Пароль должен быть не короче 6 символов").max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export async function adminSetUserPasswordAction(
  userId: string,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireAdmin();

  const parsed = setPasswordSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Проверьте введённые данные" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adminVerifyUserAction(userId: string) {
  await requireAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerified: true,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
      verificationCodeSentAt: null,
      verificationAttempts: 0,
    },
  });

  revalidatePath("/admin/users");
}

const ASSIGNABLE_ROLES = ["STUDENT", "CURATOR", "ADMIN"] as const;

export async function adminSetUserRoleAction(userId: string, role: string) {
  const admin = await requireAdmin();

  if (admin.id === userId) {
    throw new Error("Нельзя изменить роль своего собственного аккаунта");
  }
  if (!ASSIGNABLE_ROLES.includes(role as (typeof ASSIGNABLE_ROLES)[number])) {
    throw new Error("Неизвестная роль");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: role as (typeof ASSIGNABLE_ROLES)[number] },
  });

  revalidatePath("/admin/users");
}

export async function adminDeleteUserAction(userId: string) {
  const admin = await requireAdmin();

  if (admin.id === userId) {
    throw new Error("Нельзя удалить свой собственный аккаунт");
  }

  await prisma.user.delete({ where: { id: userId } });

  revalidatePath("/admin/users");
}
