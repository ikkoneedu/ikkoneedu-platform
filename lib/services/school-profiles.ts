/**
 * Okul profili servisi — `schools/{schoolId}`.
 *
 * Tenant aboneliğinden (tenants/{tenantId}) ayrı; okulun iletişim/kimlik
 * profilini taşır (şehir, ilçe, telefon, e-posta, web, logo). MVP'de
 * schoolId = tenantId (okul başına tek tenant).
 *
 * Okuma: ilgili tenant üyesi veya SUPER_ADMIN. Yazma: SUPER_ADMIN veya okul
 * yöneticisi (kendi okulu) — Firestore kuralları zorlar.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { schoolDoc, schools } from "@/lib/firebase/collections";

export const SCHOOL_STATUSES = ["active", "suspended"] as const;
export type SchoolStatus = (typeof SCHOOL_STATUSES)[number];

export interface SchoolProfile {
  schoolId: string;
  tenantId: string;
  name: string;
  slug: string;
  city: string;
  district: string;
  logo: string;
  phone: string;
  email: string;
  website: string;
  status: string;
  /** Okul iletişim adminliği — veli/öğrenci "okul yönetimine yaz" hedefi. */
  primaryAdminUid: string;
  primaryAdminName: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface CreateSchoolProfileInput {
  schoolId: string;
  tenantId: string;
  name: string;
  slug: string;
  city?: string;
  district?: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: SchoolStatus;
}

function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : null;
}

function mapProfile(id: string, data: Record<string, unknown>): SchoolProfile {
  return {
    schoolId: id,
    tenantId: String(data.tenantId ?? ""),
    name: String(data.name ?? ""),
    slug: String(data.slug ?? ""),
    city: String(data.city ?? ""),
    district: String(data.district ?? ""),
    logo: String(data.logo ?? ""),
    phone: String(data.phone ?? ""),
    email: String(data.email ?? ""),
    website: String(data.website ?? ""),
    status: String(data.status ?? "active"),
    primaryAdminUid: String(data.primaryAdminUid ?? ""),
    primaryAdminName: String(data.primaryAdminName ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/** Okul profili oluşturur (schoolId belge kimliğidir). */
export async function createSchoolProfile(
  input: CreateSchoolProfileInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  if (!input.tenantId) throw new Error("tenantId zorunlu.");
  if (!input.schoolId) throw new Error("schoolId zorunlu.");
  await setDoc(doc(db, schoolDoc(input.schoolId)), {
    schoolId: input.schoolId,
    tenantId: input.tenantId,
    name: input.name,
    slug: input.slug,
    city: input.city ?? "",
    district: input.district ?? "",
    logo: input.logo ?? "",
    phone: input.phone ?? "",
    email: input.email ?? "",
    website: input.website ?? "",
    status: input.status ?? "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Tek okul profili getirir. */
export async function getSchoolProfile(
  schoolId: string,
): Promise<SchoolProfile | null> {
  if (!isFirebaseConfigured() || !db) return null;
  const snap = await getDoc(doc(db, schoolDoc(schoolId)));
  if (!snap.exists()) return null;
  return mapProfile(snap.id, snap.data());
}

/** Tüm okul profillerini listeler (SUPER_ADMIN; tenant üyesi kendi okulunu). */
export async function listSchoolProfiles(): Promise<SchoolProfile[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(query(collection(db, schools())));
  return snap.docs.map((d) => mapProfile(d.id, d.data()));
}

export interface UpdateSchoolProfileInput {
  name?: string;
  city?: string;
  district?: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  status?: SchoolStatus;
  primaryAdminUid?: string;
  primaryAdminName?: string;
}

/** Okul profilini günceller. */
export async function updateSchoolProfile(
  schoolId: string,
  patch: UpdateSchoolProfileInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const key of [
    "name",
    "city",
    "district",
    "logo",
    "phone",
    "email",
    "website",
    "status",
    "primaryAdminUid",
    "primaryAdminName",
  ] as const) {
    if (patch[key] !== undefined) data[key] = patch[key];
  }
  await updateDoc(doc(db, schoolDoc(schoolId)), data);
}

/** Bir tenant'a ait okul profillerini döndürür (istemci tarafı filtre). */
export function filterByTenant(
  profiles: SchoolProfile[],
  tenantId: string,
): SchoolProfile[] {
  return profiles.filter((p) => p.tenantId === tenantId);
}
