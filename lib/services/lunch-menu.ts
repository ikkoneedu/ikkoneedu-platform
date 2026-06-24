/**
 * Yemek listesi servisi — okul yemek menüsü.
 *
 * - createLunchMenu: personel/yönetim günlük menü ekler.
 * - listLunchMenu: tenant üyeleri menüyü görür.
 *
 * Yazma yetkisi Firestore kurallarıyla personele kısıtlanır (tenant catch-all).
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantLunchMenu } from "@/lib/firebase/collections";

export interface LunchMenuInput {
  tenantId: string;
  authorUid: string;
  /** ISO tarih (YYYY-MM-DD). */
  date: string;
  /** Öğünler (satır satır girilir). */
  items: string[];
}

export interface LunchMenuRecord {
  id: string;
  date: string;
  items: string[];
}

export async function createLunchMenu(input: LunchMenuInput): Promise<string | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = await addDoc(collection(db, tenantLunchMenu(input.tenantId)), {
    date: input.date,
    items: input.items,
    createdBy: input.authorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Menü kaydını günceller (personel). */
export async function updateLunchMenu(
  tenantId: string,
  id: string,
  fields: { date: string; items: string[] },
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await updateDoc(doc(db, `${tenantLunchMenu(tenantId)}/${id}`), {
    ...fields,
    updatedAt: serverTimestamp(),
  });
}

/** Menü kaydını siler (personel — kurallar zorlar). */
export async function deleteLunchMenu(tenantId: string, id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await deleteDoc(doc(db, `${tenantLunchMenu(tenantId)}/${id}`));
}

/** Menüleri tarihe göre (yeni → eski) listeler. */
export async function listLunchMenu(tenantId: string): Promise<LunchMenuRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantLunchMenu(tenantId)), orderBy("date", "desc")),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      date: String(data.date ?? ""),
      items: Array.isArray(data.items) ? (data.items as string[]) : [],
    };
  });
}
