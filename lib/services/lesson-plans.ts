/**
 * Ders planı servisi — öğretmen ders planı oluşturur, sınıfı görür.
 *
 * - createLessonPlan: öğretmen/personel ders planı paylaşır (sınıf hedefli).
 * - listLessonPlans: tenant üyeleri planları görür (öğrenci/veli kendi sınıfını).
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
import { tenantLessonPlans } from "@/lib/firebase/collections";

export interface LessonPlanInput {
  tenantId: string;
  authorUid: string;
  authorName: string;
  title: string;
  subject: string;
  /** Hafta/dönem etiketi (serbest metin). */
  week: string;
  /** Hedef sınıf (boş = okul geneli). */
  classId?: string;
  className?: string;
  content: string;
}

export interface LessonPlanRecord {
  id: string;
  title: string;
  subject: string;
  week: string;
  classId: string;
  className: string;
  content: string;
  authorName: string;
}

export async function createLessonPlan(input: LessonPlanInput): Promise<string | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = await addDoc(collection(db, tenantLessonPlans(input.tenantId)), {
    title: input.title,
    subject: input.subject,
    week: input.week,
    classId: input.classId ?? "",
    className: input.className ?? "",
    content: input.content,
    authorUid: input.authorUid,
    authorName: input.authorName,
    createdBy: input.authorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Ders planını günceller (personel). Sınıf hedefi de güncellenebilir. */
export async function updateLessonPlan(
  tenantId: string,
  id: string,
  fields: {
    title: string;
    subject: string;
    week: string;
    content: string;
    classId?: string;
    className?: string;
  },
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await updateDoc(doc(db, `${tenantLessonPlans(tenantId)}/${id}`), {
    title: fields.title,
    subject: fields.subject,
    week: fields.week,
    content: fields.content,
    classId: fields.classId ?? "",
    className: fields.className ?? "",
    updatedAt: serverTimestamp(),
  });
}

/** Ders planını siler (personel — kurallar zorlar). */
export async function deleteLessonPlan(tenantId: string, id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await deleteDoc(doc(db, `${tenantLessonPlans(tenantId)}/${id}`));
}

/** Planları en yeni önce listeler. */
export async function listLessonPlans(tenantId: string): Promise<LessonPlanRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantLessonPlans(tenantId)), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: String(data.title ?? ""),
      subject: String(data.subject ?? ""),
      week: String(data.week ?? ""),
      classId: String(data.classId ?? ""),
      className: String(data.className ?? ""),
      content: String(data.content ?? ""),
      authorName: String(data.authorName ?? ""),
    };
  });
}
