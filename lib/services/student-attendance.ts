/**
 * Öğrenci giriş-çıkış (veli QR) — İSTEMCİ OKUMA servisi (canlı).
 *
 * Yazma DAİMA sunucu API'sinden yapılır (`/api/attendance/student-scan`,
 * `/api/attendance/mark-picked-up`); istemci yalnızca okur. Kayıt yolu:
 * tenants/{tid}/studentAttendanceLogs/{YYYY-MM-DD_studentId}
 *
 * İki dinleyici sunulur: yönetim/danışma (tüm okul) ve öğretmen (yalnız
 * kendi sınıfları) — Firestore kuralları bu ayrımı zorunlu kılar, sorgu da
 * buna göre daraltılmalıdır (aksi halde `list` izin hatası döner).
 */

import {
  collection,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantStudentAttendanceLogs } from "@/lib/firebase/collections";

export type PickupStatus = "in_school" | "awaiting_pickup" | "picked_up";

export interface StudentAttendanceLog {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  checkIn: number | null;
  checkOut: number | null;
  status: PickupStatus;
}

function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  if (ts && typeof ts.toMillis === "function") return ts.toMillis();
  return typeof v === "number" ? v : null;
}

function mapLog(id: string, data: Record<string, unknown>): StudentAttendanceLog {
  return {
    id,
    studentId: String(data.studentId ?? ""),
    studentName: String(data.studentName ?? ""),
    classId: String(data.classId ?? ""),
    date: String(data.date ?? ""),
    checkIn: toMillis(data.checkIn),
    checkOut: toMillis(data.checkOut),
    status:
      data.status === "awaiting_pickup"
        ? "awaiting_pickup"
        : data.status === "picked_up"
          ? "picked_up"
          : "in_school",
  };
}

/** Bugünün tarihi (Europe/Istanbul, YYYY-MM-DD). */
export function todayStr(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Bugünkü TÜM öğrenci giriş-çıkış kayıtlarını canlı dinler (yönetim/danışma —
 * Firestore kuralları `canManageRecords()`/`SUPPORT`/`SUPER_ADMIN` ister).
 */
export function watchTodayAttendanceSchoolWide(
  tenantId: string,
  onChange: (rows: StudentAttendanceLog[]) => void,
): Unsubscribe {
  if (!isFirebaseConfigured() || !db || !tenantId) {
    onChange([]);
    return () => {};
  }
  const q = query(
    collection(db, tenantStudentAttendanceLogs(tenantId)),
    where("date", "==", todayStr()),
  );
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => mapLog(d.id, d.data()))),
    () => onChange([]),
  );
}

/**
 * Bugünkü öğrenci giriş-çıkış kayıtlarını, YALNIZ verilen sınıflar için canlı
 * dinler (öğretmen — Firestore kuralları öğretmenin `classIds`'i ile eşleşen
 * `classId`'yi ister; sorgu bu yüzden `classId in [...]` ile daraltılır).
 */
export function watchTodayAttendanceForClasses(
  tenantId: string,
  classIds: string[],
  onChange: (rows: StudentAttendanceLog[]) => void,
): Unsubscribe {
  if (!isFirebaseConfigured() || !db || !tenantId || classIds.length === 0) {
    onChange([]);
    return () => {};
  }
  // Firestore 'in' en fazla 30 değer kabul eder.
  const q = query(
    collection(db, tenantStudentAttendanceLogs(tenantId)),
    where("date", "==", todayStr()),
    where("classId", "in", classIds.slice(0, 30)),
  );
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => mapLog(d.id, d.data()))),
    () => onChange([]),
  );
}
