/**
 * Tenant (kiracı / okul) veri modeli.
 * Çoklu okul (multi-tenant) SaaS mimarisinin temelidir.
 */

import type { Role } from "@/lib/auth/role-constants";

export type TenantStatus = "active" | "trial" | "suspended" | "passive";
export type SubscriptionPlan = "starter" | "professional" | "enterprise";

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
}

export interface Tenant {
  id: string;
  /** Alt alan adı öneki (ör. "ingilizkultur"). */
  slug: string;
  name: string;
  /** Tam alan adı (ör. "ingilizkultur.ikkoneedu.com"). */
  domain: string;
  plan: SubscriptionPlan;
  status: TenantStatus;
  branding?: TenantBranding;
  createdAt: string;
}

/** Tenant bağlamında çözülen aktif kullanıcı bilgisi (oturum). */
export interface TenantContext {
  tenant: Tenant;
  role: Role;
  userId: string;
}
