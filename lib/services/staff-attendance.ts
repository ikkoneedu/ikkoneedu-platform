/**
 * Personel giriş-çıkış kayıtları — İSTEMCİ OKUMA servisi.
 *
 * Yazma DAİMA sunucu API'sinden (firebase-admin) yapılır; istemci yalnızca
 * yönetim raporu için okur (Firestore kuralları okumayı yönetime kısıtlar).
 * Kayıt yolu: tenants/{tid}/attendanceLogs/{YYYY-MM-DD_uid}
 */

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantAttendanceLogs } from "@/lib/firebase/collections";

export interface StaffAttendanceLog {
  id: string;
  uid: string;
  name: string;
  department: string;
  /** YYYY-MM-DD (Europe/Istanbul). */
  date: string;
  checkIn: number | null;
  checkOut: number | null;
  /** Geç giriş mi (sunucu mesai programına göre işaretler). */
  late: boolean;
  /** Kaç dakika geç. */
  lateMinutes: number;
}

function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  if (ts && typeof ts.toMillis === "function") return ts.toMillis();
  return typeof v === "number" ? v : null;
}

/**
 * Belirli tarih aralığındaki giriş-çıkış kayıtlarını getirir (dahil).
 * Tarihler YYYY-MM-DD biçiminde.
 */
export async function listStaffAttendance(
  tenantId: string,
  fromDate: string,
  toDate: string,
): Promise<StaffAttendanceLog[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const col = collection(db, tenantAttendanceLogs(tenantId));
  let snap;
  try {
    snap = await getDocs(
      query(
        col,
        where("date", ">=", fromDate),
        where("date", "<=", toDate),
        orderBy("date", "desc"),
      ),
    );
  } catch {
    // Bileşik indeks yoksa tümünü çek, istemcide filtrele.
    snap = await getDocs(col);
  }
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: String(data.uid ?? ""),
        name: String(data.name ?? ""),
        department: String(data.department ?? ""),
        date: String(data.date ?? ""),
        checkIn: toMillis(data.checkIn),
        checkOut: toMillis(data.checkOut),
        late: Boolean(data.late),
        lateMinutes: Number(data.lateMinutes ?? 0) || 0,
      } satisfies StaffAttendanceLog;
    })
    .filter((r) => r.date >= fromDate && r.date <= toDate)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Personelin KENDİ giriş-çıkış kayıtları (kurallar uid==self ister). */
export async function listMyAttendance(
  tenantId: string,
  uid: string,
  fromDate: string,
  toDate: string,
): Promise<StaffAttendanceLog[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const col = collection(db, tenantAttendanceLogs(tenantId));
  let snap;
  try {
    snap = await getDocs(query(col, where("uid", "==", uid)));
  } catch {
    return [];
  }
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: String(data.uid ?? ""),
        name: String(data.name ?? ""),
        department: String(data.department ?? ""),
        date: String(data.date ?? ""),
        checkIn: toMillis(data.checkIn),
        checkOut: toMillis(data.checkOut),
        late: Boolean(data.late),
        lateMinutes: Number(data.lateMinutes ?? 0) || 0,
      } satisfies StaffAttendanceLog;
    })
    .filter((r) => r.date >= fromDate && r.date <= toDate)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Saat:dakika biçimi (Europe/Istanbul). */
export function formatAttendanceTime(ms: number | null): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}
