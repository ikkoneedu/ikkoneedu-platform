import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/seo";
import { PUBLIC_SCHOOLS } from "@/lib/tenant/tenant-config";

/**
 * sitemap.xml — yalnızca halka açık, indekslenebilir sayfaları içerir.
 * Korumalı paneller (admin, teacher, ...) sitemap dışıdır.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  /** Pazarlama ve halka açık sayfalar: [yol, öncelik]. */
  const marketingRoutes: Array<[string, number]> = [
    ["/", 1],
    ["/features", 0.9],
    ["/pricing", 0.9],
    ["/demo", 0.8],
    ["/founder-school", 0.7],
    ["/mobile-app", 0.7],
    ["/scholarship-exam/apply", 0.8],
    ["/scholarship-exam/admission-card", 0.6],
    ["/scholarship-exam/results", 0.6],
  ];

  const marketing: MetadataRoute.Sitemap = marketingRoutes.map(
    ([path, priority]) => ({
      url: `${siteUrl}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority,
    }),
  );

  // Okula özel halka açık sayfalar (/school/[slug] + bursluluk alt yolları).
  const schoolRoutes: MetadataRoute.Sitemap = PUBLIC_SCHOOLS.flatMap((school) => {
    const base = `${siteUrl}/school/${school.slug}`;
    return [
      { url: base, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 },
      { url: `${base}/scholarship/apply`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 },
      { url: `${base}/scholarship/admission-card`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
      { url: `${base}/scholarship/results`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
    ];
  });

  return [...marketing, ...schoolRoutes];
}
