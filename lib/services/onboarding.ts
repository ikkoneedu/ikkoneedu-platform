/**
 * Tenant onboarding orkestrasyonu (yalnızca SUPER_ADMIN).
 *
 * Tek akışta: tenant (abonelik) + okul profili + ilk okul admini (SCHOOL_ADMIN).
 *
 * Bütünlük: Firebase Auth + Firestore arası gerçek transaction mümkün değildir
 * (uid auth'tan gelir, profil sonra yazılır). Bu yüzden ORKESTRASYON SEVİYESİNDE
 * telafi (compensating rollback) uygulanır:
 *   - Okul profili yazılamazsa tenant geri alınır.
 *   - Admin (auth+profil) oluşturulamazsa okul + tenant geri alınır.
 *   - Auth oluşup profil yazılamazsa auth hesabı `createManagedAccount` içinde
 *     silinir (alt seviye rollback).
 *
 * Benzersizlik: slug (tenantId) hem tenants hem schools içinde benzersiz olmalı;
 * e-posta benzersizliği Firebase Auth tarafından zorlanır (email-already-in-use).
 */

import { deleteDoc, doc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantDoc, schoolDoc } from "@/lib/firebase/collections";
import { toSlug } from "@/lib/services/schools";
import {
  createTenant,
  getTenant,
  type TenantStatus,
} from "@/lib/services/tenants";
import {
  createSchoolProfile,
  getSchoolProfile,
} from "@/lib/services/school-profiles";
import { createManagedAccount, type CreatedStaff } from "@/lib/services/users";
import { ROLES } from "@/lib/auth/role-constants";
import { DEFAULT_PACKAGE_ID, isValidPackageId, type PackageId } from "@/lib/packages";

export interface OnboardTenantInput {
  /** Okul/tenant adı. */
  name: string;
  /** İstenen kısa ad (boşsa addan türetilir). */
  slug?: string;
  packageId: PackageId;
  /** Tenant başlangıç durumu (vars. trial). */
  status?: TenantStatus;
  city?: string;
  district?: string;
  phone?: string;
  schoolEmail?: string;
  website?: string;
  logo?: string;
  /** İlk okul admini. */
  adminEmail: string;
  adminName?: string;
  createdBy: string;
}

export interface OnboardResult {
  ok: boolean;
  tenantId: string | null;
  schoolId: string | null;
  admin: CreatedStaff | null;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onboardTenant(
  input: OnboardTenantInput,
): Promise<OnboardResult> {
  if (!isFirebaseConfigured() || !db) {
    return {
      ok: false,
      tenantId: null,
      schoolId: null,
      admin: null,
      error: "Firebase yapılandırılmamış.",
    };
  }
  const database = db;

  const name = input.name.trim();
  const adminEmail = input.adminEmail.trim().toLowerCase();
  if (!name) {
    return fail("Okul adı zorunludur.");
  }
  if (!EMAIL_RE.test(adminEmail)) {
    return fail("Geçerli bir admin e-postası girin.");
  }
  const packageId = isValidPackageId(input.packageId)
    ? input.packageId
    : DEFAULT_PACKAGE_ID;

  const slug = toSlug(input.slug || name);
  if (!slug) {
    return fail("Geçerli bir kısa ad (slug) üretilemedi.");
  }
  const tenantId = slug;
  const schoolId = slug;

  // Benzersizlik kontrolü (slug hem tenant hem okul için boşta olmalı).
  const [existingTenant, existingSchool] = await Promise.all([
    getTenant(tenantId),
    getSchoolProfile(schoolId),
  ]);
  if (existingTenant || existingSchool) {
    return fail(`"${slug}" kısa adı zaten kullanılıyor. Farklı bir ad seçin.`);
  }

  // 1) Tenant (abonelik) oluştur.
  try {
    await createTenant({
      tenantId,
      name,
      slug,
      packageId,
      status: input.status ?? "trial",
      city: input.city,
      createdBy: input.createdBy,
    });
  } catch (error) {
    return fail(message(error, "Tenant oluşturulamadı."));
  }

  // 2) Okul profili oluştur (başarısızsa tenant'ı geri al).
  try {
    await createSchoolProfile({
      schoolId,
      tenantId,
      name,
      slug,
      city: input.city,
      district: input.district,
      logo: input.logo,
      phone: input.phone,
      email: input.schoolEmail,
      website: input.website,
      status: "active",
    });
  } catch (error) {
    await safeDelete(tenantDoc(tenantId));
    return fail(message(error, "Okul profili oluşturulamadı."));
  }

  // 3) İlk okul admini (SCHOOL_ADMIN) — auth + profil; başarısızsa okul + tenant'ı geri al.
  let admin: CreatedStaff;
  try {
    admin = await createManagedAccount({
      tenantId,
      schoolId,
      createdBy: input.createdBy,
      role: ROLES.SCHOOL_ADMIN,
      displayName: input.adminName?.trim() || name,
      email: adminEmail,
    });
  } catch (error) {
    await safeDelete(schoolDoc(schoolId));
    await safeDelete(tenantDoc(tenantId));
    return fail(message(error, "Okul admini oluşturulamadı."));
  }

  return { ok: true, tenantId, schoolId, admin };

  // -- yardımcılar --
  function fail(msg: string): OnboardResult {
    return { ok: false, tenantId: null, schoolId: null, admin: null, error: msg };
  }
  async function safeDelete(path: string): Promise<void> {
    try {
      await deleteDoc(doc(database, path));
    } catch {
      /* telafi silmesi başarısız olsa da asıl hatayı döndür */
    }
  }
}

function message(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: string }).code;
    if (code === "auth/email-already-in-use") {
      return "Bu e-posta zaten kullanımda. Farklı bir admin e-postası girin.";
    }
    if (code === "auth/weak-password") {
      return "Şifre çok zayıf.";
    }
  }
  return error instanceof Error ? error.message : fallback;
}
