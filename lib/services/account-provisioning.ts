/**
 * Hesap sağlama servisi — kayıt (öğrenci/veli/öğretmen) → Firebase Auth hesabı.
 *
 * Phase 2 mimarisi: hesap oluşturma/bağlama artık client-side secondary Firebase
 * Auth ile yapılmaz. İstemci yalnız mevcut yöneticinin ID token'ını gönderir;
 * Auth kullanıcısı, profil belgesi, custom claims ve kayıt `userId` bağı
 * server-side Admin SDK endpoint'i tarafından atomik/rollback kontrollü yürütülür.
 *
 * GÜVENLİK:
 *  - Şifre Firestore'a yazılmaz; yalnız yeni hesap oluşturulduğunda bir kez döner.
 *  - Tenant/rol/kayıt doğrulaması server endpoint'inde yapılır.
 *  - Mevcut e-posta yalnız aynı tenant ve beklenen role aitse bağlanır.
 */

import { isFirebaseConfigured } from "@/lib/firebase/client";
import type { ParentRecord } from "@/lib/services/parents";
import type { TeacherRecord } from "@/lib/services/teachers";
import type { StudentRecord } from "@/lib/services/students";

export interface ProvisionResult {
  ok: boolean;
  /** "created" = yeni hesap; "linked" = mevcut kullanıcı bağlandı. */
  mode: "created" | "linked" | null;
  uid: string | null;
  email: string | null;
  /** Yalnızca yeni hesap açıldığında dolar (bir kez gösterilir, saklanmaz). */
  tempPassword?: string;
  error?: string;
}

type AccountKind = "parent" | "teacher" | "student";

function fail(error: string): ProvisionResult {
  return { ok: false, mode: null, uid: null, email: null, error };
}

async function provisionAccount(input: {
  idToken: string;
  tenantId: string;
  kind: AccountKind;
  recordId: string;
  email: string;
}): Promise<ProvisionResult> {
  if (!isFirebaseConfigured()) return fail("Firebase yapılandırılmamış.");
  const response = await fetch("/api/admin/provision-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({}))) as Partial<ProvisionResult> & {
    error?: string;
  };

  if (!response.ok || !payload.ok) {
    return fail(payload.error ?? "Hesap oluşturulamadı.");
  }

  return {
    ok: true,
    mode: payload.mode ?? null,
    uid: payload.uid ?? null,
    email: payload.email ?? input.email,
    tempPassword: payload.tempPassword,
  };
}

/* -------------------------------------------------------------------------- */
/*  Kayıt türü özel sağlayıcılar                                                */
/* -------------------------------------------------------------------------- */

export async function provisionParentAccount(
  tenantId: string,
  _schoolId: string,
  parent: ParentRecord,
  email: string,
  idToken: string,
): Promise<ProvisionResult> {
  return provisionAccount({
    idToken,
    tenantId,
    kind: "parent",
    recordId: parent.id,
    email,
  });
}

export async function provisionTeacherAccount(
  tenantId: string,
  _schoolId: string,
  teacher: TeacherRecord,
  email: string,
  idToken: string,
): Promise<ProvisionResult> {
  return provisionAccount({
    idToken,
    tenantId,
    kind: "teacher",
    recordId: teacher.id,
    email,
  });
}

export async function provisionStudentAccount(
  tenantId: string,
  _schoolId: string,
  student: StudentRecord,
  email: string,
  idToken: string,
): Promise<ProvisionResult> {
  return provisionAccount({
    idToken,
    tenantId,
    kind: "student",
    recordId: student.id,
    email,
  });
}
