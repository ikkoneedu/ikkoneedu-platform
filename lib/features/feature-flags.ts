/**
 * Özellik bayrakları (feature flags).
 * Modüllerin kademeli olarak açılması için merkezi kontrol.
 * İleride tenant bazlı (Firestore) veya ortam değişkeni ile yönetilebilir.
 */

export const FEATURE_FLAGS = {
  AI_BRAIN: true,
  AI_EXAM: true,
  AI_SCHEDULER: true,
  MULTI_TENANT: false,
  MOBILE_APP: false,
  ANALYTICS: true,
  MESSAGING: false,
  PAYMENTS: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/** Belirtilen özelliğin aktif olup olmadığını döner. */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
