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
  COUNSELING_SESSIONS: "counselingSessions",
  REPORT_CARDS: "reportCards",
  DEMO_REQUESTS: "demoRequests",
  SCHOLARSHIP_EXAMS: "scholarshipExams",
  SCHOLARSHIP_APPLICATIONS: "scholarshipApplications",
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

/* -------------------------------------------------------------------------- */
/*  Koleksiyon yolu yardımcıları (Firestore collection/doc path üretir)       */
/*  Kullanım: collection(db, tenantLeads(tenantId))                           */
/* -------------------------------------------------------------------------- */

/**
 * Kök kullanıcı profili koleksiyonu: `users`.
 * MVP'de ilk girişte tenantId bilinmediği için kullanıcı profili kök
 * `users/{uid}` belgesinde tutulur (tenantId/schoolId bu belgeden okunur).
 */
export const usersRoot = (): string => COLLECTIONS.USERS;

/** Kök kullanıcı profil belgesi: `users/{uid}` */
export const userProfileDoc = (uid: string): string =>
  `${COLLECTIONS.USERS}/${uid}`;

/** Platform yapılandırma belgesi: platform/config */
export const platformConfig = (): string => PLATFORM.CONFIG;

/** Tüm tenant'lar: tenants */
export const tenants = (): string => COLLECTIONS.TENANTS;

/** Tek tenant belgesi: tenants/{tenantId} */
export const tenantDoc = (tenantId: string): string =>
  `${COLLECTIONS.TENANTS}/${tenantId}`;

/** tenants/{tenantId}/users */
export const tenantUsers = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.USERS);

/** tenants/{tenantId}/students */
export const tenantStudents = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.STUDENTS);

/** tenants/{tenantId}/teachers */
export const tenantTeachers = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.TEACHERS);

/** tenants/{tenantId}/parents */
export const tenantParents = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.PARENTS);

/** tenants/{tenantId}/announcements */
export const tenantAnnouncements = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.ANNOUNCEMENTS);

/** tenants/{tenantId}/messages */
export const tenantMessages = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.MESSAGES);

/** tenants/{tenantId}/notifications */
export const tenantNotifications = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.NOTIFICATIONS);

/** tenants/{tenantId}/leads */
export const tenantLeads = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.LEADS);

/** tenants/{tenantId}/demoRequests */
export const tenantDemoRequests = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.DEMO_REQUESTS);

/** tenants/{tenantId}/scholarshipExams */
export const tenantScholarshipExams = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.SCHOLARSHIP_EXAMS);

/** tenants/{tenantId}/scholarshipApplications */
export const tenantScholarshipApplications = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.SCHOLARSHIP_APPLICATIONS);

/** tenants/{tenantId}/settings */
export const tenantSettings = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.SETTINGS);

/** tenants/{tenantId}/auditLogs */
export const tenantAuditLogs = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.AUDIT_LOGS);
