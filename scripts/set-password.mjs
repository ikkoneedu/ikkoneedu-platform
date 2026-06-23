/**
 * Admin hesabı şifre/profil/claim bootstrap aracı.
 *
 * Kullanım:
 *   npm run firebase:set-password -- admin@ikkoneedu.com 'yeni-sifre'
 *
 * Bu script yalnızca Admin SDK kullanır; Firestore security rules'a takılmaz.
 * Vercel ile lokal aynı Firebase projesine bağlıysa, bu komuttan sonra aynı
 * hesap Vercel'de de giriş yapabilmelidir.
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

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ ${key} eksik.`);
    process.exit(1);
  }
  return value;
}

loadEnvLocal();

const [, , emailArg, passwordArg] = process.argv;
const email = emailArg?.trim().toLowerCase();
const password = passwordArg?.trim();

if (!email || !password) {
  console.error("❌ Kullanım: npm run firebase:set-password -- <email> <password>");
  process.exit(1);
}

if (password.length < 6) {
  console.error("❌ Firebase şifreleri en az 6 karakter olmalıdır.");
  process.exit(1);
}

const projectId = requireEnv("FIREBASE_ADMIN_PROJECT_ID");
const clientEmail = requireEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
const privateKey = requireEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n");

const { initializeApp, cert } = await import("firebase-admin/app");
const { getAuth } = await import("firebase-admin/auth");
const { getFirestore, FieldValue } = await import("firebase-admin/firestore");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app);

try {
  const user = await auth.getUserByEmail(email);
  const claims = {
    ...(user.customClaims ?? {}),
    role: "SUPER_ADMIN",
    tenantId: "system",
    schoolId: "system",
  };

  await auth.updateUser(user.uid, {
    password,
    disabled: false,
    emailVerified: true,
  });
  await auth.setCustomUserClaims(user.uid, claims);
  await db.collection("users").doc(user.uid).set(
    {
      uid: user.uid,
      email,
      displayName: user.displayName ?? "İkkoneEdu Admin",
      role: "SUPER_ADMIN",
      tenantId: "system",
      schoolId: "system",
      status: "ACTIVE",
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`✅ Şifre güncellendi: ${email}`);
  console.log(`   Firebase Admin Project: ${projectId}`);
  console.log(`   UID: ${user.uid}`);
  console.log("   Profil ve SUPER_ADMIN claim eşitlendi.");
  console.log("   Vercel aynı Firebase projesine bağlıysa /login üzerinden bu şifreyle giriş yapılır.");
  process.exit(0);
} catch (error) {
  console.error("❌ Hata:", error?.message ?? error);
  process.exit(1);
}
