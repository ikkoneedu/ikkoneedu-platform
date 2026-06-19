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

/* -------------------------------------------------------------------------- */
/*  Halka açık okul sayfaları (/school/[slug]) — mock                         */
/* -------------------------------------------------------------------------- */

export interface PublicSchool {
  /** URL slug'ı (ör. "ingiliz-kultur"). */
  slug: string;
  tenantId: string;
  schoolName: string;
  campus: string;
  brandColor: string;
  intro: string;
  userCount: string;
}

export const PUBLIC_SCHOOLS: PublicSchool[] = [
  {
    slug: "ingiliz-kultur",
    tenantId: "tenant_ikk",
    schoolName: "İngiliz Kültür Kolejleri",
    campus: "Batıkent · Merkez · Çayyolu",
    brandColor: "#D62839",
    intro:
      "Çift dilli eğitim modeli ve yapay zeka destekli dijital kampüs deneyimiyle öğrencilerini geleceğe hazırlar.",
    userCount: "1.248",
  },
  {
    slug: "atael",
    tenantId: "tenant_atael",
    schoolName: "Atael Koleji",
    campus: "Ankara",
    brandColor: "#0A2342",
    intro:
      "Güçlü akademik kadrosu ve öğrenci merkezli yaklaşımıyla nitelikli bir eğitim sunar.",
    userCount: "842",
  },
  {
    slug: "demo-okul",
    tenantId: "tenant_demo",
    schoolName: "Demo Okul",
    campus: "İzmir",
    brandColor: "#B2C7EF",
    intro:
      "ikkoneedu platformunun tüm özelliklerini deneyimleyebileceğiniz örnek demo kurumu.",
    userCount: "120",
  },
];

export function getPublicSchoolBySlug(slug: string): PublicSchool | undefined {
  return PUBLIC_SCHOOLS.find((school) => school.slug === slug);
}
