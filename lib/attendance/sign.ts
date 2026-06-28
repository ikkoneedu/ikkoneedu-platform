/**
 * Personel QR token imzalama — YALNIZCA SUNUCU (node:crypto).
 *
 * Bu modül `ATTENDANCE_QR_SECRET` ile HMAC-SHA256 üretir/doğrular. SADECE API
 * rotalarından import edilmelidir (istemci paketine girmemeli). Sır asla
 * istemciye gönderilmez; QR yalnızca imza (hmac) taşır.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { attendancePayload } from "@/lib/attendance/token";

/** Sunucu sırrını okur; yoksa null (rota 503 döner). */
export function getAttendanceSecret(): string | null {
  const s = process.env.ATTENDANCE_QR_SECRET;
  return s && s.length >= 16 ? s : null;
}

/** (uid|date) için HMAC-SHA256 hex imzası üretir. */
export function signAttendance(secret: string, uid: string, date: string): string {
  return createHmac("sha256", secret).update(attendancePayload(uid, date)).digest("hex");
}

/** İmzayı sabit zamanlı (timing-safe) karşılaştırır. */
export function verifyAttendanceSig(
  secret: string,
  uid: string,
  date: string,
  sig: string,
): boolean {
  const expected = signAttendance(secret, uid, date);
  if (typeof sig !== "string" || sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}
