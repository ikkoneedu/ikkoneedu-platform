/**
 * Sunucu tarafı i18n yardımcıları — cookie'den dili okur.
 * Sunucu bileşenleri (RSC) ve generateMetadata içinde kullanılır.
 */

import { cookies } from "next/headers";
import { LOCALE_KEY, normalizeLocale, type Locale } from "@/lib/i18n/config";
import { translate, type TranslateFn } from "@/lib/i18n/dictionaries";

/** İstek cookie'sinden geçerli dili döndürür (varsayılan TR). */
export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_KEY)?.value);
}

/** Sunucu bileşeni için çeviri fonksiyonu. */
export async function getServerT(): Promise<TranslateFn> {
  const locale = await getServerLocale();
  return (key, vars) => translate(locale, key, vars);
}
