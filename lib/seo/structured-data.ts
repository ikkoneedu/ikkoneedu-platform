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

/**
 * schema.org EducationalOrganization şeması — bir okulun public sayfası için.
 * White-label okul kimliğini arama motorlarına yapılandırılmış veri olarak sunar.
 */
export function educationalOrganizationSchema(input: {
  name: string;
  slug: string;
  description?: string;
  city?: string;
  logo?: string;
}) {
  const url = `${siteUrl}/school/${input.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: input.name,
    url,
    ...(input.logo ? { logo: input.logo } : {}),
    ...(input.description ? { description: input.description } : {}),
    ...(input.city
      ? { address: { "@type": "PostalAddress", addressLocality: input.city, addressCountry: "TR" } }
      : {}),
  };
}

/** schema.org BreadcrumbList şeması (kırılım navigasyonu). */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
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
