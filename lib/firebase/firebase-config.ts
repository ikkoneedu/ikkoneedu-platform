/**
 * Firebase yapılandırması (hazırlık — kurulum YOK).
 *
 * Bu dosya henüz Firebase SDK'yı başlatmaz. Yalnızca env değişkenlerinden
 * okunacak yapılandırma şablonunu ve ileride kullanılacak başlatma planını
 * içerir. Gerçek entegrasyonda:
 *
 *   import { initializeApp, getApps } from "firebase/app";
 *   import { getAuth } from "firebase/auth";
 *   import { getFirestore } from "firebase/firestore";
 *
 *   export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
 *   export const auth = getAuth(app);
 *   export const db = getFirestore(app);
 *
 * API anahtarları yalnızca ortam değişkenlerinden okunur; koda gömülmez.
 */

export interface FirebaseConfig {
  projectId?: string;
  apiKey?: string;
  authDomain?: string;
  storageBucket?: string;
  appId?: string;
}

export const firebaseConfig: FirebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  apiKey: process.env.FIREBASE_API_KEY,
};

/** Firebase yapılandırmasının tamamlanıp tamamlanmadığını döner. */
export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.projectId && firebaseConfig.apiKey);
}
