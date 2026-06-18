/**
 * Yapay zeka veri modeli.
 * OpenAI, Anthropic Claude ve Google Gemini için sağlayıcıdan bağımsız sözleşme.
 */

export type AiProviderId = "openai" | "anthropic" | "gemini";
export type AiProviderStatus = "ready" | "test" | "disabled";
export type AiMessageRole = "system" | "user" | "assistant";

export interface AiModel {
  id: string;
  provider: AiProviderId;
  label: string;
  /** Bağlam penceresi (token). */
  contextWindow?: number;
}

export interface AiMessage {
  role: AiMessageRole;
  content: string;
}

export interface AiChatRequest {
  provider: AiProviderId;
  model: string;
  tenantId: string;
  /** Rol bazlı yetki için çağıran rol. */
  role: string;
  messages: AiMessage[];
}

export interface AiChatResponse {
  message: AiMessage;
  usage?: AiTokenUsage;
}

export interface AiTokenUsage {
  inputTokens: number;
  outputTokens: number;
}
