"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_KEY,
  normalizeLocale,
  type Locale,
} from "@/lib/i18n/config";
import { translate, type TranslateFn } from "@/lib/i18n/dictionaries";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: TranslateFn;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** Cookie'ye yaz (sunucu bileşenleri de okuyabilsin). */
function writeCookie(locale: Locale) {
  if (typeof document === "undefined") return;
  // 1 yıl, site geneli.
  document.cookie = `${LOCALE_KEY}=${locale};path=/;max-age=31536000;samesite=lax`;
}

/**
 * Dil sağlayıcı — TR/EN durumunu yönetir, localStorage + cookie'ye yazar,
 * <html lang>'i günceller ve dil değişince sunucu bileşenlerini yeniden
 * render etmek için router.refresh() çağırır (tüm sayfa anında değişir).
 *
 * `initialLocale` sunucudan (cookie) gelir; ilk render'da hidrasyon uyumu sağlar.
 */
export function LocaleProvider({
  initialLocale = DEFAULT_LOCALE,
  children,
}: {
  initialLocale?: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // İstemcide localStorage tercihini cookie/sunucu ile eşitle.
  useEffect(() => {
    try {
      const stored = normalizeLocale(localStorage.getItem(LOCALE_KEY));
      if (stored !== locale) {
        setLocaleState(stored);
        writeCookie(stored);
      }
    } catch {
      /* yoksay */
    }
    // yalnızca ilk yüklemede
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      try {
        localStorage.setItem(LOCALE_KEY, l);
      } catch {
        /* yoksay */
      }
      writeCookie(l);
      if (typeof document !== "undefined") document.documentElement.lang = l;
      // Sunucu bileşenleri yeni dilde yeniden render edilsin.
      router.refresh();
    },
    [router],
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === "tr" ? "en" : "tr");
  }, [locale, setLocale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, setLocale, toggleLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Dil bağlamı. Sağlayıcı dışında güvenli TR varsayılanı döndürür. */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      setLocale: () => {},
      toggleLocale: () => {},
      t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
    };
  }
  return ctx;
}

/** Kısa yol: yalnızca çeviri fonksiyonu. */
export function useT(): TranslateFn {
  return useLocale().t;
}
