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
  EVENTS: "events",
  LUNCH_MENU: "lunchMenu",
  BUS_ROUTES: "busRoutes",
  LESSON_PLANS: "lessonPlans",
  MEETING_REQUESTS: "meetingRequests",
  ATTENDANCE_LOGS: "attendanceLogs",
  PERMISSION_GRANTS: "permissionGrants",
  STUDENT_ATTENDANCE_LOGS: "studentAttendanceLogs",
  ATTENDANCE_DEVICES: "attendanceDevices",
  ATTENDANCE_SCAN_LOGS: "attendanceScanLogs",
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

/**
 * Okul profilleri koleksiyonu (kök): `schools`.
 * Tenant aboneliğinden (tenants/{tenantId}) ayrı; okulun iletişim/kimlik
 * profilini taşır. MVP'de schoolId = tenantId (okul başına tek tenant).
 */
export const schools = (): string => "schools";

/** Tek okul profili belgesi: schools/{schoolId} */
export const schoolDoc = (schoolId: string): string => `schools/${schoolId}`;

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

/** tenants/{tenantId}/events */
export const tenantEvents = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.EVENTS);

/** tenants/{tenantId}/lunchMenu */
export const tenantLunchMenu = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.LUNCH_MENU);

/** tenants/{tenantId}/busRoutes */
export const tenantBusRoutes = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.BUS_ROUTES);

/** tenants/{tenantId}/lessonPlans */
export const tenantLessonPlans = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.LESSON_PLANS);

/** tenants/{tenantId}/meetingRequests */
export const tenantMeetingRequests = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.MEETING_REQUESTS);

/** tenants/{tenantId}/demoRequests */
export const tenantDemoRequests = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.DEMO_REQUESTS);

/** tenants/{tenantId}/attendanceLogs */
export const tenantAttendanceLogs = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.ATTENDANCE_LOGS);

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

/** tenants/{tenantId}/permissionGrants — görev bazlı geçici route yetki devri. */
export const tenantPermissionGrants = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.PERMISSION_GRANTS);

/**
 * tenants/{tenantId}/studentAttendanceLogs — veli QR'ı ile otomatik öğrenci
 * yoklaması (giriş = okulda, çıkış = velisi tarafından bekleniyor).
 */
export const tenantStudentAttendanceLogs = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.STUDENT_ATTENDANCE_LOGS);

/**
 * tenants/{tenantId}/attendanceDevices — okul girişindeki USB QR okuyucu
 * kiosk cihazları (Keyboard Wedge / HID). Bkz. `lib/attendance/device-auth.ts`.
 */
export const tenantAttendanceDevices = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.ATTENDANCE_DEVICES);

/** tenants/{tenantId}/attendanceScanLogs — kiosk tarama denetim kaydı. */
export const tenantAttendanceScanLogs = (tenantId: string): string =>
  tenantPath(tenantId, COLLECTIONS.ATTENDANCE_SCAN_LOGS);
