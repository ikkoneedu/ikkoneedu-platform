/**
 * Ders programı servisi — personel ders programı girer; öğrenci/veli görür.
 *
 * Kayıtlar tenants/{tenantId}/scheduleEntries altında. Yazma: personel
 * (Firestore kuralları). Okuma: tenant üyeleri. Sınıf filtresi istemcide.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

const schedulePath = (tenantId: string) => `tenants/${tenantId}/scheduleEntries`;
const entryDoc = (tenantId: string, id: string) =>
  `${schedulePath(tenantId)}/${id}`;

/** Hafta günleri (0 = Pazartesi). */
export const WEEKDAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"] as const;

/**
 * Ayarlardaki ders saati / süre / teneffüs bilgisinden ders saatlerini üretir.
 * Örn. start "09:00", lessonDuration 40, breakDuration 10, count 8 →
 *   ["09:00","09:50","10:40", …] (her ders + teneffüs kadar ilerler).
 */
export function buildTimeSlots(
  start: string,
  lessonMinutes: number,
  breakMinutes: number,
  count: number,
): string[] {
  const [h, m] = start.split(":").map((n) => Number(n));
  if (Number.isNaN(h) || Number.isNaN(m)) return [];
  let cursor = h * 60 + m;
  const slots: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const hh = String(Math.floor(cursor / 60) % 24).padStart(2, "0");
    const mm = String(cursor % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    cursor += lessonMinutes + breakMinutes;
  }
  return slots;
}

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

/** Bir programdaki dersi günceller (ders adı / öğretmen). */
export async function updateScheduleEntry(
  tenantId: string,
  id: string,
  patch: Partial<Pick<ScheduleInput, "subject" | "teacherName">>,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, entryDoc(tenantId, id)), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

/** Bir program kaydını siler. */
export async function deleteScheduleEntry(
  tenantId: string,
  id: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await deleteDoc(doc(db, entryDoc(tenantId, id)));
}

/** Bir sınıfın program kayıtları (istemci tarafı filtreyle de elenebilir). */
export async function listClassSchedule(
  tenantId: string,
  classId: string,
): Promise<ScheduleEntry[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, schedulePath(tenantId)),
      where("classId", "==", classId),
    ),
  );
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
