/**
 * Kullanıcı profili servisi — Firestore `users/{uid}` (MVP kök koleksiyon).
 *
 * İlk girişte tenantId bilinmediği için profil kök `users/{uid}` belgesinden
 * okunur. Profil yoksa `null` döner (graceful fallback); çağıran taraf güvenli
 * varsayılanlarla devam eder.
 */

import { doc, getDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { userProfileDoc } from "@/lib/firebase/collections";
import type { UserProfile } from "@/lib/auth/firebase-auth-types";

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
