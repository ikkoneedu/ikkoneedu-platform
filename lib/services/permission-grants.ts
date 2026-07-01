/**
 * Görev bazlı geçici yetki devri — `tenants/{tenantId}/permissionGrants`.
 *
 * Genel Müdür (SCHOOL_ADMIN) ve üstü, belirli bir kullanıcıya statik rol
 * yetkisinin dışında belirli bir ekranı (route) geçici olarak açabilir
 * (ör. bursluluk sınavı görevi için ders programı ekranını bir öğretmene
 * açmak). `route-config.ts`teki statik `ROUTE_ROLES` kontrolüne EK olarak
 * `AuthProvider`'daki `activeGrantRoutes` bu kayıtlardan beslenir. Tenant
 * izole; yazma yalnız Genel Müdür/Kurucu/Süper Admin (Firestore kuralları
 * zorlar), okuma tenant üyesi.
 */

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantPermissionGrants } from "@/lib/firebase/collections";
import { toMillis } from "@/lib/services/people-validation";

export interface PermissionGrant {
  id: string;
  granteeUid: string;
  granteeName: string;
  route: string;
  note: string;
  grantedBy: string;
  grantedByName: string;
  status: "active" | "revoked";
  createdAt: number | null;
  expiresAt: number | null;
}

export interface CreatePermissionGrantInput {
  granteeUid: string;
  granteeName: string;
  route: string;
  note?: string;
  grantedBy: string;
  grantedByName: string;
  /** Verilmemişse süresiz (elle geri alınana kadar) geçerlidir. */
  expiresAt?: Date | null;
}

function mapGrant(id: string, data: Record<string, unknown>): PermissionGrant {
  return {
    id,
    granteeUid: String(data.granteeUid ?? ""),
    granteeName: String(data.granteeName ?? ""),
    route: String(data.route ?? ""),
    note: String(data.note ?? ""),
    grantedBy: String(data.grantedBy ?? ""),
    grantedByName: String(data.grantedByName ?? ""),
    status: data.status === "revoked" ? "revoked" : "active",
    createdAt: toMillis(data.createdAt),
    expiresAt: toMillis(data.expiresAt),
  };
}

/** Yeni bir görev bazlı yetki kaydı oluşturur. */
export async function grantPermission(
  tenantId: string,
  input: CreatePermissionGrantInput,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = doc(collection(db, tenantPermissionGrants(tenantId)));
  await setDoc(ref, {
    granteeUid: input.granteeUid,
    granteeName: input.granteeName,
    route: input.route,
    note: input.note ?? "",
    grantedBy: input.grantedBy,
    grantedByName: input.grantedByName,
    status: "active",
    createdAt: serverTimestamp(),
    expiresAt: input.expiresAt ?? null,
  });
  return ref.id;
}

/** Bir yetki kaydını geri alır (siler yerine `status: revoked` — denetim izi kalır). */
export async function revokePermissionGrant(
  tenantId: string,
  grantId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, `${tenantPermissionGrants(tenantId)}/${grantId}`), {
    status: "revoked",
  });
}

/** Tenant'taki tüm yetki devri kayıtlarını listeler (yönetim paneli). */
export async function listGrantsByTenant(
  tenantId: string,
): Promise<PermissionGrant[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(collection(db, tenantPermissionGrants(tenantId)));
  return snap.docs
    .map((d) => mapGrant(d.id, d.data()))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

function isExpired(grant: PermissionGrant): boolean {
  return grant.expiresAt !== null && grant.expiresAt < Date.now();
}

/** Belirli bir kullanıcının SÜRESİ GEÇMEMİŞ aktif route izinlerini dinler (canlı). */
export function watchActiveGrantsForUser(
  tenantId: string,
  uid: string,
  onChange: (routes: string[]) => void,
): Unsubscribe {
  if (!isFirebaseConfigured() || !db || !tenantId || !uid) {
    onChange([]);
    return () => {};
  }
  const q = query(
    collection(db, tenantPermissionGrants(tenantId)),
    where("granteeUid", "==", uid),
    where("status", "==", "active"),
  );
  return onSnapshot(
    q,
    (snap) => {
      const grants = snap.docs.map((d) => mapGrant(d.id, d.data()));
      const routes = grants.filter((g) => !isExpired(g)).map((g) => g.route);
      onChange([...new Set(routes)]);
    },
    () => onChange([]),
  );
}
