/**
 * AI servis katmanı (hazırlık — GERÇEK API ÇAĞRISI YOK).
 *
 * Bu fonksiyon, UI'ın bağlanacağı sağlayıcıdan bağımsız sözleşmedir.
 * İleride sunucu tarafında (Server Action / API Route / Cloud Function)
 * gerçek SDK'larla doldurulacaktır:
 *
 *   if (req.provider === "anthropic") -> @anthropic-ai/sdk (Claude)
 *   if (req.provider === "openai")    -> openai
 *   if (req.provider === "gemini")    -> @google/generative-ai
 *
 * Anahtarlar yalnızca server ortam değişkenlerinden okunur. Rol bazlı yetki
 * ve tenant kotası kontrolü burada uygulanır; istek/yanıt KVKK için loglanır.
 */

import type { AiChatRequest, AiChatResponse } from "@/src/types/ai";

const MOCK_REPLY =
  "Bu bir demo yanıtıdır. AI servis katmanı henüz gerçek sağlayıcıya bağlı değildir.";

/** Şimdilik mock yanıt döndürür; ileride gerçek sağlayıcıya yönlendirilecek. */
export async function sendChat(req: AiChatRequest): Promise<AiChatResponse> {
  // TODO: provider seçimi, kota kontrolü ve gerçek API çağrısı.
  void req;
  return {
    message: { role: "assistant", content: MOCK_REPLY },
    usage: { inputTokens: 0, outputTokens: 0 },
  };
}
