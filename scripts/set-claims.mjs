/**
 * Custom claims atama (yerel, bootstrap).
 *
 * İlk SUPER_ADMIN'e (veya herhangi bir kullanıcıya) role + tenantId claim'i
 * atar. Service account ile çalışır (FIREBASE_ADMIN_* .env.local'den).
 *
 * Kullanım:
 *   node scripts/set-claims.mjs <UID> <ROLE> <TENANT_ID> [SCHOOL_ID]
 *   # npm run firebase:set-claims -- <UID> SUPER_ADMIN system system
 *
 * NOT: Bu, sunucu/yerel bir araçtır; service account anahtarı gerektirir.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let value = t.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    console.error("❌ .env.local bulunamadı.");
    process.exit(1);
  }
}

loadEnvLocal();

const [, , uid, role, tenantId, schoolId] = process.argv;
if (!uid || !role || !tenantId) {
  console.error(
    "❌ Kullanım: node scripts/set-claims.mjs <UID> <ROLE> <TENANT_ID> [SCHOOL_ID]",
  );
  process.exit(1);
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "❌ FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY eksik.\n" +
      "   Firebase Console > Project Settings > Service accounts > Generate new private key.",
  );
  process.exit(1);
}

const { initializeApp, cert } = await import("firebase-admin/app");
const { getAuth } = await import("firebase-admin/auth");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);

const claims = { role, tenantId, ...(schoolId ? { schoolId } : {}) };

try {
  await auth.setCustomUserClaims(uid, claims);
  console.log("✅ Claim atandı:", uid);
  console.log("   ", JSON.stringify(claims));
  console.log("   Kullanıcı bir sonraki girişte (veya token yenilenince) etkili olur.");
  process.exit(0);
} catch (error) {
  console.error("❌ Hata:", error?.message ?? error);
  process.exit(1);
}
