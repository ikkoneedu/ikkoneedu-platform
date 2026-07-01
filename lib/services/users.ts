/**
 * Personel/kullanıcı yönetim servisi (okul yöneticisi için).
 *
 * - createStaffAccount: öğretmen/müdür hesabı oluşturur (ikincil app ile,
 *   yöneticinin oturumu bozulmadan) ve geçici şifre döndürür.
 * - listTenantUsers: tenant'taki kullanıcıları listeler.
 *
 * Firebase Admin SDK kullanılmaz.
 */

import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase/client";
import { getSecondaryAuth } from "@/lib/firebase/secondary-app";
import { userProfileDoc, usersRoot } from "@/lib/firebase/collections";
import { ROLES, type Role } from "@/lib/auth/role-constants";

export type StaffRole =
  | typeof ROLES.TEACHER
  | typeof ROLES.PRINCIPAL
  | typeof ROLES.VICE_PRINCIPAL
  | typeof ROLES.COORDINATOR
  | typeof ROLES.PR
  | typeof ROLES.DRIVER;

const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function tempPassword(len = 10): string {
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += PASSWORD_ALPHABET[Math.floor(Math.random() * PASSWORD_ALPHABET.length)];
  }
  return out;
}

export interface CreateStaffInput {
  tenantId: string;
  createdBy: string;
  role: StaffRole;
  displayName: string;
  email: string;
  /** Personel departmanı (lib/staff/departments.ts). Opsiyonel. */
  department?: string;
}

export interface CreatedStaff {
  uid: string;
  email: string;
  tempPassword: string;
  /** Hoş geldin e-postası GERÇEKTEN gönderildiyse (mock değil) true. */
  emailSent?: boolean;
}

/**
 * Belirli rolde yönetilen hesap oluşturur (öğretmen, müdür, kurucu vb.).
 * Geçici şifre döndürür. Hesap gizli (ikincil) oturumda oluşturulur ki
 * işlemi yapan yöneticinin/süper adminin oturumu bozulmasın.
 */
export async function createManagedAccount(input: {
  tenantId: string;
  createdBy: string;
  role: Role;
  displayName: string;
  email: string;
  /** Belirtilmezse schoolId = tenantId (okul başına tek tenant). */
  schoolId?: string;
  /** Personel departmanı (lib/staff/departments.ts). Opsiyonel. */
  department?: string;
}): Promise<CreatedStaff> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const secondary = getSecondaryAuth();
  if (!secondary) throw new Error("Firebase yapılandırılmamış.");
  const database = db;

  const email = input.email.trim().toLowerCase();
  const password = tempPassword();

  // 1) Gizli (ikincil) oturumda hesabı oluştur.
  const credential = await createUserWithEmailAndPassword(
    secondary,
    email,
    password,
  );
  const uid = credential.user.uid;

  // 2) Profil belgesini ana oturumla (yönetici/süper admin) yaz.
  //    Profil yazımı başarısız olursa AUTH hesabını GERİ AL (rollback) ki
  //    profilsiz/yetkisiz bir hesap ortada kalmasın.
  try {
    await setDoc(doc(database, userProfileDoc(uid)), {
      uid,
      email,
      displayName: input.displayName,
      role: input.role,
      tenantId: input.tenantId,
      schoolId: input.schoolId ?? input.tenantId,
      department: input.department ?? "",
      status: "ACTIVE",
      // Geçici şifreyle açılan yönetilen hesap: ilk girişte şifre zorunlu değişir.
      mustChangePassword: true,
      createdBy: input.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    try {
      // İkincil oturumda hâlâ bu kullanıcı açık; hesabı sil (rollback).
      await credential.user.delete();
    } catch {
      /* rollback başarısız olsa da asıl hatayı yükselt */
    }
    throw error;
  }

  // 3) İkincil oturumu kapat.
  await signOut(secondary);

  // 4) Hoş geldin e-postası (giriş bilgileri) — EN İYİ ÇABA. E-posta gönderimi
  //    sunucuda olmalı (Resend server-only); bu yüzden ana oturumun (yönetici)
  //    idToken'ı ile /api/admin/send-welcome çağrılır. Gönderim başarısız olsa
  //    da hesap oluşturma başarılıdır (yönetici geçici şifreyi zaten görür).
  let emailSent = false;
  try {
    const token = await auth?.currentUser?.getIdToken();
    if (token) {
      const res = await fetch("/api/admin/send-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: token,
          email,
          tempPassword: password,
          displayName: input.displayName,
          role: input.role,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { sent?: boolean };
      emailSent = Boolean(data.sent);
    }
  } catch {
    /* e-posta kritik değil; sessizce devam */
  }

  return { uid, email, tempPassword: password, emailSent };
}

/**
 * Öğretmen/müdür hesabı oluşturur. Geçici şifre döndürür; yönetici bunu
 * personele iletir, personel /login'den e-posta + geçici şifre ile girer.
 */
export async function createStaffAccount(
  input: CreateStaffInput,
): Promise<CreatedStaff> {
  return createManagedAccount(input);
}

export interface TenantUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  status: string;
  /** Öğrenci/veli sınıfı (sınıf hedefli duyuru fan-out'u için). */
  classId: string;
  /** Personel departmanı (lib/staff/departments.ts). */
  department: string;
  /** İletişim telefonu (WhatsApp/iletişim için). */
  phone: string;
}

/** Tenant'taki kullanıcıları listeler (yalnızca personel erişebilir). */
export async function listTenantUsers(tenantId: string): Promise<TenantUser[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, usersRoot()), where("tenantId", "==", tenantId)),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: String(data.email ?? ""),
      displayName: String(data.displayName ?? ""),
      role: data.role as Role,
      status: String(data.status ?? ""),
      classId: String(data.classId ?? ""),
      department: String(data.department ?? ""),
      phone: String(data.phone ?? ""),
    };
  });
}

export type UserStatus = "ACTIVE" | "SUSPENDED";

/** Kullanıcı durumunu değiştirir (askıya alma / yeniden etkinleştirme). */
export async function setUserStatus(
  uid: string,
  status: UserStatus,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, userProfileDoc(uid)), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** Kullanıcının rolünü değiştirir. Kurallar yetki yükseltmeyi engeller. */
export async function setUserRole(uid: string, role: Role): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, userProfileDoc(uid)), {
    role,
    updatedAt: serverTimestamp(),
  });
}

export interface AllUser extends TenantUser {
  tenantId: string;
}

/** TÜM kullanıcıları listeler (yalnızca SUPER_ADMIN — kurallar zorunlu kılar). */
export async function listAllUsers(): Promise<AllUser[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(collection(db, usersRoot()));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: String(data.email ?? ""),
      displayName: String(data.displayName ?? ""),
      role: data.role as Role,
      status: String(data.status ?? ""),
      classId: String(data.classId ?? ""),
      department: String(data.department ?? ""),
      phone: String(data.phone ?? ""),
      tenantId: String(data.tenantId ?? ""),
    };
  });
}
