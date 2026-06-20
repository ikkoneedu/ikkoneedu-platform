import "server-only";

/**
 * Firebase Admin SDK (yalnızca sunucu).
 *
 * Service account bilgileri `FIREBASE_ADMIN_*` ortam değişkenlerinden okunur
 * (NEXT_PUBLIC_ ÖNEKİ YOK — istemciye sızmaz). Değerler yoksa Admin SDK
 * başlatılmaz ve `null` döner; çağıran taraf buna göre davranır.
 *
 * Kurulum: docs/architecture/custom-claims.md
 */

import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY,
  );
}

function getAdminApp(): App | null {
  if (!isAdminConfigured()) return null;
  const existing = getApps();
  if (existing.length) return existing[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // .env içinde \n kaçışlı saklanan private key'i normalize et.
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
