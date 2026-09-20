import "server-only";
import { Resend } from "resend";
import {
  assertResendSendResult,
  buildSupportEmail,
  resolveEmailFrom,
  type ParsedSupportRequest,
} from "@/lib/support";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
// Тот же From, что у писем с кодом подтверждения: EMAIL_FROM как есть.
const FROM = resolveEmailFrom();

export async function sendVerificationEmail(to: string, name: string, code: string) {
  if (!resend) {
    console.error("RESEND_API_KEY is not set — cannot send verification email");
    throw new Error("Email service is not configured");
  }

  const html = `
  <div style="background:#0b0b0d;padding:40px 20px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <div style="max-width:420px;margin:0 auto;background:#17171b;border-radius:16px;padding:32px;">
      <p style="color:#c9a15a;font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 12px;">VIBECRAFT</p>
      <h1 style="color:#f2f0ec;font-size:20px;margin:0 0 16px;">Привет, ${name}!</h1>
      <p style="color:#a8a29b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Подтверди почту, чтобы открыть доступ к курсу. Введи этот код на странице подтверждения:
      </p>
      <div style="background:#0b0b0d;border:1px solid #2a2a30;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <span style="color:#c9a15a;font-size:32px;font-weight:700;letter-spacing:8px;">${code}</span>
      </div>
      <p style="color:#6b6660;font-size:12px;line-height:1.6;margin:0;">
        Код действует 15 минут. Если ты не регистрировался на VIBECRAFT — просто проигнорируй это письмо.
      </p>
    </div>
  </div>`;

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `Код подтверждения: ${code}`,
    html,
  });

  // The Resend SDK does NOT throw on API-level failures — it resolves with
  // { data: null, error: {...} }. Without this check, a rejected send
  // (e.g. the sandbox onboarding@resend.dev domain refusing to deliver to
  // anyone but the account owner) looks identical to a successful one.
  try {
    assertResendSendResult(result);
  } catch (err) {
    console.error("Resend rejected the email", result.error ?? err);
    throw err;
  }
}

export async function sendSupportEmail(data: ParsedSupportRequest) {
  if (!resend) {
    console.error("RESEND_API_KEY is not set — cannot send support email");
    throw new Error("Email service is not configured");
  }

  const payload = buildSupportEmail(data);
  const result = await resend.emails.send({
    from: FROM,
    to: payload.to,
    replyTo: payload.replyTo,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  try {
    assertResendSendResult(result);
  } catch (err) {
    console.error("Resend rejected the support email", {
      to: payload.to,
      from: FROM,
      error: result.error ?? err,
    });
    throw err;
  }

  console.info("Support email accepted", {
    to: payload.to,
    from: FROM,
    id: result.data?.id,
  });
}
