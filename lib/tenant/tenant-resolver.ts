/**
 * Tenant çözümleyici (mock).
 *
 * İleride Next.js middleware içinde çalışacak:
 *   ingilizkultur.ikkoneedu.com -> slug "ingilizkultur"
 *   atael.ikkoneedu.com         -> slug "atael"
 * Şimdilik saf bir fonksiyon olarak host adından slug çıkarır.
 */

import {
  ROOT_DOMAIN,
  DEFAULT_TENANT_SLUG,
  getPublicSchoolBySlug,
  type PublicSchool,
} from "@/lib/tenant/tenant-config";
import type { TenantResolution } from "@/lib/tenant/tenant-types";

export function resolveTenantFromHost(host?: string | null): TenantResolution {
  if (!host) {
    return { slug: DEFAULT_TENANT_SLUG, source: "default" };
  }

  // Portu ayıkla (localhost:3000 vb.)
  const hostname = host.split(":")[0];

  // *.ikkoneedu.com -> alt alan adı
  if (hostname.endsWith(ROOT_DOMAIN)) {
    const sub = hostname.slice(0, -(ROOT_DOMAIN.length + 1));
    if (sub && sub !== "www") {
      return { slug: sub, source: "subdomain" };
    }
  }

  return { slug: DEFAULT_TENANT_SLUG, source: "default" };
}

/**
 * /school/[slug] için mock okul çözümleme.
 * İleride tenantId üzerinden Firestore'dan yüklenecek.
 */
export function resolveSchoolBySlug(slug: string): PublicSchool | undefined {
  return getPublicSchoolBySlug(slug);
}
