/**
 * Veli ↔ öğretmen görüşme (randevu) talepleri.
 *
 * - createMeetingRequest: VELİ talep oluşturur (status "requested").
 * - listMeetingRequests: personel tüm talepleri görür.
 * - listMyMeetingRequests: veli yalnızca kendi taleplerini görür.
 * - respondMeetingRequest: personel onaylar/reddeder (+ not).
 *
 * Yetki Firestore kurallarıyla zorlanır (veli yalnız kendi 'requested' belgesini
 * oluşturur/okur; personel okur ve durumu günceller). Tenant izole.
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantMeetingRequests } from "@/lib/firebase/collections";
import { toMillis } from "@/lib/services/people-validation";

export type MeetingStatus = "requested" | "approved" | "declined";

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  requested: "Bekliyor",
  approved: "Onaylandı",
  declined: "Reddedildi",
};

export interface MeetingRequestInput {
  tenantId: string;
  parentUid: string;
  parentName: string;
  studentName: string;
  preferredDate: string;
  note: string;
}

export interface MeetingRequestRecord {
  id: string;
  parentUid: string;
  parentName: string;
  studentName: string;
  preferredDate: string;
  note: string;
  status: MeetingStatus;
  responseNote: string;
  respondedByName: string;
  createdAt: number | null;
}

export async function createMeetingRequest(input: MeetingRequestInput): Promise<string | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = await addDoc(collection(db, tenantMeetingRequests(input.tenantId)), {
    parentUid: input.parentUid,
    parentName: input.parentName,
    studentName: input.studentName,
    preferredDate: input.preferredDate,
    note: input.note,
    status: "requested",
    responseNote: "",
    respondedByName: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

function mapRow(id: string, data: Record<string, unknown>): MeetingRequestRecord {
  return {
    id,
    parentUid: String(data.parentUid ?? ""),
    parentName: String(data.parentName ?? ""),
    studentName: String(data.studentName ?? ""),
    preferredDate: String(data.preferredDate ?? ""),
    note: String(data.note ?? ""),
    status: (String(data.status ?? "requested") as MeetingStatus),
    responseNote: String(data.responseNote ?? ""),
    respondedByName: String(data.respondedByName ?? ""),
    createdAt: toMillis(data.createdAt),
  };
}

/** Personel: tenant'taki tüm görüşme talepleri (en yeni önce). */
export async function listMeetingRequests(tenantId: string): Promise<MeetingRequestRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantMeetingRequests(tenantId)), orderBy("createdAt", "desc")),
  );
  return snap.docs.map((d) => mapRow(d.id, d.data()));
}

/** Veli: yalnızca kendi talepleri. */
export async function listMyMeetingRequests(
  tenantId: string,
  parentUid: string,
): Promise<MeetingRequestRecord[]> {
  if (!isFirebaseConfigured() || !db || !parentUid) return [];
  const snap = await getDocs(
    query(collection(db, tenantMeetingRequests(tenantId)), where("parentUid", "==", parentUid)),
  );
  const rows = snap.docs.map((d) => mapRow(d.id, d.data()));
  return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Personel: talebe yanıt verir (onayla/reddet + not). */
export async function respondMeetingRequest(
  tenantId: string,
  id: string,
  status: Exclude<MeetingStatus, "requested">,
  responseNote: string,
  respondedByName: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await updateDoc(doc(db, `${tenantMeetingRequests(tenantId)}/${id}`), {
    status,
    responseNote,
    respondedByName,
    updatedAt: serverTimestamp(),
  });
}
