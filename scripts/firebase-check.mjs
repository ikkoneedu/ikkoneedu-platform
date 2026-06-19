/**
 * Firebase bağlantı testi (yerel).
 *
 * Kullanım (kendi bilgisayarınızda, proje kökünde):
 *   node scripts/firebase-check.mjs
 *
 * .env.local dosyasındaki NEXT_PUBLIC_FIREBASE_* değerlerini okur, Firebase'i
 * başlatır ve Firestore'a gerçek bir test yazımı/okuması dener. Sonucu raporlar.
 *
 * NOT: Bu script gizli bir şey commit etmez; .env.local'i yalnızca yerelde okur.
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

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log("\n🔎 Firebase yapılandırma kontrolü\n");
const required = ["apiKey", "authDomain", "projectId", "appId"];
let missing = false;
for (const [key, value] of Object.entries(config)) {
  const need = required.includes(key);
  const ok = Boolean(value);
  if (need && !ok) missing = true;
  console.log(
    `  ${ok ? "✓" : need ? "✗" : "○"} NEXT_PUBLIC_FIREBASE_${key
      .replace(/([A-Z])/g, "_$1")
      .toUpperCase()}: ${ok ? "dolu" : "boş"}${need ? "" : " (opsiyonel)"}`,
  );
}

if (missing) {
  console.error("\n❌ Zorunlu alanlar eksik. Mock Mod çalışır, Firebase bağlanmaz.\n");
  process.exit(1);
}

console.log("\n  projectId:", config.projectId);
console.log("\n⏳ Firestore'a test yazımı deneniyor...\n");

const { initializeApp } = await import("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp } = await import(
  "firebase/firestore"
);

const app = initializeApp(config);
const db = getFirestore(app);

const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Zaman aşımı (10sn)")), 10_000),
);

try {
  const ref = await Promise.race([
    addDoc(collection(db, "connectionTests"), {
      source: "firebase-check.mjs",
      createdAt: serverTimestamp(),
    }),
    timeout,
  ]);
  console.log("✅ BAĞLANTI BAŞARILI — Firestore'a yazıldı.");
  console.log("   Belge:", `connectionTests/${ref.id}`);
  console.log("   (Bu test belgesini Firebase Console'dan silebilirsiniz.)\n");
  process.exit(0);
} catch (error) {
  const code = error?.code ?? "";
  const message = error?.message ?? String(error);
  if (code === "permission-denied") {
    console.log("🟡 BAĞLANTI VAR ama Firestore kuralları yazmayı engelledi.");
    console.log("   (Bu da bağlı olduğunuz anlamına gelir; Security Rules sıkı.)");
    console.log("   Test için Firestore'u 'Test mode' ile açabilirsiniz.\n");
    process.exit(0);
  }
  console.error("❌ BAĞLANTI BAŞARISIZ");
  console.error("   Kod:", code || "(yok)");
  console.error("   Mesaj:", message);
  console.error(
    "\n   Olası nedenler: yanlış apiKey/projectId, Firestore henüz oluşturulmadı,\n" +
      "   veya internet/erişim engeli.\n",
  );
  process.exit(1);
}
