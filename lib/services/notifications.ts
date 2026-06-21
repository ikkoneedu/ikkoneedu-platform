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
  getDocs,
  query,
  serverTimestamp,
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
