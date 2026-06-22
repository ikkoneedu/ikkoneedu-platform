/**
 * Tenant (abonelik) servisi — `tenants/{tenantId}`.
 *
 * Tenant, bir okulun platform aboneliğini temsil eder: ad, slug (subdomain
 * hazırlığı), durum (trial/active/suspended/cancelled) ve paket. Okulun
 * iletişim profili ayrı `schools/{schoolId}` belgesinde tutulur.
 *
 * Not: `name`/`city`/`status` alanları geriye dönük uyum için tenant belgesinde
 * de tutulur (mevcut `getSchool` ve public okul sayfaları bu belgeyi okur).
 * Yazma yalnızca SUPER_ADMIN (Firestore kuralları zorlar).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantDoc, tenants } from "@/lib/firebase/collections";
import { DEFAULT_PACKAGE_ID, type PackageId } from "@/lib/packages";

/** Tenant abonelik durumları. */
export const TENANT_STATUSES = [
  "trial",
  "active",
  "suspended",
  "cancelled",
] as const;

export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const TENANT_STATUS_LABELS: Record<string, string> = {
  trial: "Deneme",
  active: "Aktif",
  suspended: "Askıda",
  cancelled: "İptal",
};

export function tenantStatusLabel(status: string): string {
  return TENANT_STATUS_LABELS[status] ?? status;
}

/** Erişimi engellenen (askı/iptal) durumlar — büyük/küçük harf toleranslı. */
export function isBlockedTenantStatus(status: string): boolean {
  const s = status.toLowerCase();
  return s === "suspended" || s === "cancelled";
}

export interface TenantRecord {
  tenantId: string;
  name: string;
  slug: string;
  status: string;
  packageId: string;
  city: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface CreateTenantInput {
  tenantId: string;
  name: string;
  slug: string;
  packageId: PackageId;
  status?: TenantStatus;
  city?: string;
  createdBy: string;
}

function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : null;
}

function mapTenant(id: string, data: Record<string, unknown>): TenantRecord {
  return {
    tenantId: id,
    name: String(data.name ?? id),
    slug: String(data.slug ?? id),
    status: String(data.status ?? "active"),
    packageId: String(data.packageId ?? DEFAULT_PACKAGE_ID),
    city: String(data.city ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/** Tenant belgesini oluşturur. Çakışan slug varsa hata fırlatır. */
export async function createTenant(
  input: CreateTenantInput,
): Promise<TenantRecord> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = doc(db, tenantDoc(input.tenantId));
  const existing = await getDoc(ref);
  if (existing.exists()) {
    throw new Error(
      `"${input.tenantId}" kısa adı zaten kullanılıyor. Farklı bir ad seçin.`,
    );
  }
  const status = input.status ?? "trial";
  await setDoc(ref, {
    tenantId: input.tenantId,
    name: input.name,
    slug: input.slug,
    status,
    packageId: input.packageId,
    city: input.city ?? "",
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return {
    tenantId: input.tenantId,
    name: input.name,
    slug: input.slug,
    status,
    packageId: input.packageId,
    city: input.city ?? "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** Tek tenant getirir. */
export async function getTenant(tenantId: string): Promise<TenantRecord | null> {
  if (!isFirebaseConfigured() || !db) return null;
  const snap = await getDoc(doc(db, tenantDoc(tenantId)));
  if (!snap.exists()) return null;
  return mapTenant(snap.id, snap.data());
}

/** Tüm tenant'ları listeler (yalnızca SUPER_ADMIN okur). */
export async function listTenants(): Promise<TenantRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  let snap;
  try {
    snap = await getDocs(query(collection(db, tenants()), orderBy("name")));
  } catch {
    snap = await getDocs(collection(db, tenants()));
  }
  return snap.docs.map((d) => mapTenant(d.id, d.data()));
}

export interface UpdateTenantInput {
  name?: string;
  city?: string;
  status?: TenantStatus;
  packageId?: PackageId;
}

/** Tenant bilgilerini günceller (durum/paket/ad). */
export async function updateTenant(
  tenantId: string,
  patch: UpdateTenantInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.name !== undefined) data.name = patch.name.trim();
  if (patch.city !== undefined) data.city = patch.city.trim();
  if (patch.status !== undefined) data.status = patch.status;
  if (patch.packageId !== undefined) data.packageId = patch.packageId;
  await updateDoc(doc(db, tenantDoc(tenantId)), data);
}
