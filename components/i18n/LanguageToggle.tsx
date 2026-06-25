"use client";

import { Languages } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";

/**
 * Dil anahtarı — TR/EN arası geçiş. ThemeToggle'ın yanında, her yerde
 * (Topbar, açılış navı, okul kabukları) kullanılır. Aktif dili rozet olarak
 * gösterir; tıklayınca diğerine geçer ve tüm sayfa anında yeni dile döner.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, toggleLocale } = useLocale();
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={locale === "tr" ? "Switch to English" : "Türkçeye geç"}
      title={locale === "tr" ? "English" : "Türkçe"}
      className={`flex h-9 items-center gap-1.5 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 text-xs font-semibold text-muted transition-colors hover:text-content ${className}`}
    >
      <Languages size={15} aria-hidden="true" />
      <span className="uppercase">{locale === "tr" ? "EN" : "TR"}</span>
    </button>
  );
}
