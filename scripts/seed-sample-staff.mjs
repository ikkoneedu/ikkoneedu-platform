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

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("HATA: FIREBASE_ADMIN_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY gerekli.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
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
