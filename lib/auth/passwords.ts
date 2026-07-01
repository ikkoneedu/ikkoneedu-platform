/**
 * Geçici şifre üretici (sunucu) — hesap oluşturma/geri yükleme rotalarında
 * ortak kullanılır. Kullanıcıya BİR KEZ gösterilir, Firestore'a asla yazılmaz.
 */
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGIT = "23456789";
const SYM = "!@#$%*?";

export function strongPassword(): string {
  const all = ALPHA + LOWER + DIGIT + SYM;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let out = pick(ALPHA) + pick(LOWER) + pick(DIGIT) + pick(SYM);
  for (let i = 0; i < 11; i += 1) out += pick(all);
  return out.split("").sort(() => Math.random() - 0.5).join("");
}
