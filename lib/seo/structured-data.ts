/**
 * JSON-LD structured data üreticileri (schema.org).
 *
 * Saf veri üretir; render için `components/seo/JsonLd.tsx` kullanılır.
 * Organization, SoftwareApplication ve FAQPage şemaları için temel yapı.
 */

import { siteUrl, SEO } from "@/lib/seo/seo";
import { productFullName, description } from "@/lib/constants";

/** schema.org Organization şeması. */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO.siteName,
    legalName: productFullName,
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description,
    sameAs: [] as string[],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      areaServed: "TR",
      availableLanguage: ["Turkish"],
    },
  };
}

/** schema.org SoftwareApplication şeması (SaaS okul yönetim sistemi). */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SEO.siteName,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Okul Yönetim Sistemi",
    operatingSystem: "Web, iOS, Android",
    description,
    url: siteUrl,
    inLanguage: "tr-TR",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "TRY",
      offerCount: 3,
    },
  };
}

interface FaqItem {
  question: string;
  answer: string;
}

/** schema.org FAQPage şeması. */
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
