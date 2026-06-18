/**
 * AI sağlayıcı tanımları.
 * Sağlayıcıdan bağımsız bir soyutlama sunar (OpenAI, Anthropic, Gemini).
 */

import type { AiProviderId, AiProviderStatus } from "@/src/types/ai";

export interface AiProviderInfo {
  id: AiProviderId;
  name: string;
  status: AiProviderStatus;
  /** Anahtarın okunacağı ortam değişkeni adı (yalnızca sunucu). */
  envKey: string;
}

export const AI_PROVIDERS: AiProviderInfo[] = [
  { id: "openai", name: "OpenAI", status: "ready", envKey: "OPENAI_API_KEY" },
  { id: "anthropic", name: "Anthropic Claude", status: "test", envKey: "ANTHROPIC_API_KEY" },
  { id: "gemini", name: "Google Gemini", status: "disabled", envKey: "GEMINI_API_KEY" },
];

export const DEFAULT_PROVIDER: AiProviderId = "anthropic";

export function getProvider(id: AiProviderId): AiProviderInfo | undefined {
  return AI_PROVIDERS.find((provider) => provider.id === id);
}
