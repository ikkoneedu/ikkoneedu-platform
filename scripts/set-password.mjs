/**
 * Kullanıcı şifresi belirleme (yerel/Codespaces yönetim aracı).
 *
 * Bir kullanıcının (e-posta veya UID ile) Firebase Auth şifresini Admin SDK ile
 * doğrudan ayarlar. E-posta erişimi gerektirmez (Console reset e-postasına
 * alternatif). İlk yönetici şifresini bilmiyorsanız/kaybettiyseniz kullanın.
 *
 * Kullanım (proje kökünde):
 *   node scripts/set-password.mjs <email|uid> '<YeniSifre>'
 *   # veya: npm run firebase:set-password -- admin@ikkoneedu.com 'Guclu!Parola1'
 *
 * NOT: Service account anahtarı gerektirir (.env.local içindeki FIREBASE_ADMIN_*).
 *      Şifre en az 6 karakter olmalı. Şifreyi terminal geçmişinde bırakmamak için
 *      sonrasında geçmişi temizlemeyi düşünün.
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

const [, , identifier, newPassword] = process.argv;
if (!identifier || !newPassword) {
  console.error(
    "❌ Kullanım: node scripts/set-password.mjs <email|uid> '<YeniSifre>'",
  );
  process.exit(1);
}
if (newPassword.length < 6) {
  console.error("❌ Şifre en az 6 karakter olmalı.");
  process.exit(1);
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "❌ FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY eksik.",
  );
  process.exit(1);
}

const { initializeApp, cert } = await import("firebase-admin/app");
const { getAuth } = await import("firebase-admin/auth");

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);

try {
  // E-posta mı UID mi olduğunu çöz.
  const user = identifier.includes("@")
    ? await auth.getUserByEmail(identifier)
    : await auth.getUser(identifier);

  await auth.updateUser(user.uid, { password: newPassword });
  console.log("✅ Şifre güncellendi:", user.email ?? user.uid);
  console.log("   Bu hesapla /login üzerinden yeni şifreyle giriş yapabilirsiniz.");
  process.exit(0);
} catch (error) {
  console.error("❌ Hata:", error?.message ?? error);
  process.exit(1);
}
