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
  CLASSES: "classes",
  ACCESS_CODES: "accessCodes",
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

/**
 * Platform denetim kaydı koleksiyonu (kök): `platformAuditLogs`.
 * Kök tutulur çünkü `platform/**` okuması tüm aktif kullanıcılara açıktır;
 * denetim kayıtları yalnızca SUPER_ADMIN'e görünür olmalıdır (kurallarda kısıtlı).
 */
export const platformAuditLogs = (): string => "platformAuditLogs";

/**
 * Platform düzeyi SaaS demo talepleri koleksiyonu (kök): `platformDemoRequests`.
 * Bir okula (tenant) ait değildir; bu yüzden `tenants/...` altında DEĞİL kökte
 * tutulur. Oluşturma halka açıktır (doğrulamalı), okuma yalnızca SUPER_ADMIN.
 */
export const platformDemoRequests = (): string => "platformDemoRequests";

/**
 * Platform düzeyi SaaS satış lead'leri koleksiyonu (kök): `platformLeads`.
 * Okul henüz müşteri/tenant olmadığından ilk satış lead'i bir tenant altına
 * ZORLANMAZ; kökte tutulur. Yalnızca SUPER_ADMIN okur/yazar.
 */
export const platformLeads = (): string => "platformLeads";

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

/** tenants/{tenantId}/classes */
export const tenantClasses = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.CLASSES);

/** tenants/{tenantId}/classes/{classId} */
export const classDoc = (tenantId: string, classId: string): string =>
  `${tenantClasses(tenantId)}/${classId}`;

/** tenants/{tenantId}/accessCodes (kod → hesap eşlemesi referansı) */
export const tenantAccessCodes = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.ACCESS_CODES);

/** tenants/{tenantId}/accessCodes/{code} */
export const accessCodeDoc = (tenantId: string, code: string): string =>
  `${tenantAccessCodes(tenantId)}/${code}`;
