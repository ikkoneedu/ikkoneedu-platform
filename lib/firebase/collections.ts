/**
 * Firestore koleksiyon adları (tek doğruluk kaynağı).
 *
 * İleride kullanılacak koleksiyon yapısı:
 *
 *   tenants/{tenantId}
 *     ├─ users/{userId}
 *     ├─ students/{studentId}
 *     ├─ teachers/{teacherId}
 *     ├─ parents/{parentId}
 *     ├─ announcements/{announcementId}
 *     ├─ notifications/{notificationId}
 *     ├─ subscriptions/{subscriptionId}
 *     ├─ settings/{section}
 *     └─ auditLogs/{logId}
 *
 *   platform/config            (global ayarlar — yalnızca super admin)
 *
 * Multi-tenant izolasyon: her belge tenant alt koleksiyonu altında tutulur
 * ve Security Rules ile request.auth.token.tenantId == tenantId zorunlu kılınır.
 */

export const COLLECTIONS = {
  TENANTS: "tenants",
  USERS: "users",
  STUDENTS: "students",
  TEACHERS: "teachers",
  PARENTS: "parents",
  ANNOUNCEMENTS: "announcements",
  NOTIFICATIONS: "notifications",
  SUBSCRIPTIONS: "subscriptions",
  SETTINGS: "settings",
  AUDIT_LOGS: "auditLogs",
} as const;

export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];

/** Tenant alt koleksiyon yolu üretir (ör. tenants/ikk/students). */
export function tenantPath(tenantId: string, collection: CollectionName): string {
  return `${COLLECTIONS.TENANTS}/${tenantId}/${collection}`;
}
