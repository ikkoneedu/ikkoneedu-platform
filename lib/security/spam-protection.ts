/**
 * Hafif, ücretsiz spam koruması yardımcıları (client tarafı).
 *
 * - Honeypot: gizli alan; bot doldurursa istek reddedilir.
 * - Submit cooldown: aynı formun çok hızlı tekrar gönderilmesini engeller.
 * - Basit rate-limit: belirli pencere içinde maksimum gönderim sayısı.
 *
 * NOT: Bu önlemler caydırıcıdır; sunucu tarafı doğrulama / reCAPTCHA ileride
 * eklenecektir (bu sürümde kapsam dışı).
 */

/** Honeypot alan adı (formlarda gizli input olarak kullanılır). */
export const HONEYPOT_FIELD = "company";

/** Honeypot dolu mu? Doluysa bot kabul edilir. */
export function isHoneypotTriggered(value: FormDataEntryValue | null): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

/** Cooldown süresi dolmuş mu? (varsayılan 4 sn) */
export function isCooldownPassed(lastSubmitAt: number | null, cooldownMs = 4000): boolean {
  if (lastSubmitAt === null) return true;
  return Date.now() - lastSubmitAt >= cooldownMs;
}

interface RateLimitState {
  count: number;
  windowStart: number;
}

/**
 * Bellek içi (oturum boyu) basit rate-limit.
 * Aynı anahtar için `windowMs` içinde en fazla `max` gönderime izin verir.
 */
const rateLimitStore = new Map<string, RateLimitState>();

export function checkRateLimit(
  key: string,
  max = 5,
  windowMs = 60_000,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  if (!state || now - state.windowStart > windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: max - 1 };
  }

  if (state.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  state.count += 1;
  return { allowed: true, remaining: max - state.count };
}
