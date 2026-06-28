/**
 * Örnek personel + mesai programı oluşturur (TEST amaçlı).
 *
 * Çalıştırma (proje kökünde, Admin SDK env'leri tanımlıyken):
 *   FIREBASE_ADMIN_PROJECT_ID=... \
 *   FIREBASE_ADMIN_CLIENT_EMAIL=... \
 *   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" \
 *   node scripts/seed-sample-staff.mjs
 *
 * Opsiyonel: SAMPLE_TENANT_ID (varsayılan "ingiliz-kultur"),
 *            SAMPLE_EMAIL, SAMPLE_PASSWORD.
 *
 * Tekrar çalıştırılabilir (idempotent): kullanıcı varsa profili/şifreyi günceller.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Diğer admin script'leriyle aynı: .env.local'den FIREBASE_ADMIN_* yükle.
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
    /* .env.local yoksa ortam değişkenleriyle devam */
  }
}

loadEnvLocal();

// Kimlik bilgisi kaynağı:
//  1) İlk CLI argümanı bir service account .json yolu ise doğrudan oradan.
//  2) Aksi halde .env.local / ortam değişkenlerinden FIREBASE_ADMIN_*.
let projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
let clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

const jsonArg = process.argv[2];
if (jsonArg && jsonArg.endsWith(".json")) {
  try {
    const sa = JSON.parse(readFileSync(resolve(process.cwd(), jsonArg), "utf8"));
    projectId = sa.project_id || projectId;
    clientEmail = sa.client_email || clientEmail;
    privateKey = (sa.private_key || privateKey).replace(/\\n/g, "\n");
    console.log("• Kimlik bilgisi JSON'dan okundu:", jsonArg);
  } catch (e) {
    console.error("HATA: JSON okunamadı:", jsonArg, "-", e.message);
    process.exit(1);
  }
}

if (!projectId || !clientEmail || !privateKey) {
  console.error("HATA: Admin kimlik bilgileri eksik. Bulunanlar:");
  console.error("  FIREBASE_ADMIN_PROJECT_ID :", projectId ? "✓" : "✗ EKSİK");
  console.error("  FIREBASE_ADMIN_CLIENT_EMAIL:", clientEmail ? "✓" : "✗ EKSİK");
  console.error("  FIREBASE_ADMIN_PRIVATE_KEY :", privateKey ? "✓" : "✗ EKSİK");
  console.error("\nÇözüm 1 (JSON ile):  node scripts/seed-sample-staff.mjs ./serviceAccount.json");
  console.error("Çözüm 2 (.env.local): yukarıdaki 3 anahtarın .env.local'de TAM olduğundan emin olun.");
  process.exit(1);
}

console.log("• Proje :", projectId);
console.log("• Hesap :", clientEmail);

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

const auth = getAuth();
const db = getFirestore();

const tenantId = process.env.SAMPLE_TENANT_ID || "ingiliz-kultur";
const email = (process.env.SAMPLE_EMAIL || "ornek.personel@ingilizkultur.test").toLowerCase();
const password = process.env.SAMPLE_PASSWORD || "Ornek2026!";
const displayName = "Örnek Personel";
const role = "TEACHER";
const department = "akademik";

async function main() {
  // 1) Auth kullanıcısı (varsa yeniden kullan).
  let uid;
  try {
    const u = await auth.getUserByEmail(email);
    uid = u.uid;
    await auth.updateUser(uid, { password, displayName });
    console.log("• Mevcut kullanıcı güncellendi:", email);
  } catch {
    const u = await auth.createUser({ email, password, displayName });
    uid = u.uid;
    console.log("• Yeni kullanıcı oluşturuldu:", email);
  }

  // 2) Profil (users/{uid}).
  await db.doc(`users/${uid}`).set(
    {
      uid,
      email,
      displayName,
      role,
      tenantId,
      schoolId: tenantId,
      department,
      title: "İngilizce Öğretmeni",
      birthDate: "1990-05-15",
      phone: "0555 555 55 55",
      status: "ACTIVE",
      mustChangePassword: false,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    { merge: true },
  );

  // 3) Custom claims (role/tenant).
  await auth.setCustomUserClaims(uid, { role, tenantId, schoolId: tenantId });

  // 4) Mesai programı (09:00–17:00, Pzt–Cum, tolerans 0).
  await db.doc(`tenants/${tenantId}/staffSchedules/${uid}`).set(
    {
      uid,
      name: displayName,
      department,
      startTime: "09:00",
      endTime: "17:00",
      workdays: [1, 2, 3, 4, 5],
      graceMinutes: 0,
      leaveStart: "",
      leaveEnd: "",
      updatedBy: "seed-script",
      updatedAt: new Date(),
    },
    { merge: true },
  );

  console.log("\n✅ Örnek personel hazır.");
  console.log("   Tenant   :", tenantId);
  console.log("   E-posta  :", email);
  console.log("   Şifre    :", password);
  console.log("   Rol      :", role, "· Departman:", department);
  console.log("\nTest: bu hesapla giriş → 'Kimlik Kartım', 'QR Kartım'.");
  console.log("Yönetici hesabıyla → 'Mesai & İzin', 'Giriş-Çıkış Kayıtları'.");
  process.exit(0);
}

main().catch((e) => {
  console.error("HATA:", e);
  process.exit(1);
});
