/**
 * Personel QR token imzalama — YALNIZCA SUNUCU (node:crypto).
 *
 * Bu modül `ATTENDANCE_QR_SECRET` ile HMAC-SHA256 üretir/doğrular. SADECE API
 * rotalarından import edilmelidir (istemci paketine girmemeli). Sır asla
 * istemciye gönderilmez; QR yalnızca imza (hmac) taşır.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import {
  attendancePayload,
  parentAttendancePayload,
  type AttendanceAction,
} from "@/lib/attendance/token";

/** Sunucu sırrını okur; yoksa null (rota 503 döner). */
export function getAttendanceSecret(): string | null {
  const s = process.env.ATTENDANCE_QR_SECRET;
  return s && s.length >= 16 ? s : null;
}

/** (uid|date|action) için HMAC-SHA256 hex imzası üretir. */
export function signAttendance(
  secret: string,
  uid: string,
  date: string,
  action: AttendanceAction,
): string {
  return createHmac("sha256", secret).update(attendancePayload(uid, date, action)).digest("hex");
}

/** İmzayı sabit zamanlı (timing-safe) karşılaştırır. */
export function verifyAttendanceSig(
  secret: string,
  uid: string,
  date: string,
  action: AttendanceAction,
  sig: string,
): boolean {
  const expected = signAttendance(secret, uid, date, action);
  if (typeof sig !== "string" || sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}

/** (parentUid|bitişTarihi) için HMAC-SHA256 hex imzası üretir. */
export function signParentAttendance(
  secret: string,
  parentUid: string,
  expiresDate: string,
): string {
  return createHmac("sha256", secret)
    .update(parentAttendancePayload(parentUid, expiresDate))
    .digest("hex");
}

/** Veli QR imzasını sabit zamanlı karşılaştırır. */
export function verifyParentAttendanceSig(
  secret: string,
  parentUid: string,
  expiresDate: string,
  sig: string,
): boolean {
  const expected = signParentAttendance(secret, parentUid, expiresDate);
  if (typeof sig !== "string" || sig.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"));
  } catch {
    return false;
  }
}
