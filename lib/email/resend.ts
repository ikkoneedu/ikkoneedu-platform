import "server-only";

/**
 * E-posta gönderim yardımcısı (Resend) — YALNIZCA SUNUCU.
 *
 * `RESEND_API_KEY` tanımsızsa (mock/dev) gerçek gönderim YAPILMAZ; konsola
 * loglanır ve `ok:true` döner — mevcut "env yoksa nazikçe düş" felsefesiyle
 * tutarlı (bkz. `lib/services/auth-actions.ts`, `lib/ai/providers.ts`).
 */

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export interface SendEmailResult {
  ok: boolean;
  mock: boolean;
  error?: string;
}

const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "ikkoneedu <onboarding@resend.dev>";

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:mock] to=${input.to} subject="${input.subject}"`);
    return { ok: true, mock: true };
  }
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    if (result.error) {
      return { ok: false, mock: false, error: result.error.message };
    }
    return { ok: true, mock: false };
  } catch (e) {
    return { ok: false, mock: false, error: String((e as Error)?.message ?? e) };
  }
}
