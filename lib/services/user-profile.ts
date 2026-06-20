/**
 * Kullanıcı profili servisi — Firestore `users/{uid}` (MVP kök koleksiyon).
 *
 * İlk girişte tenantId bilinmediği için profil kök `users/{uid}` belgesinden
 * okunur. Profil yoksa `null` döner (graceful fallback); çağıran taraf güvenli
 * varsayılanlarla devam eder.
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { userProfileDoc } from "@/lib/firebase/collections";
import { ROLES } from "@/lib/auth/role-constants";
import type { UserProfile } from "@/lib/auth/firebase-auth-types";

/** Halk (genel kullanıcı) kayıtlarının bağlandığı sözde-tenant. */
export const PUBLIC_TENANT_ID = "public";

/**
 * `users/{uid}` profilini okur. Profil yoksa veya Firebase yapılandırılmamışsa
 * `null` döner. Ağ/erişim hatalarında da `null` dönerek akışı bozmaz.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!isFirebaseConfigured() || !db) return null;

  try {
    const snap = await getDoc(doc(db, userProfileDoc(uid)));
    if (!snap.exists()) return null;
    return { uid, ...(snap.data() as Omit<UserProfile, "uid">) };
  } catch {
    return null;
  }
}

/**
 * Halk (genel kullanıcı) için `users/{uid}` profil belgesi oluşturur.
 * Yalnızca PUBLIC rolü + public tenant ile yazılır (yetki yükseltme yok).
 * Güvenlik kuralları bu kısıtı zorunlu kılar.
 */
export async function createPublicUserProfile(
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await setDoc(doc(db, userProfileDoc(uid)), {
    uid,
    email,
    displayName,
    role: ROLES.PUBLIC,
    tenantId: PUBLIC_TENANT_ID,
    schoolId: PUBLIC_TENANT_ID,
    status: "ACTIVE",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
