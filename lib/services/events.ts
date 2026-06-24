/**
 * Etkinlik servisi — okul etkinlik takvimi.
 *
 * - createEvent: personel (öğretmen/yönetim) etkinlik oluşturur.
 * - listEvents: tenant üyeleri etkinlikleri görür.
 *
 * Yazma yetkisi Firestore kurallarıyla personele kısıtlanır (tenant catch-all).
 */

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantEvents } from "@/lib/firebase/collections";

export interface EventInput {
  tenantId: string;
  authorUid: string;
  authorName: string;
  title: string;
  description: string;
  /** ISO tarih (YYYY-MM-DD). */
  date: string;
  location: string;
}

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  authorName: string;
}

export async function createEvent(input: EventInput): Promise<string | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = await addDoc(collection(db, tenantEvents(input.tenantId)), {
    title: input.title,
    description: input.description,
    date: input.date,
    location: input.location,
    authorUid: input.authorUid,
    authorName: input.authorName,
    createdBy: input.authorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Etkinlikleri tarihe göre (yakın → uzak) listeler. */
export async function listEvents(tenantId: string): Promise<EventRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantEvents(tenantId)), orderBy("date", "asc")),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      date: String(data.date ?? ""),
      location: String(data.location ?? ""),
      authorName: String(data.authorName ?? ""),
    };
  });
}
