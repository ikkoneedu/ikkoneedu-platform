import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/seo";
import { PROTECTED_PREFIXES, PUBLIC_ROUTES } from "@/lib/auth/route-config";

/**
 * robots.txt — arama motoru tarama kuralları.
 * Halka açık sayfalar taranabilir; korumalı paneller indekslemeye kapalıdır.
 * Public istisnalar (ör. /scholarship-exam/apply) açıkça izinlidir.
 */
export default function robots(): MetadataRoute.Robots {
  // /scholarship-exam yönetim kökü korumalı, ancak alt başvuru sayfaları halka açık.
  const publicExceptions = PUBLIC_ROUTES.filter((route) =>
    PROTECTED_PREFIXES.some((prefix) => route.startsWith(`${prefix}/`)),
  );

  return {
    rules: {
      userAgent: "*",
      allow: ["/", ...publicExceptions],
      disallow: PROTECTED_PREFIXES.map((prefix) => `${prefix}/`),
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
