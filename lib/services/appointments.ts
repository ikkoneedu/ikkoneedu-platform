/**
 * Randevu servisi — `tenants/{tenantId}/appointments`.
 *
 * Aday veli tanıtım/kayıt görüşmesi randevuları. CRM pipeline'ının APPOINTMENT
 * aşamasını besler. Yetki: okuma/yazma tenant üyesi (Firestore kuralları zorlar).
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantPath, COLLECTIONS } from "@/lib/firebase/collections";

const path = (tenantId: string) =>
  tenantPath(tenantId, COLLECTIONS.APPOINTMENTS);

export type AppointmentStatus = "SCHEDULED" | "VISITED" | "CANCELLED";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "SCHEDULED",
  "VISITED",
  "CANCELLED",
];

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Planlandı",
  VISITED: "Geldi",
  CANCELLED: "İptal",
};

export function appointmentStatusLabel(s: string): string {
  return APPOINTMENT_STATUS_LABELS[s] ?? s;
}

export interface AppointmentInput {
  parentName: string;
  studentName?: string;
  phone: string;
  date: string;
  time?: string;
  note?: string;
  createdBy: string;
}

export interface AppointmentRecord {
  id: string;
  parentName: string;
  studentName: string;
  phone: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  note: string;
  createdAt: number | null;
}

/** Yeni randevu oluşturur (tenant üyesi personel). */
export async function createAppointment(
  tenantId: string,
  input: AppointmentInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, path(tenantId)), {
    parentName: input.parentName,
    studentName: input.studentName ?? "",
    phone: input.phone,
    date: input.date,
    time: input.time ?? "",
    status: "SCHEDULED",
    note: input.note ?? "",
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
  });
}

/** Tenant'taki randevuları listeler (tenant üyesi). */
export async function listAppointments(
  tenantId: string,
): Promise<AppointmentRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(query(collection(db, path(tenantId))));
  const rows = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      parentName: String(data.parentName ?? ""),
      studentName: String(data.studentName ?? ""),
      phone: String(data.phone ?? ""),
      date: String(data.date ?? ""),
      time: String(data.time ?? ""),
      status: (String(data.status ?? "SCHEDULED") as AppointmentStatus),
      note: String(data.note ?? ""),
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
  // Tarihe göre artan (yaklaşan önce); tarih yoksa sona.
  return rows.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
}

/** Randevu durumunu günceller. */
export async function setAppointmentStatus(
  tenantId: string,
  appointmentId: string,
  status: AppointmentStatus,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, `${path(tenantId)}/${appointmentId}`), {
    status,
    updatedAt: serverTimestamp(),
  });
}
