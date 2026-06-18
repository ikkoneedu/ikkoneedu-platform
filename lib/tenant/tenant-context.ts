/**
 * Tenant bağlamı (mock).
 *
 * İleride istek bazlı (server) veya React Context (client) ile sağlanacak.
 * Şimdilik varsayılan tenant'ı döndüren saf yardımcılar içerir.
 */

import {
  getTenantBySlug,
  DEFAULT_TENANT_SLUG,
  TENANTS,
} from "@/lib/tenant/tenant-config";
import type { Tenant } from "@/src/types/tenant";

/** Aktif (varsayılan) tenant'ı döndürür. */
export function getCurrentTenant(): Tenant {
  return getTenantBySlug(DEFAULT_TENANT_SLUG) ?? TENANTS[0];
}

/** Slug ile tenant'ı çözer; bulunamazsa varsayılana düşer. */
export function resolveTenant(slug: string): Tenant {
  return getTenantBySlug(slug) ?? getCurrentTenant();
}
