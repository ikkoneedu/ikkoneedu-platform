/**
 * AI model kataloğu.
 * Her sağlayıcı için kullanılabilecek modeller (hazırlık).
 */

import type { AiModel, AiProviderId } from "@/src/types/ai";

export const AI_MODELS: AiModel[] = [
  { id: "claude-opus-4-8", provider: "anthropic", label: "Claude Opus 4.8", contextWindow: 200000 },
  { id: "claude-sonnet-4-6", provider: "anthropic", label: "Claude Sonnet 4.6", contextWindow: 200000 },
  { id: "gpt-4o", provider: "openai", label: "GPT-4o", contextWindow: 128000 },
  { id: "gpt-4o-mini", provider: "openai", label: "GPT-4o mini", contextWindow: 128000 },
  { id: "gemini-1.5-pro", provider: "gemini", label: "Gemini 1.5 Pro", contextWindow: 1000000 },
];

export const DEFAULT_MODEL = "claude-opus-4-8";

export function getModelsByProvider(provider: AiProviderId): AiModel[] {
  return AI_MODELS.filter((model) => model.provider === provider);
}
