/**
 * Yapay zeka kullanım veri modeli.
 * Tenant bazlı kota, maliyet ve token takibi için.
 */

import type { AiProviderId, AiTokenUsage } from "@/src/types/ai";

export interface AiUsage {
  id: string;
  tenantId: string;
  schoolId?: string;
  /** İsteği yapan kullanıcı kimliği. */
  userId: string;
  provider: AiProviderId;
  model: string;
  /** Kullanılan modül (ör. "ai-brain", "exam-ai"). */
  module: string;
  usage: AiTokenUsage;
  /** Tahmini maliyet (TL). */
  cost?: number;
  createdAt: string;
}
