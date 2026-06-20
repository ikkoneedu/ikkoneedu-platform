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
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { getSecondaryAuth } from "@/lib/firebase/secondary-app";
import { userProfileDoc, usersRoot } from "@/lib/firebase/collections";
import { ROLES, type Role } from "@/lib/auth/role-constants";

export type StaffRole = typeof ROLES.TEACHER | typeof ROLES.PRINCIPAL;

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
}

export interface CreatedStaff {
  uid: string;
  email: string;
  tempPassword: string;
}

/**
 * Öğretmen/müdür hesabı oluşturur. Geçici şifre döndürür; yönetici bunu
 * personele iletir, personel /login'den e-posta + geçici şifre ile girer.
 */
export async function createStaffAccount(
  input: CreateStaffInput,
): Promise<CreatedStaff> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const secondary = getSecondaryAuth();
  if (!secondary) throw new Error("Firebase yapılandırılmamış.");

  const email = input.email.trim().toLowerCase();
  const password = tempPassword();

  // 1) Gizli (ikincil) oturumda hesabı oluştur.
  const credential = await createUserWithEmailAndPassword(
    secondary,
    email,
    password,
  );
  const uid = credential.user.uid;

  // 2) Profil belgesini ana oturumla (yönetici) yaz.
  await setDoc(doc(db, userProfileDoc(uid)), {
    uid,
    email,
    displayName: input.displayName,
    role: input.role,
    tenantId: input.tenantId,
    schoolId: input.tenantId,
    status: "ACTIVE",
    createdBy: input.createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 3) İkincil oturumu kapat.
  await signOut(secondary);

  return { uid, email, tempPassword: password };
}

export interface TenantUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  status: string;
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
    };
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
      tenantId: String(data.tenantId ?? ""),
    };
  });
}
