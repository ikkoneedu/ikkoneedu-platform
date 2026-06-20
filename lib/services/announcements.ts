/**
 * Duyuru servisi — okul/öğretmen → veli/öğrenci iletişimi.
 *
 * - createAnnouncement: personel (öğretmen/müdür/yönetici) duyuru oluşturur.
 * - listAnnouncements: tenant'taki son duyurular (tüm tenant üyeleri okur).
 *
 * Yazma yetkisi Firestore kurallarıyla personele kısıtlanır.
 */

import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantAnnouncements } from "@/lib/firebase/collections";

export interface AnnouncementInput {
  tenantId: string;
  authorUid: string;
  authorName: string;
  title: string;
  body: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: Date | null;
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, tenantAnnouncements(input.tenantId)), {
    title: input.title,
    body: input.body,
    authorUid: input.authorUid,
    authorName: input.authorName,
    createdAt: serverTimestamp(),
  });
}

/** Tenant'taki son duyuruları (yeni → eski) döner. */
export async function listAnnouncements(
  tenantId: string,
  max = 20,
): Promise<Announcement[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, tenantAnnouncements(tenantId)),
      orderBy("createdAt", "desc"),
      limit(max),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toDate?: () => Date } | null | undefined;
    return {
      id: d.id,
      title: String(data.title ?? ""),
      body: String(data.body ?? ""),
      authorName: String(data.authorName ?? ""),
      createdAt: ts?.toDate ? ts.toDate() : null,
    };
  });
}
