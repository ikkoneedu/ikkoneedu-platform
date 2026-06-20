/**
 * Ders programı servisi — personel ders programı girer; öğrenci/veli görür.
 *
 * Kayıtlar tenants/{tenantId}/scheduleEntries altında. Yazma: personel
 * (Firestore kuralları). Okuma: tenant üyeleri. Sınıf filtresi istemcide.
 */

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

const schedulePath = (tenantId: string) => `tenants/${tenantId}/scheduleEntries`;

/** Hafta günleri (0 = Pazartesi). */
export const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"] as const;

export interface ScheduleInput {
  tenantId: string;
  classId?: string;
  className?: string;
  day: number;
  startTime: string;
  subject: string;
  teacherName: string;
}

export interface ScheduleEntry {
  id: string;
  classId: string;
  className: string;
  day: number;
  startTime: string;
  subject: string;
  teacherName: string;
}

export async function createScheduleEntry(input: ScheduleInput): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, schedulePath(input.tenantId)), {
    classId: input.classId ?? "",
    className: input.className ?? "",
    day: input.day,
    startTime: input.startTime,
    subject: input.subject,
    teacherName: input.teacherName,
    createdAt: serverTimestamp(),
  });
}

/** Tüm program kayıtları (gün + saat sıralı). */
export async function listSchedule(tenantId: string): Promise<ScheduleEntry[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(query(collection(db, schedulePath(tenantId))));
  const items = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      classId: String(data.classId ?? ""),
      className: String(data.className ?? ""),
      day: Number(data.day ?? 0),
      startTime: String(data.startTime ?? ""),
      subject: String(data.subject ?? ""),
      teacherName: String(data.teacherName ?? ""),
    };
  });
  items.sort((a, b) =>
    a.day !== b.day ? a.day - b.day : a.startTime.localeCompare(b.startTime),
  );
  return items;
}
