import "server-only";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const CODE_TTL_MINUTES = 15;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function issueVerificationCode(userId: string, email: string, name: string) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const now = new Date();

  await prisma.user.update({
    where: { id: userId },
    data: {
      verificationCodeHash: codeHash,
      verificationCodeExpiresAt: new Date(now.getTime() + CODE_TTL_MINUTES * 60_000),
      verificationCodeSentAt: now,
      verificationAttempts: 0,
    },
  });

  await sendVerificationEmail(email, name, code);
}

export async function canResendCode(sentAt: Date | null): Promise<{ ok: boolean; waitSeconds: number }> {
  if (!sentAt) return { ok: true, waitSeconds: 0 };
  const elapsedSeconds = (Date.now() - sentAt.getTime()) / 1000;
  const waitSeconds = Math.max(0, Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds));
  return { ok: waitSeconds === 0, waitSeconds };
}

export async function checkVerificationCode(
  userId: string,
  inputCode: string
): Promise<{ ok: boolean; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      verificationCodeHash: true,
      verificationCodeExpiresAt: true,
      verificationAttempts: true,
    },
  });

  if (!user?.verificationCodeHash || !user.verificationCodeExpiresAt) {
    return { ok: false, error: "Код не найден. Запроси новый." };
  }

  if (user.verificationAttempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Слишком много попыток. Запроси новый код." };
  }

  if (user.verificationCodeExpiresAt < new Date()) {
    return { ok: false, error: "Код истёк. Запроси новый." };
  }

  const matches = await bcrypt.compare(inputCode, user.verificationCodeHash);
  if (!matches) {
    await prisma.user.update({
      where: { id: userId },
      data: { verificationAttempts: { increment: 1 } },
    });
    return { ok: false, error: "Неверный код" };
  }

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

  return { ok: true };
}
