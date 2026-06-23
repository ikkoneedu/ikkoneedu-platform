/**
 * Erişim kodu servisi — öğretmenin öğrenci/veli hesaplarını kod ile üretmesi.
 *
 * Mimari:
 * - Öğretmen kod üretir → server-side Admin SDK endpoint'i gizli bir
 *   email/şifre hesabı oluşturur; öğretmenin oturumu bozulmaz.
 * - Veli/öğrenci, kodu girince kod → email/şifre türetilir ve gerçek Firebase
 *   Auth oturumu açılır (`signInWithCode`).
 *
 * Kod = kimlik bilgisidir; öğretmen fiziksel olarak veli/öğrenciye verir.
 */

import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  userProfileDoc,
  tenantClasses,
  tenantAccessCodes,
} from "@/lib/firebase/collections";
import { ROLES } from "@/lib/auth/role-constants";

const CODE_DOMAIN = "codes.ikkoneedu.app";

/** "OGRABC234" → gizli e-posta (deterministik). */
function compactToEmail(compact: string): string {
  return `${compact.toLowerCase()}@${CODE_DOMAIN}`;
}

/** "OGRABC234" → gizli şifre (deterministik, ≥6 karakter). */
function compactToPassword(compact: string): string {
  return `ikko-${compact}`;
}

export type CodeRole = typeof ROLES.STUDENT | typeof ROLES.PARENT;

export interface CreateClassInput {
  tenantId: string;
  teacherUid: string;
  name: string;
  gradeLevel?: string;
}

export interface ClassRecord {
  id: string;
  name: string;
  gradeLevel: string;
  teacherUid: string;
}

/** Öğretmen yeni bir sınıf oluşturur. */
export async function createClass(input: CreateClassInput): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = await addDoc(collection(db, tenantClasses(input.tenantId)), {
    name: input.name,
    gradeLevel: input.gradeLevel ?? "",
    teacherUid: input.teacherUid,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Öğretmenin kendi sınıflarını listeler. */
export async function listMyClasses(
  tenantId: string,
  teacherUid: string,
): Promise<ClassRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, tenantClasses(tenantId)),
      where("teacherUid", "==", teacherUid),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: String(data.name ?? ""),
      gradeLevel: String(data.gradeLevel ?? ""),
      teacherUid: String(data.teacherUid ?? ""),
    };
  });
}

export interface GenerateCodeInput {
  tenantId: string;
  teacherUid: string;
  /** Kodu üreten öğretmenin adı (denormalize — mesajlaşma kontağı). */
  teacherName?: string;
  role: CodeRole;
  /** Öğrenci adı (veli kodu için de "öğrencinin velisi" bağlamı). */
  displayName: string;
  classId?: string;
  /** Sınıf adı (denormalize — öğrenci/veli panelinde gösterim). */
  className?: string;
  /** Veli kodu için bağlı öğrenci uid'leri. */
  linkedStudentIds?: string[];
  /** Veli kodu için bağlı öğrenci özetleri (denormalize). */
  linkedStudents?: { uid: string; displayName: string }[];
  /** Kodun geçerlilik bitiş zamanı (ms epoch). Boşsa süresiz. */
  expiresAt?: number;
}

export interface GeneratedCode {
  code: string;
  uid: string;
  role: CodeRole;
  displayName: string;
}

/**
 * Öğrenci veya veli için kod + gizli hesap üretir.
 * Auth kullanıcısı/profil/kod referansı server-side Admin SDK endpoint'inde
 * oluşturulur; istemci yalnız aktif öğretmenin ID token'ını gönderir.
 */
export async function createCodedAccount(
  input: GenerateCodeInput,
): Promise<GeneratedCode> {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");

  const response = await fetch("/api/admin/create-coded-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken,
      tenantId: input.tenantId,
      role: input.role,
      displayName: input.displayName,
      classId: input.classId,
      className: input.className,
      teacherName: input.teacherName,
      linkedStudentIds: input.linkedStudentIds,
      linkedStudents: input.linkedStudents,
      expiresAt: input.expiresAt,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as Partial<GeneratedCode> & {
    error?: string;
  };
  if (!response.ok || !payload.code || !payload.uid || !payload.role || !payload.displayName) {
    throw new Error(payload.error ?? "Kodlu hesap oluşturulamadı.");
  }
  return {
    code: payload.code,
    uid: payload.uid,
    role: payload.role,
    displayName: payload.displayName,
  };
}

export interface AccessCodeRecord {
  code: string;
  uid: string;
  role: CodeRole;
  displayName: string;
  classId?: string;
}

/** Öğretmenin ürettiği kodları listeler. */
export async function listMyCodes(
  tenantId: string,
  teacherUid: string,
): Promise<AccessCodeRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, tenantAccessCodes(tenantId)),
      where("createdBy", "==", teacherUid),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      code: String(data.code ?? d.id),
      uid: String(data.uid ?? ""),
      role: data.role as CodeRole,
      displayName: String(data.displayName ?? ""),
      classId: data.classId ? String(data.classId) : undefined,
    };
  });
}

/**
 * Kod ile giriş: kodu gizli email/şifreye çevirip ana oturumu açar.
 *
 * Güvenlik: yalnızca deterministik e-posta/şifreye güvenilmez. Giriş başarılı
 * olduktan SONRA kullanıcının kendi profili (`users/{uid}`) okunur ve hesap
 * aktif değilse ya da kodun süresi geçmişse oturum kapatılıp giriş reddedilir.
 * (Giriş öncesi kod araması anonim kullanıcıya kapalıdır; bu yüzden doğrulama
 * giriş sonrası, kullanıcının okuyabildiği kendi profili üzerinden yapılır.)
 *
 * Geçersiz kodda Firebase auth hatası fırlatır (çağıran Türkçeye çevirir).
 */
export async function signInWithCode(code: string): Promise<void> {
  if (!isFirebaseConfigured() || !auth || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const compact = code.trim().toUpperCase().replace(/[\s-]/g, "");
  if (!/^(OGR|VEL)[A-Z0-9]{6}$/.test(compact)) {
    throw { code: "auth/invalid-credential" };
  }
  const credential = await signInWithEmailAndPassword(
    auth,
    compactToEmail(compact),
    compactToPassword(compact),
  );

  // Giriş sonrası profil doğrulaması: aktif mi ve süresi geçmemiş mi?
  const snap = await getDoc(doc(db, userProfileDoc(credential.user.uid)));
  const profile = snap.exists() ? snap.data() : null;
  const active =
    profile != null &&
    profile.status === "ACTIVE" &&
    (profile.accessCodeStatus === undefined ||
      profile.accessCodeStatus === "ACTIVE");
  const notExpired =
    !profile?.accessCodeExpiresAt ||
    Date.now() <= Number(profile.accessCodeExpiresAt);

  if (!active || !notExpired) {
    await signOut(auth);
    throw { code: "auth/invalid-credential" };
  }
}
