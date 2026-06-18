/**
 * AI kullanım takibi (hazırlık).
 * İleride tenant bazlı kota ve maliyet izleme için Firestore'a yazılacak.
 */

import type { AiProviderId, AiTokenUsage } from "@/src/types/ai";

export interface AiUsageRecord {
  tenantId: string;
  provider: AiProviderId;
  model: string;
  usage: AiTokenUsage;
  createdAt: string;
}

export interface TenantUsageQuota {
  tenantId: string;
  dailyLimit: number | null;
  used: number;
}

/** Kotanın aşılıp aşılmadığını döner (mock kontrol). */
export function isQuotaExceeded(quota: TenantUsageQuota): boolean {
  if (quota.dailyLimit === null) return false;
  return quota.used >= quota.dailyLimit;
}
