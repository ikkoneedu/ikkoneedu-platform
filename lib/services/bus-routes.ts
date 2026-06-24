/**
 * Servis (ulaşım) servisi — okul servis rotaları.
 *
 * - createBusRoute: personel/yönetim rota ekler.
 * - listBusRoutes: tenant üyeleri rotaları görür.
 *
 * Canlı GPS değildir; statik rota/durak/saat bilgisidir.
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
import { tenantBusRoutes } from "@/lib/firebase/collections";
import { toMillis } from "@/lib/services/people-validation";

export interface BusRouteInput {
  tenantId: string;
  authorUid: string;
  routeName: string;
  driver: string;
  phone: string;
  /** Duraklar (satır satır: "Durak - 07:40" gibi). */
  stops: string[];
  /** Bu rotaya atanmış şoför hesabı (opsiyonel). */
  driverUid?: string;
}

/** Şoförün telefonundan gelen canlı konumu rotaya yazar (şoför veya personel). */
export async function updateBusRouteLocation(
  tenantId: string,
  id: string,
  lat: number,
  lng: number,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await updateDoc(doc(db, `${tenantBusRoutes(tenantId)}/${id}`), {
    currentLat: lat,
    currentLng: lng,
    locationUpdatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export interface BusRouteRecord {
  id: string;
  routeName: string;
  driver: string;
  phone: string;
  stops: string[];
  /** Bu rotaya atanmış şoför hesabı (users/{uid}) — yoksa boş. */
  driverUid: string;
  /** Son bilinen canlı konum (şoför telefonundan). */
  currentLat: number | null;
  currentLng: number | null;
  /** Konumun en son güncellendiği an (ms). */
  locationUpdatedAt: number | null;
}

export async function createBusRoute(input: BusRouteInput): Promise<string | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = await addDoc(collection(db, tenantBusRoutes(input.tenantId)), {
    routeName: input.routeName,
    driver: input.driver,
    phone: input.phone,
    stops: input.stops,
    driverUid: input.driverUid ?? "",
    createdBy: input.authorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Rotayı günceller (personel). */
export async function updateBusRoute(
  tenantId: string,
  id: string,
  fields: { routeName: string; driver: string; phone: string; stops: string[]; driverUid?: string },
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  const data: Record<string, unknown> = { ...fields, updatedAt: serverTimestamp() };
  if (fields.driverUid === undefined) delete data.driverUid;
  await updateDoc(doc(db, `${tenantBusRoutes(tenantId)}/${id}`), data);
}

/** Rotayı siler (personel — kurallar zorlar). */
export async function deleteBusRoute(tenantId: string, id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await deleteDoc(doc(db, `${tenantBusRoutes(tenantId)}/${id}`));
}

/** Rotaları ada göre listeler. */
export async function listBusRoutes(tenantId: string): Promise<BusRouteRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantBusRoutes(tenantId)), orderBy("routeName", "asc")),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      routeName: String(data.routeName ?? ""),
      driver: String(data.driver ?? ""),
      phone: String(data.phone ?? ""),
      stops: Array.isArray(data.stops) ? (data.stops as string[]) : [],
      driverUid: String(data.driverUid ?? ""),
      currentLat: typeof data.currentLat === "number" ? data.currentLat : null,
      currentLng: typeof data.currentLng === "number" ? data.currentLng : null,
      locationUpdatedAt: toMillis(data.locationUpdatedAt),
    };
  });
}
