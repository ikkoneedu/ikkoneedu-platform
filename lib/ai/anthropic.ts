import "server-only";

/**
 * Anthropic (Claude) çağrısı — YALNIZCA SUNUCU.
 *
 * ANTHROPIC_API_KEY tanımlıysa gerçek yanıt üretir; yoksa "no-key" fırlatır ve
 * çağıran taraf demo'ya düşer (sıfır maliyet). SDK yerine doğrudan fetch
 * kullanılır (bağımlılık yok, Node runtime'da çalışır).
 */

// Maliyet-etkin, hızlı model (sohbet/yorum için yeterli).
export const AI_MODEL = "claude-haiku-4-5-20251001";

export function hasAiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

interface ContentBlock {
  type?: string;
  text?: string;
}

/** Sistem + kullanıcı isteminden tek seferlik metin üretir. */
export async function generateAi(
  system: string,
  userText: string,
  maxTokens = 700,
): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("no-key");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userText }],
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`anthropic ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as { content?: ContentBlock[] };
  const text = Array.isArray(data.content)
    ? data.content.map((b) => b.text ?? "").join("")
    : "";
  return text.trim();
}
