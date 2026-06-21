/**
 * Rehberlik (PDR) servisi — `tenants/{tenantId}/counselingSessions`.
 *
 * Rehber öğretmen/yönetim öğrenci görüşme notu ekler ve listeler. Yetki: okuma
 * tenant üyesi, yazma okul personeli (Firestore kuralları zorlar). Tenant izole.
 */

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantPath, COLLECTIONS } from "@/lib/firebase/collections";

const path = (tenantId: string) =>
  tenantPath(tenantId, COLLECTIONS.COUNSELING_SESSIONS);

/** Görüşme etiketleri. */
export const COUNSELING_TAGS = [
  "Akademik",
  "Davranış",
  "Aile",
  "Kariyer",
  "Sınav Kaygısı",
  "Diğer",
] as const;

export interface CounselingSessionInput {
  studentName: string;
  tag: string;
  note: string;
  counselorUid: string;
  counselorName?: string;
}

export interface CounselingSessionRecord {
  id: string;
  studentName: string;
  tag: string;
  note: string;
  counselorName: string;
  createdAt: number | null;
}

/** Yeni görüşme notu ekler (personel). */
export async function createCounselingSession(
  tenantId: string,
  input: CounselingSessionInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, path(tenantId)), {
    studentName: input.studentName,
    tag: input.tag,
    note: input.note,
    counselorUid: input.counselorUid,
    counselorName: input.counselorName ?? "",
    createdAt: serverTimestamp(),
  });
}

/** Tenant'taki görüşme notlarını (en yeni) listeler (tenant üyesi). */
export async function listCounselingSessions(
  tenantId: string,
): Promise<CounselingSessionRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(query(collection(db, path(tenantId))));
  const rows = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      studentName: String(data.studentName ?? ""),
      tag: String(data.tag ?? ""),
      note: String(data.note ?? ""),
      counselorName: String(data.counselorName ?? ""),
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
  return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}
