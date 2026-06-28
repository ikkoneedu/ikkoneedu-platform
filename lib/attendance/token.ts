/**
 * Personel giriş-çıkış QR token biçimi + coğrafi mesafe yardımcıları (SAF).
 *
 * HMAC imzalama burada DEĞİL: sır (ATTENDANCE_QR_SECRET) yalnızca sunucu API
 * rotalarında kullanılır (node:crypto). Bu modül istemci+sunucu ortak biçim ve
 * geometri sağlar; istemci paketine sır/crypto sızdırmaz.
 *
 * QR içeriği: `IKK-ATT|<uid>|<YYYY-MM-DD>|<hmacHex>`
 *  - Tarih GÜNLÜK döner: dünkü ekran görüntüsü sunucuda tarih != bugün olduğu
 *    için reddedilir.
 *  - İmza sunucu sırrıyla üretilir; içerik kurcalanırsa doğrulama başarısız olur.
 */

export const ATTENDANCE_QR_PREFIX = "IKK-ATT";

/** Personelin seçtiği aksiyon: giriş veya çıkış. */
export type AttendanceAction = "in" | "out";

/** İmzalanan ham yük (uid + tarih + aksiyon). HMAC bu string üzerinden. */
export function attendancePayload(uid: string, date: string, action: AttendanceAction): string {
  return `${uid}|${date}|${action}`;
}

/** Tam QR metnini oluşturur (aksiyon dahil). */
export function buildAttendanceQR(
  uid: string,
  date: string,
  action: AttendanceAction,
  sig: string,
): string {
  return `${ATTENDANCE_QR_PREFIX}|${uid}|${date}|${action}|${sig}`;
}

export interface ParsedAttendanceQR {
  uid: string;
  date: string;
  action: AttendanceAction;
  sig: string;
}

/** QR metnini ayrıştırır; biçim hatalıysa null. */
export function parseAttendanceQR(qr: string): ParsedAttendanceQR | null {
  if (typeof qr !== "string") return null;
  const parts = qr.trim().split("|");
  if (parts.length !== 5) return null;
  const [prefix, uid, date, action, sig] = parts;
  if (prefix !== ATTENDANCE_QR_PREFIX) return null;
  if (!uid || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !sig) return null;
  if (action !== "in" && action !== "out") return null;
  return { uid, date, action, sig };
}

/** Verilen zamanın belirtilen saat diliminde YYYY-MM-DD karşılığı. */
export function dateStr(ms: number, timeZone = "Europe/Istanbul"): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
  // en-CA → "YYYY-MM-DD"
  return parts;
}

/** İki koordinat arası mesafe (metre) — Haversine. */
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Dünya yarıçapı (m)
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}
