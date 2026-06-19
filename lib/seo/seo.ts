/**
 * Merkezi SEO yapılandırması ve metadata yardımcıları.
 *
 * Tüm sayfalar `buildMetadata()` üzerinden tutarlı title/description/keywords,
 * Open Graph, Twitter Card ve canonical URL üretir. Site adresi ortam
 * değişkeninden (`NEXT_PUBLIC_APP_URL`) okunur; tanımlı değilse üretim alan adı
 * varsayılır.
 */

import type { Metadata } from "next";
import { productName, tagline, description } from "@/lib/constants";

/** Kanonik site adresi (sondaki "/" olmadan). */
export const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://ikkoneedu.com"
).replace(/\/$/, "");

export const SEO = {
  siteName: productName,
  defaultTitle: `${productName} — ${tagline}`,
  titleTemplate: `%s — ${productName}`,
  description,
  locale: "tr_TR",
  twitterHandle: "@ikkoneedu",
} as const;

/**
 * SaaS okul yazılımı için Türkçe odaklı temel anahtar kelimeler.
 * Sayfa bazında bu listeye ek anahtar kelimeler eklenir.
 */
export const baseKeywords: string[] = [
  "okul yönetim sistemi",
  "kolej yazılımı",
  "özel okul CRM",
  "bursluluk sınavı başvuru sistemi",
  "anaokulu yönetim sistemi",
  "eğitim kurumu yazılımı",
  "okul işletim sistemi",
  "dijital kampüs",
  "veli iletişim uygulaması",
  "ikkoneedu",
];

interface BuildMetadataInput {
  /** Sayfa başlığı (titleTemplate ile birleşir). Boşsa varsayılan başlık. */
  title?: string;
  description?: string;
  /** Sayfaya özel ek anahtar kelimeler. */
  keywords?: string[];
  /** Kök göreli yol (ör. "/pricing"). Canonical ve OG url için. */
  path?: string;
  /** Arama motoru indekslemesi kapatılsın mı (ör. korumalı paneller). */
  noindex?: boolean;
}

/**
 * Sayfa metadata'sı üretir. `path` verilirse canonical + OG url ayarlanır.
 */
export function buildMetadata({
  title,
  description: pageDescription,
  keywords = [],
  path = "/",
  noindex = false,
}: BuildMetadataInput = {}): Metadata {
  const resolvedTitle = title ? `${title} — ${productName}` : SEO.defaultTitle;
  const resolvedDescription = pageDescription ?? SEO.description;
  const canonical = path.replace(/\/$/, "") || "/";
  const url = `${siteUrl}${canonical === "/" ? "" : canonical}`;

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    keywords: [...new Set([...baseKeywords, ...keywords])],
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      siteName: SEO.siteName,
      locale: SEO.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDescription,
      site: SEO.twitterHandle,
      creator: SEO.twitterHandle,
    },
  };
}
