/**
 * Yetki (permission) sabitleri.
 * "kaynak:eylem" biçiminde tanımlanır.
 */

export const PERMISSIONS = {
  TENANT_READ: "tenant:read",
  TENANT_WRITE: "tenant:write",
  USER_READ: "user:read",
  USER_WRITE: "user:write",
  STUDENT_READ: "student:read",
  STUDENT_WRITE: "student:write",
  ANNOUNCEMENT_READ: "announcement:read",
  ANNOUNCEMENT_WRITE: "announcement:write",
  AI_USE: "ai:use",
  AI_CONFIGURE: "ai:configure",
  SUBSCRIPTION_READ: "subscription:read",
  SUBSCRIPTION_WRITE: "subscription:write",
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
  PLATFORM_MANAGE: "platform:manage",
  /** Finans/ekonomik veriler (tahsilat, gelir). Müdür (PRINCIPAL) GÖRMEZ. */
  FINANCE_READ: "finance:read",
  FINANCE_WRITE: "finance:write",
  /** CRM / aday veli yönetimi. */
  CRM_READ: "crm:read",
  CRM_WRITE: "crm:write",
  /** Ders programı yönetimi. */
  SCHEDULE_READ: "schedule:read",
  SCHEDULE_WRITE: "schedule:write",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
