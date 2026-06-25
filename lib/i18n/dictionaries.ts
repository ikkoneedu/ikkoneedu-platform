/**
 * TR/EN sözlükleri ve çeviri fonksiyonu.
 *
 * Anahtarlar düz (nokta ayraçlı) tutulur: "nav.dashboard", "common.save".
 * `tr` kaynaktır; `en` eksik anahtarlarda TR'ye düşer (asla ham anahtar
 * gösterilmez). Yeni metinler eklendikçe her iki sözlük de büyütülür.
 *
 * Kullanım:
 *   - İstemci: const t = useT(); t("common.save")
 *   - Sunucu: const t = await getServerT(); t("common.save")
 */

import type { Locale } from "@/lib/i18n/config";

type Dict = Record<string, string>;

const tr: Dict = {
  // Genel
  "common.save": "Kaydet",
  "common.cancel": "Vazgeç",
  "common.delete": "Sil",
  "common.edit": "Düzenle",
  "common.add": "Ekle",
  "common.send": "Gönder",
  "common.loading": "Yükleniyor…",
  "common.search": "Ara",
  "common.refresh": "Yenile",
  "common.back": "Geri",
  "common.close": "Kapat",
  "common.required": "zorunlu",
  "common.optional": "opsiyonel",
  "common.comingSoon": "Yakında",
  "common.all": "Tümü",
  "common.login": "Giriş Yap",
  "common.logout": "Çıkış Yap",
  "common.continue": "Devam Et",

  // Üst menü / navigasyon
  "nav.features": "Özellikler",
  "nav.pricing": "Fiyatlandırma",
  "nav.founderSchool": "Kurucu Okul",
  "nav.requestDemo": "Demo Talep Et",
  "nav.searchSoon": "Arama yakında",

  // Dil / tema
  "lang.switchToEnglish": "Switch to English",
  "lang.switchToTurkish": "Türkçeye geç",
  "theme.light": "Açık tema",
  "theme.dark": "Koyu tema",

  // Açılış (landing) — hero/header
  "landing.login": "Giriş Yap",
  "landing.requestDemo": "Demo Talep Et",
};

const en: Dict = {
  // General
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.add": "Add",
  "common.send": "Send",
  "common.loading": "Loading…",
  "common.search": "Search",
  "common.refresh": "Refresh",
  "common.back": "Back",
  "common.close": "Close",
  "common.required": "required",
  "common.optional": "optional",
  "common.comingSoon": "Coming soon",
  "common.all": "All",
  "common.login": "Sign in",
  "common.logout": "Sign out",
  "common.continue": "Continue",

  // Top menu / navigation
  "nav.features": "Features",
  "nav.pricing": "Pricing",
  "nav.founderSchool": "Founding School",
  "nav.requestDemo": "Request a Demo",
  "nav.searchSoon": "Search coming soon",

  // Language / theme
  "lang.switchToEnglish": "Switch to English",
  "lang.switchToTurkish": "Türkçeye geç",
  "theme.light": "Light theme",
  "theme.dark": "Dark theme",

  // Landing — hero/header
  "landing.login": "Sign in",
  "landing.requestDemo": "Request a Demo",
};

export const dictionaries: Record<Locale, Dict> = { tr, en };

/** Basit {değişken} enterpolasyonu uygular. */
function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

/**
 * Bir anahtarı verilen dile çevirir. EN'de yoksa TR'ye, o da yoksa anahtara düşer.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const value = dictionaries[locale]?.[key] ?? dictionaries.tr[key] ?? key;
  return interpolate(value, vars);
}

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string;
