/**
 * Tenant yapılandırması (mock).
 * İleride Firestore "tenants" koleksiyonundan yüklenecektir.
 */

import type { Tenant } from "@/src/types/tenant";

/** Kök alan adı; tenant alt alan adları bunun üzerine kurulur. */
export const ROOT_DOMAIN = "ikkoneedu.com";

export const TENANTS: Tenant[] = [
  {
    id: "ikk",
    slug: "ingilizkultur",
    name: "İngiliz Kültür Kolejleri",
    domain: `ingilizkultur.${ROOT_DOMAIN}`,
    plan: "professional",
    status: "active",
    branding: { primaryColor: "#0A2342", accentColor: "#B2C7EF" },
    createdAt: "2025-09-01",
  },
  {
    id: "atael",
    slug: "atael",
    name: "Atael Koleji",
    domain: `atael.${ROOT_DOMAIN}`,
    plan: "professional",
    status: "active",
    createdAt: "2025-09-15",
  },
  {
    id: "demo",
    slug: "demookul",
    name: "Demo Okul",
    domain: `demookul.${ROOT_DOMAIN}`,
    plan: "starter",
    status: "trial",
    createdAt: "2026-06-01",
  },
];

/** Geliştirme/demo için varsayılan tenant. */
export const DEFAULT_TENANT_SLUG = "ingilizkultur";

export function getTenantBySlug(slug: string): Tenant | undefined {
  return TENANTS.find((tenant) => tenant.slug === slug);
}
