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
