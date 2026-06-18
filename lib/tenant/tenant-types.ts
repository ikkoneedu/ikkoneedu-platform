/**
 * Tenant mimarisi tipleri.
 * Çekirdek Tenant tipini yeniden dışa aktarır ve çözümleme tiplerini ekler.
 */

export type {
  Tenant,
  TenantBranding,
  TenantStatus,
  TenantContext,
  SubscriptionPlan,
} from "@/src/types/tenant";

/** Host adından tenant çözümleme sonucu. */
export interface TenantResolution {
  slug: string;
  /** Çözümleme kaynağı. */
  source: "subdomain" | "path" | "default";
}
