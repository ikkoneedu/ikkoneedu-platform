/**
 * Telefon numarası yardımcıları — Firebase Phone Auth E.164 formatı bekler
 * (ör. +905321234567). Türkiye numaralarını yaygın yazımlardan normalleştirir.
 */

/**
 * Serbest girilmiş bir numarayı E.164'e çevirir; geçersizse `null` döner.
 *
 * Kabul edilen girişler (TR odaklı):
 *  - "+905321234567"          → +905321234567 (zaten E.164)
 *  - "0532 123 45 67"         → +905321234567
 *  - "90 532 123 45 67"       → +905321234567
 *  - "532 123 45 67"          → +905321234567 (cep, 5 ile başlar)
 * Uluslararası "+..." numaralar da (8–15 hane) olduğu gibi kabul edilir.
 */
export function toE164Turkey(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();

  // Zaten + ile başlıyorsa uluslararası kabul et — yalnız rakamları koru.
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1).replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  // 0XXXXXXXXXX (11 hane) → +90XXXXXXXXXX
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+90${digits.slice(1)}`;
  }
  // 90XXXXXXXXXX (12 hane) → +90XXXXXXXXXX
  if (digits.length === 12 && digits.startsWith("90")) {
    return `+${digits}`;
  }
  // 5XXXXXXXXX (10 hane, önalanı düşmüş cep) → +90...
  if (digits.length === 10 && digits.startsWith("5")) {
    return `+90${digits}`;
  }
  return null;
}
