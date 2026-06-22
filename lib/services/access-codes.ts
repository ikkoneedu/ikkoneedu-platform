/**
 * Erişim kodu servisi — öğretmenin öğrenci/veli hesaplarını kod ile üretmesi.
 *
 * Mimari (Admin SDK yok):
 * - Öğretmen kod üretir → ikincil Firebase app ile gizli bir email/şifre hesabı
 *   oluşturulur (öğretmenin oturumu bozulmaz).
 * - Profil (`users/{uid}`) öğretmenin ana oturumuyla yazılır; kurallar
 *   öğretmenin STUDENT/PARENT profili oluşturmasına izin verir.
 * - Veli/öğrenci, kodu girince kod → email/şifre türetilir ve gerçek Firebase
 *   Auth oturumu açılır (`signInWithCode`).
 *
 * Kod = kimlik bilgisidir; öğretmen fiziksel olarak veli/öğrenciye verir.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase/client";
import { getSecondaryAuth } from "@/lib/firebase/secondary-app";
import {
  userProfileDoc,
  accessCodeDoc,
  tenantClasses,
  tenantAccessCodes,
} from "@/lib/firebase/collections";
import { ROLES } from "@/lib/auth/role-constants";

/** Okunaklı kod alfabesi (karışan 0/O, 1/I yok). */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_DOMAIN = "codes.ikkoneedu.app";

function randomCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

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
 * Öğretmenin ana oturumu bozulmaz (ikincil app kullanılır).
 */
export async function createCodedAccount(
  input: GenerateCodeInput,
): Promise<GeneratedCode> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const secondary = getSecondaryAuth();
  if (!secondary) throw new Error("Firebase yapılandırılmamış.");

  const prefix = input.role === ROLES.STUDENT ? "OGR" : "VEL";
  const compact = `${prefix}${randomCode(6)}`;
  const code = `${prefix}-${compact.slice(prefix.length)}`;
  const email = compactToEmail(compact);
  const password = compactToPassword(compact);

  // 1) Gizli hesabı ikincil app'te oluştur.
  const credential = await createUserWithEmailAndPassword(
    secondary,
    email,
    password,
  );
  const uid = credential.user.uid;

  // 2) Profil belgesini ana oturumla (öğretmen) yaz.
  await setDoc(doc(db, userProfileDoc(uid)), {
    uid,
    email,
    displayName: input.displayName,
    role: input.role,
    tenantId: input.tenantId,
    schoolId: input.tenantId,
    status: "ACTIVE",
    createdBy: input.teacherUid,
    ...(input.teacherName ? { createdByName: input.teacherName } : {}),
    accessCode: code,
    // Kod kimlik bilgisidir; durum/son kullanma profilde tutulur ve giriş
    // sonrası doğrulanır (yalnızca deterministik e-posta/şifreye güvenilmez).
    accessCodeStatus: "ACTIVE",
    ...(input.expiresAt ? { accessCodeExpiresAt: input.expiresAt } : {}),
    linkedStudentIds: input.linkedStudentIds ?? [],
    linkedStudents: input.linkedStudents ?? [],
    ...(input.classId ? { classId: input.classId } : {}),
    ...(input.className ? { className: input.className } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 3) Kod referansını yaz (öğretmenin listeleyebilmesi için).
  await setDoc(doc(db, accessCodeDoc(input.tenantId, code)), {
    code,
    uid,
    role: input.role,
    displayName: input.displayName,
    createdBy: input.teacherUid,
    status: "ACTIVE",
    ...(input.expiresAt ? { expiresAt: input.expiresAt } : {}),
    ...(input.classId ? { classId: input.classId } : {}),
    createdAt: serverTimestamp(),
  });

  // 4) İkincil oturumu kapat (öğretmen oturumu zaten ana app'te dokunulmadı).
  await signOut(secondary);

  return { code, uid, role: input.role, displayName: input.displayName };
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
