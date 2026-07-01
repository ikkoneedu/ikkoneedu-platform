/**
 * Kiosk cihaz kimliği — YALNIZCA SUNUCU (node:crypto).
 *
 * Fiziksel USB QR okuyucuya bağlı kiosk bilgisayarının, oturum açmış bir
 * kullanıcı (idToken) OLMADAN scan endpoint'ine güvenli istek atabilmesi için
 * cihaz sırrı (secret) üretir/doğrular. Sır yalnızca cihaz aktivasyonu
 * sırasında BİR KEZ döner; Firestore'da yalnızca SHA-256 özeti saklanır
 * (personel geçici şifre deseniyle aynı mantık — bkz. `lib/services/users.ts`).
 */

import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

/** URL-safe, 32 baytlık rastgele cihaz sırrı üretir. */
export function generateDeviceSecret(): string {
  return randomBytes(32).toString("base64url");
}

/** URL-safe, 12 baytlık rastgele cihaz kimliği üretir. */
export function generateDeviceId(): string {
  return `dev_${randomBytes(12).toString("base64url")}`;
}

/** Cihaz sırrının saklanacak SHA-256 özetini üretir (ham sır asla saklanmaz). */
export function hashDeviceSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

/** Verilen sırrın saklanan özetle eşleşip eşleşmediğini sabit zamanlı karşılaştırır. */
export function verifyDeviceSecret(secret: string, storedHash: string): boolean {
  if (!secret || !storedHash) return false;
  const candidate = hashDeviceSecret(secret);
  if (candidate.length !== storedHash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}
