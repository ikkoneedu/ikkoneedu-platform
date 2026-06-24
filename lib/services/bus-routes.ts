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
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantBusRoutes } from "@/lib/firebase/collections";

export interface BusRouteInput {
  tenantId: string;
  authorUid: string;
  routeName: string;
  driver: string;
  phone: string;
  /** Duraklar (satır satır: "Durak - 07:40" gibi). */
  stops: string[];
}

export interface BusRouteRecord {
  id: string;
  routeName: string;
  driver: string;
  phone: string;
  stops: string[];
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
    createdBy: input.authorUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
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
    };
  });
}
