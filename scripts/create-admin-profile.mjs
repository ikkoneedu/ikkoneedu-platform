/**
 * Admin kullanıcı profili oluşturma (yerel).
 *
 * Verilen Firebase Auth UID için Firestore `users/{uid}` belgesine bir
 * SUPER_ADMIN profili yazar. Firebase client env (.env.local) ile çalışır;
 * Firebase Admin SDK kullanmaz.
 *
 * Kullanım (proje kökünde):
 *   node scripts/create-admin-profile.mjs <UID> [email] [displayName]
 *   # veya: npm run firebase:create-admin-profile -- <UID>
 *
 * Örnek:
 *   node scripts/create-admin-profile.mjs abc123UID admin@ikkoneedu.com "IKKONEEDU Admin"
 *
 * NOT: UID'yi Firebase Console > Authentication > Users ekranından kopyalayın.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    console.error("❌ .env.local bulunamadı. Proje kökünde çalıştırın.");
    process.exit(1);
  }
}

loadEnvLocal();

const [, , uidArg, emailArg, displayNameArg] = process.argv;

if (!uidArg) {
  console.error(
    "❌ UID gerekli.\n   Kullanım: node scripts/create-admin-profile.mjs <UID> [email] [displayName]",
  );
  process.exit(1);
}

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!config.apiKey || !config.projectId || !config.appId) {
  console.error("❌ Firebase env eksik. .env.local içindeki NEXT_PUBLIC_FIREBASE_* değerlerini doldurun.");
  process.exit(1);
}

const email = emailArg ?? "admin@ikkoneedu.com";
const displayName = displayNameArg ?? "IKKONEEDU Admin";

console.log("\n🛠  Admin profili oluşturuluyor...\n");
console.log("   projectId:", config.projectId);
console.log("   uid:", uidArg);
console.log("   email:", email);
console.log("   role: SUPER_ADMIN\n");

const { initializeApp } = await import("firebase/app");
const { getFirestore, doc, setDoc, serverTimestamp } = await import(
  "firebase/firestore"
);

const app = initializeApp(config);
const db = getFirestore(app);

const profile = {
  uid: uidArg,
  email,
  displayName,
  role: "SUPER_ADMIN",
  tenantId: "system",
  schoolId: "system",
  status: "ACTIVE",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Zaman aşımı (10sn)")), 10_000),
);

try {
  await Promise.race([setDoc(doc(db, "users", uidArg), profile), timeout]);
  console.log("✅ Profil yazıldı: users/" + uidArg);
  console.log("   Artık bu kullanıcıyla /login'den giriş yapabilirsiniz.\n");
  process.exit(0);
} catch (error) {
  const code = error?.code ?? "";
  const message = error?.message ?? String(error);
  if (code === "permission-denied") {
    console.error("❌ İzin reddedildi. Firestore kuralları yazmayı engelliyor.");
    console.error("   Test için Firestore'u 'Test mode' ile açın veya kuralları güncelleyin.\n");
  } else {
    console.error("❌ Yazma başarısız.");
    console.error("   Kod:", code || "(yok)");
    console.error("   Mesaj:", message, "\n");
  }
  process.exit(1);
}
