/**
 * Sosyal medya taslak üreticisi (SAF MANTIK, demo-safe).
 *
 * Gerçek yapay zekâ YOK: hazır şablon anahtarları + yer tutucu doldurma ile
 * cihazda anında taslak üretir. Gerçek AI üretimi sonraki fazda bağlanacaktır.
 */

export const SOCIAL_PLATFORMS = ["instagram", "facebook", "x", "linkedin"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export const SOCIAL_POST_TYPES = [
  "announcement",
  "event",
  "achievement",
  "enrollment",
] as const;
export type SocialPostType = (typeof SOCIAL_POST_TYPES)[number];

/** Her gönderi türü için kaç şablon varyantı var (social.tpl.<type>.<n>). */
export const TEMPLATE_VARIANTS = 2;

/** Platforma göre kullanılacak hashtag sayısı (kısa platformda az). */
const HASHTAG_COUNT: Record<SocialPlatform, number> = {
  instagram: 6,
  facebook: 4,
  x: 3,
  linkedin: 4,
};

/** Gönderi türüne göre sabit (lokalize edilmeyen marka/konu) etiket çekirdekleri. */
const TYPE_TAGS: Record<SocialPostType, string[]> = {
  announcement: ["duyuru", "okul", "egitim"],
  event: ["etkinlik", "okul", "egitim", "birliktelik"],
  achievement: ["basari", "gurur", "egitim", "ogrenci"],
  enrollment: ["kayit", "egitim", "gelecek", "okul"],
};

/** Bir metni hashtag-uyumlu tek kelimeye indirger (TR karakter sadeleştirme). */
export function slugifyTag(input: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

/** Okul adı + tür + konudan hashtag listesi üretir (platforma göre kırpılır). */
export function buildHashtags(
  school: string,
  postType: SocialPostType,
  platform: SocialPlatform,
  topic: string,
): string[] {
  const tags: string[] = [];
  const schoolTag = slugifyTag(school);
  if (schoolTag) tags.push(schoolTag);
  const topicTag = slugifyTag(topic);
  if (topicTag && topicTag !== schoolTag) tags.push(topicTag);
  for (const base of TYPE_TAGS[postType]) {
    if (!tags.includes(base)) tags.push(base);
  }
  return tags.slice(0, HASHTAG_COUNT[platform]).map((tg) => `#${tg}`);
}

/** {var} yer tutucularını doldurur; boş değerler ve fazladan boşluk temizlenir. */
export function fillTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template
    .replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Şablon dizinini (0..TEMPLATE_VARIANTS-1) döndürür; tekrar üretimde döner. */
export function variantIndex(seed: number): number {
  return ((seed % TEMPLATE_VARIANTS) + TEMPLATE_VARIANTS) % TEMPLATE_VARIANTS;
}
