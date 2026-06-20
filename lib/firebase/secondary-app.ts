/**
 * İkincil Firebase uygulaması (account creation için).
 *
 * Öğretmen, öğrenci/veli hesabı oluştururken `createUserWithEmailAndPassword`
 * MEVCUT oturumu (öğretmenin oturumunu) yeni kullanıcıya çevirir. Bunu önlemek
 * için ayrı (ikincil) bir Firebase Auth örneği kullanılır: yeni hesap burada
 * oluşturulur, profil ana Firestore ile yazılır, sonra ikincil oturum kapatılır.
 * Öğretmenin ana oturumu hiç bozulmaz.
 *
 * Firebase Admin SDK kullanılmaz.
 */

import { initializeApp, getApps, getApp, deleteApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/client";

const SECONDARY_APP_NAME = "ikkoneedu-secondary";

/** İkincil Firebase Auth örneğini döndürür (yoksa oluşturur). */
export function getSecondaryAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  const app: FirebaseApp = existing ?? initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  return getAuth(app);
}

/** İkincil uygulamayı tamamen kaldırır (temizlik; opsiyonel). */
export async function disposeSecondaryApp(): Promise<void> {
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  if (existing) {
    try {
      await deleteApp(existing);
    } catch {
      // sessizce geç
    }
  } else {
    // getApp ile garanti
    try {
      await deleteApp(getApp(SECONDARY_APP_NAME));
    } catch {
      // yok
    }
  }
}
