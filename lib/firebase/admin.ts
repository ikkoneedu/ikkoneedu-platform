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

interface AdminCreds {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/**
 * Kimlik bilgisi kaynağı (öncelik sırası):
 *  1) FIREBASE_SERVICE_ACCOUNT — tüm service account JSON'u (TEK env, tek satır).
 *     Vercel'de çok satırlı private key derdini bitirir. ÖNERİLEN.
 *  2) FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY üçlüsü.
 */
export function readAdminCreds(): AdminCreds | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (json && json.trim()) {
    try {
      const sa = JSON.parse(json);
      if (sa.project_id && sa.client_email && sa.private_key) {
        return {
          projectId: String(sa.project_id),
          clientEmail: String(sa.client_email),
          privateKey: String(sa.private_key).replace(/\\n/g, "\n"),
        };
      }
    } catch {
      /* JSON bozuksa üçlüye düş */
    }
  }
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }
  return null;
}

export function isAdminConfigured(): boolean {
  return readAdminCreds() !== null;
}

function getAdminApp(): App | null {
  const creds = readAdminCreds();
  if (!creds) return null;
  const existing = getApps();
  if (existing.length) return existing[0];
  try {
    return initializeApp({ credential: cert(creds) });
  } catch (e) {
    // Bozuk private key vb. → çıplak 500 yerine null (çağıran 503 döner).
    console.error("[firebase-admin] init başarısız:", (e as Error)?.message ?? e);
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function getAdminDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}
