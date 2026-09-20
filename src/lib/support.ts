export const SUPPORT_INBOX = "support@vibe-craft.ru";
export const SUPPORT_SUBJECT_PREFIX = "[Поддержка VIBECRAFT]";
export const DEFAULT_EMAIL_FROM = "VIBECRAFT <onboarding@resend.dev>";

export type SupportFormInput = {
  subject: string;
  message: string;
  name?: string;
  email?: string;
};

export type SupportIdentity = {
  name: string;
  email: string;
} | null;

export type ParsedSupportRequest = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type SupportParseResult =
  | { ok: true; data: ParsedSupportRequest }
  | { ok: false; error: string };

export type SupportEmailPayload = {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
};

export type ResendSendResult = {
  data?: { id?: string } | null;
  error?: { message: string } | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function resolveSupportInbox(envInbox = process.env.SUPPORT_EMAIL): string {
  const candidate = envInbox?.trim().toLowerCase() ?? "";
  if (EMAIL_RE.test(candidate)) {
    return candidate;
  }
  return SUPPORT_INBOX;
}

export function resolveEmailFrom(envFrom = process.env.EMAIL_FROM): string {
  const candidate = envFrom?.trim() ?? "";
  if (candidate.includes("@")) {
    return candidate;
  }
  return DEFAULT_EMAIL_FROM;
}

export function formatSupportSubtitle(email?: string | null): string {
  const reply = email?.trim();
  if (reply) {
    return `Опишите проблему. Ответ придёт на ${reply}.`;
  }
  return "Опишите проблему. Мы ответим на почту, указанную ниже.";
}

export function formatSupportSentMessage(): string {
  return "Обращение отправлено. Ответ придёт на вашу почту.";
}

export function formatSupportSendError(err: unknown): string {
  const detail = err instanceof Error ? err.message.trim() : "";
  if (/domain is not verified|not verified/i.test(detail)) {
    return "Не удалось отправить обращение. Почтовый сервис не принял адрес отправителя. Попробуйте позже.";
  }
  if (/invalid.?from|from address|validation_error/i.test(detail)) {
    return "Не удалось отправить обращение. Почтовый сервис отклонил адрес отправителя. Попробуйте позже.";
  }
  if (/rate.?limit|too many/i.test(detail)) {
    return "Слишком много попыток. Подождите минуту и отправьте снова.";
  }
  if (/forbidden|unauthorized|api.?key/i.test(detail)) {
    return "Не удалось отправить обращение. Почтовый сервис отклонил запрос. Попробуйте позже.";
  }
  return "Не удалось отправить обращение. Попробуйте позже.";
}

export function assertResendSendResult(result: ResendSendResult): void {
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (!result.data?.id) {
    throw new Error("Resend не подтвердил отправку: нет id письма");
  }
}

function fail(error: string): SupportParseResult {
  return { ok: false, error };
}

export function parseSupportRequest(
  input: SupportFormInput,
  identity: SupportIdentity
): SupportParseResult {
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (subject.length < 2) {
    return fail("Укажите тему");
  }
  if (subject.length > 120) {
    return fail("Тема слишком длинная");
  }
  if (message.length < 10) {
    return fail("Напишите сообщение — хотя бы пару предложений");
  }
  if (message.length > 4000) {
    return fail("Сообщение слишком длинное");
  }

  if (identity) {
    return {
      ok: true,
      data: {
        name: identity.name.trim(),
        email: identity.email.trim().toLowerCase(),
        subject,
        message,
      },
    };
  }

  const name = (input.name ?? "").trim();
  const email = (input.email ?? "").trim().toLowerCase();

  if (name.length < 2) {
    return fail("Укажите имя");
  }
  if (name.length > 60) {
    return fail("Имя слишком длинное");
  }
  if (!EMAIL_RE.test(email)) {
    return fail("Введите корректную почту");
  }

  return { ok: true, data: { name, email, subject, message } };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildSupportEmail(
  data: ParsedSupportRequest,
  inbox = resolveSupportInbox()
): SupportEmailPayload {
  const text = [
    `Имя: ${data.name}`,
    `Почта: ${data.email}`,
    `Тема: ${data.subject}`,
    "",
    data.message,
  ].join("\n");

  const html = `
  <div style="background:#0b0b0d;padding:40px 20px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#17171b;border-radius:16px;padding:32px;">
      <p style="color:#c9a15a;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px;">VIBECRAFT · поддержка</p>
      <h1 style="color:#f2f0ec;font-size:20px;margin:0 0 16px;">${escapeHtml(data.subject)}</h1>
      <p style="color:#a8a29b;font-size:14px;line-height:1.6;margin:0 0 8px;">
        <strong style="color:#f2f0ec;">${escapeHtml(data.name)}</strong>
        · ${escapeHtml(data.email)}
      </p>
      <p style="color:#a8a29b;font-size:14px;line-height:1.6;margin:16px 0 0;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
    </div>
  </div>`;

  return {
    to: inbox,
    replyTo: data.email,
    subject: `${SUPPORT_SUBJECT_PREFIX} ${data.subject}`,
    html,
    text,
  };
}
