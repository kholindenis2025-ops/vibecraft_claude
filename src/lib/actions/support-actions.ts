"use server";

import { getCurrentUser } from "@/lib/auth";
import { sendSupportEmail } from "@/lib/email";
import { parseSupportRequest } from "@/lib/support";

export type SupportFormState = {
  error?: string;
  sent?: boolean;
} | null;

export async function sendSupportMessageAction(
  _prevState: SupportFormState,
  formData: FormData
): Promise<SupportFormState> {
  const user = await getCurrentUser();
  const parsed = parseSupportRequest(
    {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
    },
    user ? { name: user.name, email: user.email } : null
  );

  if (!parsed.ok) {
    return { error: parsed.error };
  }

  try {
    await sendSupportEmail(parsed.data);
  } catch (err) {
    console.error("Failed to send support email", err);
    const detail = err instanceof Error ? err.message.trim() : "";
    const known =
      /domain is not verified|only send testing emails|not configured|не подтвердил/i.test(
        detail
      );
    return {
      error: known
        ? `Не удалось отправить письмо: ${detail}`
        : "Не удалось отправить письмо. Попробуй позже.",
    };
  }

  return { sent: true };
}
