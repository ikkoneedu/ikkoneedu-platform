/**
 * Çok dil (i18n) yapılandırması — TR/EN.
 *
 * Dil; hem sunucu (cookie) hem istemci (context + localStorage) tarafından
 * okunabilir. Varsayılan Türkçe. Yeni dil eklemek için LOCALES'e ekleyin.
 */

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";

/** Dil tercihinin tutulduğu cookie/localStorage anahtarı. */
export const LOCALE_KEY = "ikk_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
};

/** Bilinmeyen değeri güvenli bir Locale'e indirger. */
export function normalizeLocale(value: string | undefined | null): Locale {
  return value === "en" ? "en" : "tr";
}
