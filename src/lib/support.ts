export const SUPPORT_INBOX = "support@vibe-craft.ru";
export const SUPPORT_SUBJECT_PREFIX = "[Поддержка VIBECRAFT]";

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    return fail("Укажи тему обращения");
  }
  if (subject.length > 120) {
    return fail("Тема слишком длинная");
  }
  if (message.length < 10) {
    return fail("Напиши текст обращения — хотя бы пару предложений");
  }
  if (message.length > 4000) {
    return fail("Текст слишком длинный");
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
    return fail("Укажи имя");
  }
  if (name.length > 60) {
    return fail("Имя слишком длинное");
  }
  if (!EMAIL_RE.test(email)) {
    return fail("Введи корректный email");
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

export function buildSupportEmail(data: ParsedSupportRequest): SupportEmailPayload {
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
    to: SUPPORT_INBOX,
    replyTo: data.email,
    subject: `${SUPPORT_SUBJECT_PREFIX} ${data.subject}`,
    html,
    text,
  };
}
