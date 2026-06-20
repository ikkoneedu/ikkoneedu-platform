/**
 * Okul (tenant) yönetim servisi — yalnızca SUPER_ADMIN.
 *
 * - createSchool: yeni okul (tenant) belgesi oluşturur.
 * - listSchools: tüm okulları listeler.
 *
 * Okullar `tenants/{tenantId}` kök belgelerinde tutulur. tenantId, girilen
 * slug'tan türetilir (benzersiz, okunabilir kimlik).
 */

import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { collection } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantDoc, tenants } from "@/lib/firebase/collections";

export interface SchoolRecord {
  id: string;
  name: string;
  slug: string;
  city: string;
  status: string;
  createdAt: number | null;
}

export interface CreateSchoolInput {
  name: string;
  slug: string;
  city: string;
  createdBy: string;
}

/** Serbest metni güvenli bir slug'a dönüştürür (tenantId olarak kullanılır). */
export function toSlug(value: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return value
    .trim()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Yeni okul (tenant) oluşturur. Slug çakışırsa hata fırlatır. */
export async function createSchool(input: CreateSchoolInput): Promise<SchoolRecord> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const name = input.name.trim();
  const city = input.city.trim();
  const slug = toSlug(input.slug || input.name);
  if (!name) throw new Error("Okul adı gerekli.");
  if (!slug) throw new Error("Geçerli bir okul kısa adı (slug) gerekli.");

  const ref = doc(db, tenantDoc(slug));
  const existing = await getDoc(ref);
  if (existing.exists()) {
    throw new Error(`"${slug}" kısa adı zaten kullanılıyor. Farklı bir ad seçin.`);
  }

  await setDoc(ref, {
    name,
    slug,
    city,
    status: "ACTIVE",
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: slug, name, slug, city, status: "ACTIVE", createdAt: Date.now() };
}

export interface UpdateSchoolInput {
  name?: string;
  city?: string;
  status?: string;
}

/** Okul bilgilerini günceller (ad, şehir, durum). */
export async function updateSchool(
  id: string,
  patch: UpdateSchoolInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.name !== undefined) data.name = patch.name.trim();
  if (patch.city !== undefined) data.city = patch.city.trim();
  if (patch.status !== undefined) data.status = patch.status;
  await updateDoc(doc(db, tenantDoc(id)), data);
}

/** Okulu (tenant belgesini) siler. Not: alt koleksiyonlar otomatik silinmez. */
export async function deleteSchool(id: string): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await deleteDoc(doc(db, tenantDoc(id)));
}

function toSchoolRecord(id: string, data: Record<string, unknown>): SchoolRecord {
  const ts = data.createdAt as { toMillis?: () => number } | undefined;
  return {
    id,
    name: String(data.name ?? id),
    slug: String(data.slug ?? id),
    city: String(data.city ?? ""),
    status: String(data.status ?? "ACTIVE"),
    createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
  };
}

/** Tek bir okulu kimliğiyle (slug = tenantId) getirir. Halka açıktır. */
export async function getSchool(id: string): Promise<SchoolRecord | null> {
  if (!isFirebaseConfigured() || !db) return null;
  const snap = await getDoc(doc(db, tenantDoc(id)));
  if (!snap.exists()) return null;
  return toSchoolRecord(snap.id, snap.data());
}

/** Tüm okulları (tenant'ları) listeler. */
export async function listSchools(): Promise<SchoolRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  let snap;
  try {
    snap = await getDocs(query(collection(db, tenants()), orderBy("name")));
  } catch {
    // orderBy için alan yoksa (eski belgeler) sırasız çek.
    snap = await getDocs(collection(db, tenants()));
  }
  return snap.docs.map((d) => toSchoolRecord(d.id, d.data()));
}
