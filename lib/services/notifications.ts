/**
 * Bildirim servisi — `tenants/{tenantId}/notifications` (FCM YOK).
 *
 * Yalnızca Firestore kaydı oluşturur ve panelde gösterir. Gerçek push gönderimi
 * (FCM) bu sürümde yapılmaz. Yetki: okuma tenant üyesi, yazma okul personeli
 * (Firestore kuralları zorlar). Tenant izole.
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantNotifications } from "@/lib/firebase/collections";
import { listStudents } from "@/lib/services/students";
import { listParents } from "@/lib/services/parents";

export interface NotificationInput {
  title: string;
  body: string;
  audience: string;
  channel?: string;
  createdBy: string;
  createdByName?: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  audience: string;
  channel: string;
  createdByName: string;
  createdAt: number | null;
}

/** Bildirim kaydı oluşturur (personel). Push gönderimi yapılmaz. */
export async function createNotification(
  tenantId: string,
  input: NotificationInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, tenantNotifications(tenantId)), {
    title: input.title,
    body: input.body,
    audience: input.audience,
    channel: input.channel ?? "in_app",
    createdBy: input.createdBy,
    createdByName: input.createdByName ?? "",
    createdAt: serverTimestamp(),
  });
}

/** Tenant'taki bildirimleri (en yeni) listeler (tenant üyesi). */
export async function listNotifications(
  tenantId: string,
): Promise<NotificationRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(query(collection(db, tenantNotifications(tenantId))));
  const rows = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      title: String(data.title ?? ""),
      body: String(data.body ?? ""),
      audience: String(data.audience ?? ""),
      channel: String(data.channel ?? "in_app"),
      createdByName: String(data.createdByName ?? ""),
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
  return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/* -------------------------------------------------------------------------- */
/*  Kişiye özel bildirimler (userId bazlı) — mesaj/duyuru fan-out için          */
/* -------------------------------------------------------------------------- */

export const NOTIFICATION_TYPES = [
  "message",
  "announcement",
  "attendance",
  "system",
  "scholarship",
  "crm",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface UserNotificationInput {
  userId: string;
  schoolId?: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
}

export interface UserNotificationRecord {
  id: string;
  userId: string;
  schoolId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  link: string;
  createdAt: number | null;
}

/**
 * Belirli bir kullanıcıya uygulama içi bildirim oluşturur (FCM yok).
 * Mesaj gönderimi / duyuru yayını sonrası fan-out için kullanılır.
 */
export async function createUserNotification(
  tenantId: string,
  input: UserNotificationInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await addDoc(collection(db, tenantNotifications(tenantId)), {
    userId: input.userId,
    schoolId: input.schoolId ?? tenantId,
    title: input.title,
    body: input.body,
    type: input.type,
    read: false,
    link: input.link ?? "",
    createdAt: serverTimestamp(),
  });
}

/**
 * Bir sınıfın üyelerine (öğrenci + bağlı veli) kişiye özel bildirim düşürür.
 * Duyuru/ödev sınıf hedefli paylaşıldığında çağrılır. Best-effort; hesabı
 * (userId) olmayan kayıtlar atlanır. classId boşsa (okul geneli) hiçbir şey
 * yapmaz — okul geneli için tenant bildirim akışı yeterlidir (yüzlerce yazımı
 * önler). Tenant izole; personel yazımına kurallar izin verir.
 */
export async function notifyClassMembers(
  tenantId: string,
  classId: string,
  input: { title: string; body: string; type: NotificationType; link?: string },
): Promise<number> {
  if (!isFirebaseConfigured() || !db || !tenantId || !classId) return 0;
  const [students, parents] = await Promise.all([
    listStudents(tenantId),
    listParents(tenantId),
  ]);
  const classStudents = students.filter((s) => s.classId === classId);
  const classStudentIds = new Set(classStudents.map((s) => s.id));
  const classParents = parents.filter((p) =>
    (p.linkedStudentIds ?? []).some((sid) => classStudentIds.has(sid)),
  );

  // Hesabı olan benzersiz alıcılar (öğrenci + veli userId'leri).
  const recipients = new Set<string>();
  for (const s of classStudents) if (s.userId) recipients.add(s.userId);
  for (const p of classParents) if (p.userId) recipients.add(p.userId);

  await Promise.all(
    [...recipients].map((userId) =>
      createUserNotification(tenantId, {
        userId,
        title: input.title,
        body: input.body,
        type: input.type,
        link: input.link,
      }),
    ),
  );
  return recipients.size;
}

/**
 * Bir öğrencinin bağlı veli(ler)ine kişiye özel bildirim düşürür (yoklama/uyarı).
 * `studentUid` öğrencinin giriş hesabıdır; öğrenci kaydı (record) bulunur, o kayda
 * bağlı veliler `linkedStudentIds` üzerinden hesabı olanlara bildirilir. Best-effort.
 */
export async function notifyStudentParents(
  tenantId: string,
  studentUid: string,
  input: { title: string; body: string; type: NotificationType; link?: string },
): Promise<number> {
  if (!isFirebaseConfigured() || !db || !tenantId || !studentUid) return 0;
  const [students, parents] = await Promise.all([
    listStudents(tenantId),
    listParents(tenantId),
  ]);
  const student = students.find((s) => s.userId === studentUid);
  if (!student) return 0;
  const recipients = new Set<string>();
  for (const p of parents) {
    if ((p.linkedStudentIds ?? []).includes(student.id) && p.userId) {
      recipients.add(p.userId);
    }
  }
  await Promise.all(
    [...recipients].map((userId) =>
      createUserNotification(tenantId, {
        userId,
        title: input.title,
        body: input.body,
        type: input.type,
        link: input.link,
      }),
    ),
  );
  return recipients.size;
}

/** Geçerli kullanıcının kişisel bildirimleri (userId == uid), en yeni önce. */
export async function listNotificationsForCurrentUser(
  tenantId: string,
  uid: string,
): Promise<UserNotificationRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId || !uid) return [];
  const snap = await getDocs(
    query(collection(db, tenantNotifications(tenantId)), where("userId", "==", uid)),
  );
  const rows = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      userId: String(data.userId ?? ""),
      schoolId: String(data.schoolId ?? ""),
      title: String(data.title ?? ""),
      body: String(data.body ?? ""),
      type: String(data.type ?? "system"),
      read: Boolean(data.read),
      link: String(data.link ?? ""),
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
  return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Bir bildirimi okundu işaretler (yalnızca sahibi — kurallar zorlar). */
export async function markNotificationRead(
  tenantId: string,
  notificationId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await updateDoc(
    doc(db, `${tenantNotifications(tenantId)}/${notificationId}`),
    { read: true },
  );
}
