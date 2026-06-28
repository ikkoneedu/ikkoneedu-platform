import "server-only";

/**
 * Çok-sağlayıcılı yapay zekâ katmanı (YALNIZCA SUNUCU).
 *
 * Üç sağlayıcı: Anthropic (Claude), OpenAI (GPT), Google (Gemini).
 * Metin üretimi her üçünde; görsel üretimi OpenAI + Gemini'de.
 * Anahtarlar env'den okunur; yoksa "no-key:<provider>" fırlatır ve çağıran
 * demo'ya düşer (sıfır maliyet). SDK yok — doğrudan fetch (Node runtime).
 *
 * Env:
 *   ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY
 */

export type AiProvider = "anthropic" | "openai" | "gemini";

const ENV_KEY: Record<AiProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
};

export function providerHasKey(p: AiProvider): boolean {
  return Boolean(process.env[ENV_KEY[p]]);
}

/** Anahtarı olan ilk sağlayıcıyı tercih sırasına göre döndürür. */
export function firstAvailableProvider(prefs: AiProvider[]): AiProvider | null {
  for (const p of prefs) if (providerHasKey(p)) return p;
  return null;
}

export interface TextRequest {
  system: string;
  prompt: string;
  model: string;
  maxTokens?: number;
}

interface ContentBlock {
  text?: string;
}

async function anthropicText(key: string, r: TextRequest): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: r.model,
      max_tokens: r.maxTokens ?? 700,
      system: r.system,
      messages: [{ role: "user", content: r.prompt }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = (await res.json()) as { content?: ContentBlock[] };
  return (Array.isArray(data.content) ? data.content.map((b) => b.text ?? "").join("") : "").trim();
}

async function openaiText(key: string, r: TextRequest): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: r.model,
      max_tokens: r.maxTokens ?? 700,
      messages: [
        { role: "system", content: r.system },
        { role: "user", content: r.prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`openai ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

async function geminiText(key: string, r: TextRequest): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${r.model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: r.system }] },
      contents: [{ role: "user", parts: [{ text: r.prompt }] }],
      generationConfig: { maxOutputTokens: r.maxTokens ?? 700 },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("").trim();
}

/** Metin üretir (seçilen sağlayıcı). Anahtar yoksa "no-key:<p>" fırlatır. */
export async function generateText(p: AiProvider, r: TextRequest): Promise<string> {
  const key = process.env[ENV_KEY[p]];
  if (!key) throw new Error(`no-key:${p}`);
  if (p === "anthropic") return anthropicText(key, r);
  if (p === "openai") return openaiText(key, r);
  return geminiText(key, r);
}

export interface ImageRequest {
  prompt: string;
  /** "1024x1024" gibi. */
  size?: string;
}

export interface ImageResult {
  /** base64 (data URI'siz) veya null. */
  b64: string | null;
  /** doğrudan URL (varsa). */
  url: string | null;
}

async function openaiImage(key: string, r: ImageRequest): Promise<ImageResult> {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt: r.prompt, size: r.size ?? "1024x1024" }),
  });
  if (!res.ok) throw new Error(`openai-image ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = (await res.json()) as { data?: { b64_json?: string; url?: string }[] };
  const first = data.data?.[0];
  return { b64: first?.b64_json ?? null, url: first?.url ?? null };
}

async function geminiImage(key: string, r: ImageRequest): Promise<ImageResult> {
  // Imagen 3 (generateImages). Boyut modelce yönetilir.
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ instances: [{ prompt: r.prompt }], parameters: { sampleCount: 1 } }),
  });
  if (!res.ok) throw new Error(`gemini-image ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = (await res.json()) as { predictions?: { bytesBase64Encoded?: string }[] };
  return { b64: data.predictions?.[0]?.bytesBase64Encoded ?? null, url: null };
}

/** Görsel üretir. Sağlayıcı openai veya gemini olmalı. */
export async function generateImage(p: AiProvider, r: ImageRequest): Promise<ImageResult> {
  const key = process.env[ENV_KEY[p]];
  if (!key) throw new Error(`no-key:${p}`);
  if (p === "openai") return openaiImage(key, r);
  if (p === "gemini") return geminiImage(key, r);
  throw new Error(`image-unsupported:${p}`);
}
