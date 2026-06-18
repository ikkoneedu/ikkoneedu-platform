/**
 * Abonelik veri erişim katmanı (mock).
 * İleride Firestore "subscriptions" + ödeme sağlayıcı webhook'larıyla beslenecek.
 */

import type { Subscription } from "@/src/types/subscription";

const subscriptions: Subscription[] = [
  { id: "sub-ikk", tenantId: "ikk", plan: "professional", status: "active", period: "yearly", monthlyPrice: 14900, startDate: "2025-09-01", endDate: "2026-08-31", userLimit: 2500 },
  { id: "sub-atael", tenantId: "atael", plan: "professional", status: "active", period: "yearly", monthlyPrice: 14900, startDate: "2025-09-15", endDate: "2026-09-14", userLimit: 2500 },
  { id: "sub-demo", tenantId: "demo", plan: "starter", status: "trial", period: "monthly", monthlyPrice: 9900, startDate: "2026-06-01", endDate: "2026-06-30", userLimit: 500 },
];

export async function getSubscriptions(): Promise<Subscription[]> {
  return subscriptions;
}

export async function getSubscriptionByTenant(
  tenantId: string,
): Promise<Subscription | undefined> {
  return subscriptions.find((s) => s.tenantId === tenantId);
}
