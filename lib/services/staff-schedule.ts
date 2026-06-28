/**
 * Personel mesai & izin programı — müdür/yönetim tarafından yönetilir.
 *
 * Yol: tenants/{tid}/staffSchedules/{uid}. Yönetim yazar; tenant üyesi okur
 * (kurallar zorunlu kılar). Geç-giriş tespiti bu programa göre yapılır.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantPath } from "@/lib/firebase/collections";

const COLLECTION = "staffSchedules";

export interface StaffSchedule {
  uid: string;
  /** İş başlangıç saati "HH:MM" (24s). */
  startTime: string;
  /** İş bitiş saati "HH:MM". */
  endTime: string;
  /** Çalışma günleri: 1=Pzt … 7=Paz. */
  workdays: number[];
  /** Geç sayılmadan önce tolerans (dakika). */
  graceMinutes: number;
  /** Yıllık izin başlangıç (YYYY-MM-DD) — boş olabilir. */
  leaveStart: string;
  /** Yıllık izin bitiş (YYYY-MM-DD) — boş olabilir. */
  leaveEnd: string;
}

export const DEFAULT_SCHEDULE: Omit<StaffSchedule, "uid"> = {
  startTime: "09:00",
  endTime: "17:00",
  workdays: [1, 2, 3, 4, 5],
  graceMinutes: 0,
  leaveStart: "",
  leaveEnd: "",
};

function path(tenantId: string): string {
  return tenantPath(tenantId, COLLECTION as never);
}

function mapSchedule(uid: string, data: Record<string, unknown>): StaffSchedule {
  const wd = Array.isArray(data.workdays)
    ? (data.workdays as unknown[]).map((n) => Number(n)).filter((n) => n >= 1 && n <= 7)
    : DEFAULT_SCHEDULE.workdays;
  return {
    uid,
    startTime: String(data.startTime ?? DEFAULT_SCHEDULE.startTime),
    endTime: String(data.endTime ?? DEFAULT_SCHEDULE.endTime),
    workdays: wd.length ? wd : DEFAULT_SCHEDULE.workdays,
    graceMinutes: Number(data.graceMinutes ?? 0) || 0,
    leaveStart: String(data.leaveStart ?? ""),
    leaveEnd: String(data.leaveEnd ?? ""),
  };
}

/** Tek personelin programını getirir (yoksa null). */
export async function getStaffSchedule(
  tenantId: string,
  uid: string,
): Promise<StaffSchedule | null> {
  if (!isFirebaseConfigured() || !db) return null;
  const snap = await getDoc(doc(db, `${path(tenantId)}/${uid}`));
  if (!snap.exists()) return null;
  return mapSchedule(uid, snap.data());
}

/** Tenant'taki tüm programları getirir (uid → program). */
export async function listStaffSchedules(
  tenantId: string,
): Promise<Record<string, StaffSchedule>> {
  if (!isFirebaseConfigured() || !db) return {};
  const snap = await getDocs(collection(db, path(tenantId)));
  const out: Record<string, StaffSchedule> = {};
  snap.docs.forEach((d) => {
    out[d.id] = mapSchedule(d.id, d.data());
  });
  return out;
}

/** Programı kaydeder (yönetim). name/department denormalize edilir. */
export async function saveStaffSchedule(
  tenantId: string,
  uid: string,
  data: Omit<StaffSchedule, "uid"> & { name?: string; department?: string },
  updatedBy: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await setDoc(
    doc(db, `${path(tenantId)}/${uid}`),
    {
      uid,
      startTime: data.startTime,
      endTime: data.endTime,
      workdays: data.workdays,
      graceMinutes: data.graceMinutes,
      leaveStart: data.leaveStart,
      leaveEnd: data.leaveEnd,
      name: data.name ?? "",
      department: data.department ?? "",
      updatedBy,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
