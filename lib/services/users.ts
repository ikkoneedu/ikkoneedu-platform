/**
 * Personel/kullanıcı yönetim servisi (okul yöneticisi için).
 *
 * - createStaffAccount: öğretmen/müdür hesabını server-side Admin SDK endpoint'i
 *   üzerinden oluşturur ve geçici şifre döndürür.
 * - listTenantUsers: tenant'taki kullanıcıları listeler.
 */

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase/client";
import { userProfileDoc, usersRoot } from "@/lib/firebase/collections";
import { ROLES, type Role } from "@/lib/auth/role-constants";

export type StaffRole =
  | typeof ROLES.TEACHER
  | typeof ROLES.PRINCIPAL
  | typeof ROLES.VICE_PRINCIPAL
  | typeof ROLES.COORDINATOR
  | typeof ROLES.PR;

export interface CreateStaffInput {
  tenantId: string;
  createdBy: string;
  role: StaffRole;
  displayName: string;
  email: string;
}

export interface CreatedStaff {
  uid: string;
  email: string;
  tempPassword: string;
}

export interface CreateManagedAccountInput {
  tenantId: string;
  createdBy?: string;
  role: Role;
  displayName: string;
  email: string;
  /** Belirtilmezse schoolId = tenantId (okul başına tek tenant). */
  schoolId?: string;
}

async function currentIdToken(): Promise<string> {
  if (!auth?.currentUser) {
    throw new Error("Oturum bulunamadı. Lütfen tekrar giriş yapın.");
  }
  return auth.currentUser.getIdToken();
}

/**
 * Belirli rolde yönetilen hesap oluşturur (öğretmen, müdür, kurucu vb.).
 * Geçici şifre döndürür. Hesap artık client-side secondary Auth ile değil,
 * Admin SDK destekli `/api/admin/create-managed-account` endpoint'iyle açılır.
 */
export async function createManagedAccount(
  input: CreateManagedAccountInput,
): Promise<CreatedStaff> {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase yapılandırılmamış.");
  }

  const response = await fetch("/api/admin/create-managed-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      idToken: await currentIdToken(),
      tenantId: input.tenantId,
      schoolId: input.schoolId,
      role: input.role,
      displayName: input.displayName,
      email: input.email,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as Partial<CreatedStaff> & {
    error?: string;
  };
  if (!response.ok || !payload.uid || !payload.email || !payload.tempPassword) {
    throw new Error(payload.error ?? "Hesap oluşturulamadı.");
  }
  return {
    uid: payload.uid,
    email: payload.email,
    tempPassword: payload.tempPassword,
  };
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
      tenantId: String(data.tenantId ?? ""),
    };
  });
}
