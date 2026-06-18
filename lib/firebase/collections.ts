/**
 * Firestore koleksiyon adları (tek doğruluk kaynağı).
 *
 * İleride kullanılacak koleksiyon yapısı:
 *
 *   platform/config
 *   platform/globalSettings
 *   platform/auditLogs
 *
 *   tenants/{tenantId}
 *     ├─ users/{userId}
 *     ├─ students/{studentId}
 *     ├─ parents/{parentId}
 *     ├─ teachers/{teacherId}
 *     ├─ announcements/{announcementId}
 *     ├─ messages/{messageId}
 *     ├─ notifications/{notificationId}
 *     ├─ notificationLogs/{logId}
 *     ├─ notificationPreferences/{userId}
 *     ├─ appointments/{appointmentId}
 *     ├─ leads/{leadId}
 *     ├─ subscriptions/{subscriptionId}
 *     ├─ payments/{paymentId}
 *     ├─ settings/{section}
 *     ├─ auditLogs/{logId}
 *     ├─ aiUsage/{usageId}
 *     └─ devices/{deviceId}
 *
 * Multi-tenant izolasyon: her belge tenant alt koleksiyonu altında tutulur
 * ve Security Rules ile request.auth.token.tenantId == tenantId zorunlu kılınır.
 */

export const COLLECTIONS = {
  TENANTS: "tenants",
  USERS: "users",
  STUDENTS: "students",
  PARENTS: "parents",
  TEACHERS: "teachers",
  ANNOUNCEMENTS: "announcements",
  MESSAGES: "messages",
  NOTIFICATIONS: "notifications",
  NOTIFICATION_LOGS: "notificationLogs",
  NOTIFICATION_PREFERENCES: "notificationPreferences",
  APPOINTMENTS: "appointments",
  LEADS: "leads",
  SUBSCRIPTIONS: "subscriptions",
  PAYMENTS: "payments",
  SETTINGS: "settings",
  AUDIT_LOGS: "auditLogs",
  AI_USAGE: "aiUsage",
  DEVICES: "devices",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Platform geneli (global) koleksiyon yolları. */
export const PLATFORM = {
  CONFIG: "platform/config",
  GLOBAL_SETTINGS: "platform/globalSettings",
  AUDIT_LOGS: "platform/auditLogs",
} as const;

/** Tenant alt koleksiyon yolu üretir (ör. tenants/ikk/students). */
export function tenantPath(tenantId: string, collection: CollectionName): string {
  return `${COLLECTIONS.TENANTS}/${tenantId}/${collection}`;
}
