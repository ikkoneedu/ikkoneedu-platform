/**
 * Abonelik / lisans veri modeli.
 */

import type { SubscriptionPlan } from "@/src/types/tenant";

export type SubscriptionStatus = "active" | "trial" | "past_due" | "canceled";
export type BillingPeriod = "monthly" | "yearly";

export interface Subscription {
  id: string;
  tenantId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  period: BillingPeriod;
  /** Aylık fiyat (TL). */
  monthlyPrice: number;
  startDate: string;
  endDate: string;
  /** Pakete dahil maksimum kullanıcı (null = sınırsız). */
  userLimit: number | null;
}
