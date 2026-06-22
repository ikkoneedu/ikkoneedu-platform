/**
 * Okul kayıt (öğrenci/veli/öğretmen/sınıf) servisleri için ortak doğrulama.
 * Hafif kontroller — formlar ayrıca zod ile doğrular.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[0-9+()\s-]{7,20}$/;

/** Ad/soyad boş olamaz. Döner: temizlenmiş {firstName, lastName, fullName}. */
export function normalizeName(
  firstName: string,
  lastName: string,
): { firstName: string; lastName: string; fullName: string } {
  const f = firstName.trim();
  const l = lastName.trim();
  if (!f || !l) throw new Error("Ad ve soyad zorunludur.");
  return { firstName: f, lastName: l, fullName: `${f} ${l}`.trim() };
}

/** E-posta verildiyse format kontrolü (boş geçilebilir). */
export function validateEmailOptional(email?: string): string {
  const e = (email ?? "").trim();
  if (e && !EMAIL_RE.test(e)) throw new Error("Geçerli bir e-posta girin.");
  return e;
}

/** Telefon verildiyse format kontrolü (boş geçilebilir). */
export function validatePhoneOptional(phone?: string): string {
  const p = (phone ?? "").trim();
  if (p && !PHONE_RE.test(p)) throw new Error("Geçerli bir telefon girin.");
  return p;
}

export type RecordStatus = "active" | "inactive" | "archived";

export function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : null;
}
