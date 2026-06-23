/**
 * Hesap sağlama servisi — kayıt (öğrenci/veli/öğretmen) → Firebase Auth hesabı.
 *
 * Mimari (Admin SDK gerektirmez): mevcut ikincil-app deseni kullanılır. Yeni
 * hesap ikincil Firebase Auth örneğinde açılır (yöneticinin oturumu bozulmaz),
 * profil ana oturumla yazılır. Yetki Firestore kurallarıyla zorlanır:
 *   - users create: yalnız personel/okul yöneticisi, kendi tenant'ında, izinli rol.
 *   - parent/teacher/student.userId set: yalnız kayıt yönetimi.
 *
 * GÜVENLİK:
 *  - tenantId/schoolId çağıran tarafça doğrulanmış profilden geçilir (istemci
 *    körü körüne kabul edilmez; kurallar da zorlar).
 *  - Şifre ASLA Firestore'a yazılmaz; yalnızca oluşturma anında döndürülür.
 *  - E-posta zaten varsa yeni hesap açılmaz; aynı tenant'taki mevcut kullanıcıya
 *    bağlanır, farklı tenant ise hata verilir.
 */

import {
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase/client";
import { getSecondaryAuth } from "@/lib/firebase/secondary-app";
import {
  userProfileDoc,
  tenantParents,
  tenantTeachers,
  tenantStudents,
} from "@/lib/firebase/collections";
import { ROLES, type Role } from "@/lib/auth/role-constants";
import { listTenantUsers } from "@/lib/services/users";
import { EMAIL_RE } from "@/lib/services/people-validation";
import type { ParentRecord } from "@/lib/services/parents";
import type { TeacherRecord } from "@/lib/services/teachers";
import type { StudentRecord } from "@/lib/services/students";

const PW_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PW_LOWER = "abcdefghijkmnpqrstuvwxyz";
const PW_DIGIT = "23456789";
const PW_SYMBOL = "!@#$%*?";

/** Güçlü geçici şifre üretir (Firestore'a YAZILMAZ; UI'da bir kez gösterilir). */
function strongPassword(): string {
  const all = PW_UPPER + PW_LOWER + PW_DIGIT + PW_SYMBOL;
  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];
  let out = pick(PW_UPPER) + pick(PW_LOWER) + pick(PW_DIGIT) + pick(PW_SYMBOL);
  for (let i = 0; i < 10; i += 1) out += pick(all);
  // Karıştır.
  return out
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

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

interface ProvisionInput {
  tenantId: string;
  schoolId: string;
  role: Role;
  email: string;
  displayName: string;
  createdBy: string;
  /** Sunucu route'u için bağ türü/kaydı (üretim yolu). */
  linkKind: "parent" | "teacher" | "student";
  linkRecordId: string;
  /** users/{uid} profiline yazılacak bağ alanları (ikincil-app fallback için). */
  linkFields: Record<string, unknown>;
  /** userId yazılacak kayıt belgesinin tam yolu (fallback için). */
  recordPath: string;
}

/**
 * ÜRETİM YOLU: hesabı sunucu Admin SDK route'unda oluştur (çağıranın ID token'ı
 * doğrulanır, yetki sunucuda zorlanır). Admin SDK yapılandırılmamışsa (503) ya
 * da ağ hatasında `null` döner → çağıran ikincil-app fallback'ine geçer.
 */
async function tryServerCreate(
  input: ProvisionInput,
  email: string,
): Promise<ProvisionResult | null> {
  const current = auth?.currentUser;
  if (!current) return null;
  let idToken: string;
  try {
    idToken = await current.getIdToken();
  } catch {
    return null;
  }
  let res: Response;
  try {
    res = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idToken,
        email,
        displayName: input.displayName,
        role: input.role,
        tenantId: input.tenantId,
        schoolId: input.schoolId,
        link: { kind: input.linkKind, recordId: input.linkRecordId },
      }),
    });
  } catch {
    return null; // ağ hatası → fallback
  }
  if (res.status === 503) return null; // Admin SDK yok → fallback (dev/legacy)
  let data: ProvisionResult & { tempPassword?: string };
  try {
    data = await res.json();
  } catch {
    return fail("Sunucu yanıtı okunamadı.");
  }
  if (!res.ok || !data.ok) {
    return fail(data.error ?? "Hesap oluşturulamadı.");
  }
  return {
    ok: true,
    mode: data.mode ?? "created",
    uid: data.uid ?? null,
    email: data.email ?? email,
    tempPassword: data.tempPassword,
  };
}

function fail(error: string): ProvisionResult {
  return { ok: false, mode: null, uid: null, email: null, error };
}

async function provisionAccount(input: ProvisionInput): Promise<ProvisionResult> {
  if (!isFirebaseConfigured() || !db) return fail("Firebase yapılandırılmamış.");
  const database = db;
  const email = input.email.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return fail("Geçerli bir e-posta girin.");

  // ÜRETİM: önce sunucu Admin SDK route'unu dene (güvenli, token doğrulamalı).
  const server = await tryServerCreate(input, email);
  if (server) return server;

  // FALLBACK (yalnız Admin SDK YOKKEN — dev/legacy): ikincil-app ile oluştur.
  const secondary = getSecondaryAuth();
  if (!secondary) return fail("Firebase yapılandırılmamış.");

  const password = strongPassword();

  try {
    // 1) İkincil oturumda hesabı oluştur.
    const credential = await createUserWithEmailAndPassword(secondary, email, password);
    const uid = credential.user.uid;

    // 2) Profil belgesini ana oturumla yaz (rollback: profil yazılamazsa auth sil).
    try {
      await setDoc(doc(database, userProfileDoc(uid)), {
        uid,
        email,
        displayName: input.displayName,
        role: input.role,
        tenantId: input.tenantId,
        schoolId: input.schoolId || input.tenantId,
        status: "ACTIVE",
        mustChangePassword: true,
        createdBy: input.createdBy,
        ...input.linkFields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (profileErr) {
      try {
        await credential.user.delete();
      } catch {
        /* rollback başarısız olsa da asıl hatayı bildir */
      }
      throw profileErr;
    }

    await signOut(secondary);

    // 3) İlgili kayda userId bağla.
    await updateDoc(doc(database, input.recordPath), {
      userId: uid,
      updatedAt: serverTimestamp(),
    });

    return { ok: true, mode: "created", uid, email, tempPassword: password };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "auth/email-already-in-use") {
      // Bağlama yolu: aynı tenant'taki mevcut kullanıcıya bağla.
      try {
        const users = await listTenantUsers(input.tenantId);
        const existing = users.find((u) => u.email.toLowerCase() === email);
        if (!existing) {
          return fail(
            "Bu e-posta başka bir okula/hesaba ait olduğundan bağlanamadı.",
          );
        }
        // Profilin bağ alanlarını güncelle (rol/tenant değişmez — kurallar zorlar).
        await updateDoc(doc(database, userProfileDoc(existing.uid)), {
          ...input.linkFields,
          updatedAt: serverTimestamp(),
        });
        await updateDoc(doc(database, input.recordPath), {
          userId: existing.uid,
          updatedAt: serverTimestamp(),
        });
        return { ok: true, mode: "linked", uid: existing.uid, email };
      } catch (linkErr) {
        return fail(
          linkErr instanceof Error ? linkErr.message : "Hesap bağlanamadı.",
        );
      }
    }
    if (code === "auth/weak-password") return fail("Şifre çok zayıf.");
    if (code === "auth/invalid-email") return fail("Geçersiz e-posta.");
    return fail(error instanceof Error ? error.message : "Hesap oluşturulamadı.");
  }
}

/* -------------------------------------------------------------------------- */
/*  Role özel sağlayıcılar                                                     */
/* -------------------------------------------------------------------------- */

export async function provisionParentAccount(
  tenantId: string,
  schoolId: string,
  parent: ParentRecord,
  email: string,
  createdBy: string,
): Promise<ProvisionResult> {
  return provisionAccount({
    tenantId,
    schoolId,
    role: ROLES.PARENT,
    email,
    displayName: parent.fullName,
    createdBy,
    linkKind: "parent",
    linkRecordId: parent.id,
    linkFields: {
      linkedParentId: parent.id,
      linkedStudentIds: parent.linkedStudentIds ?? [],
    },
    recordPath: `${tenantParents(tenantId)}/${parent.id}`,
  });
}

export async function provisionTeacherAccount(
  tenantId: string,
  schoolId: string,
  teacher: TeacherRecord,
  email: string,
  createdBy: string,
): Promise<ProvisionResult> {
  return provisionAccount({
    tenantId,
    schoolId,
    role: ROLES.TEACHER,
    email,
    displayName: teacher.fullName,
    createdBy,
    linkKind: "teacher",
    linkRecordId: teacher.id,
    linkFields: {
      linkedTeacherId: teacher.id,
      classIds: teacher.classIds ?? [],
    },
    recordPath: `${tenantTeachers(tenantId)}/${teacher.id}`,
  });
}

export async function provisionStudentAccount(
  tenantId: string,
  schoolId: string,
  student: StudentRecord,
  email: string,
  createdBy: string,
): Promise<ProvisionResult> {
  return provisionAccount({
    tenantId,
    schoolId,
    role: ROLES.STUDENT,
    email,
    displayName: student.fullName,
    createdBy,
    linkKind: "student",
    linkRecordId: student.id,
    linkFields: {
      linkedStudentId: student.id,
      classId: student.classId ?? "",
    },
    recordPath: `${tenantStudents(tenantId)}/${student.id}`,
  });
}
