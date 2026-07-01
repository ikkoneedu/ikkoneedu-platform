/**
 * Kiosk cihazları (USB QR okuyucu terminalleri) — İSTEMCİ servisi.
 *
 * Cihaz OLUŞTURMA (sır üretimi) yalnızca sunucu API'sinden yapılır
 * (`/api/admin/attendance-devices/create` — bkz. `lib/attendance/device-auth.ts`).
 * Bu modül yalnızca listeleme + durum/ad/lokasyon güncellemesi sağlar
 * (Firestore kuralları `secretHash` alanının istemciden değişmesini zaten
 * engeller — bkz. `firestore.rules`).
 */

import {
  collection,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantAttendanceDevices } from "@/lib/firebase/collections";

export type DeviceStatus = "active" | "passive";

export interface AttendanceDevice {
  id: string;
  name: string;
  location: string;
  status: DeviceStatus;
  lastUsedAt: number | null;
  createdAt: number | null;
}

function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  if (ts && typeof ts.toMillis === "function") return ts.toMillis();
  return typeof v === "number" ? v : null;
}

export async function listAttendanceDevices(tenantId: string): Promise<AttendanceDevice[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(collection(db, tenantAttendanceDevices(tenantId)));
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: String(data.name ?? ""),
        location: String(data.location ?? ""),
        status: data.status === "passive" ? "passive" : "active",
        lastUsedAt: toMillis(data.lastUsedAt),
        createdAt: toMillis(data.createdAt),
      } satisfies AttendanceDevice;
    })
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function setAttendanceDeviceStatus(
  tenantId: string,
  deviceId: string,
  status: DeviceStatus,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) throw new Error("Firebase yapılandırılmamış.");
  await updateDoc(doc(db, `${tenantAttendanceDevices(tenantId)}/${deviceId}`), {
    status,
    updatedAt: serverTimestamp(),
  });
}
