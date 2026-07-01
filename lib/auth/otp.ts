/**
 * E-posta giriş doğrulama kodu (OTP) — YALNIZCA SUNUCU (node:crypto).
 *
 * `lib/attendance/device-auth.ts` ile aynı desen: ham kod asla saklanmaz,
 * yalnızca SHA-256 özeti Firestore'a (`otpCodes/{uid}`) yazılır.
 */

import { randomInt, createHash, timingSafeEqual } from "node:crypto";

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 5 * 60 * 1000; // 5 dakika
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 saniye
export const OTP_MAX_ATTEMPTS = 5;

/** 6 haneli rastgele sayısal kod üretir (kriptografik RNG). */
export function generateOtpCode(): string {
  return String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
}

/** Kodun saklanacak SHA-256 özetini üretir (ham kod asla saklanmaz). */
export function hashOtpCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** Kodun saklanan özetle eşleşip eşleşmediğini sabit zamanlı karşılaştırır. */
export function verifyOtpCode(code: string, storedHash: string): boolean {
  if (!code || !storedHash) return false;
  const candidate = hashOtpCode(code);
  if (candidate.length !== storedHash.length) return false;
  try {
    return timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(storedHash, "hex"));
  } catch {
    return false;
  }
}
