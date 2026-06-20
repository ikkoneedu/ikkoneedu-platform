/**
 * Service account JSON → .env.local (FIREBASE_ADMIN_*) otomatik yazar.
 *
 * Kullanım (iki yol):
 *
 *   A) Dosya ile:
 *      node scripts/import-service-account.mjs ~/Downloads/serviceAccount.json
 *
 *   B) Yapıştırarak (stdin):
 *      node scripts/import-service-account.mjs
 *      # JSON'u yapıştır, sonra yeni satırda Ctrl+D
 *
 * .env.local içindeki mevcut FIREBASE_ADMIN_* satırlarını günc:
 * - FIREBASE_ADMIN_PROJECT_ID
 * - FIREBASE_ADMIN_CLIENT_EMAIL
 * - FIREBASE_ADMIN_PRIVATE_KEY  (tek satır, \n kaçışlı, tırnaklı)
 *
 * NOT: JSON dosyasını ve .env.local'i ASLA commit etmeyin (.gitignore'da).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function readStdin() {
  try {
    return readFileSync(0, "utf8"); // fd 0 = stdin
  } catch {
    return "";
  }
}

const fileArg = process.argv[2];
let raw = "";

if (fileArg) {
  try {
    raw = readFileSync(resolve(fileArg), "utf8");
  } catch {
    console.error(`❌ Dosya okunamadı: ${fileArg}`);
    process.exit(1);
  }
} else {
  console.error("📋 Service account JSON'u yapıştırın, sonra Ctrl+D'ye basın...\n");
  raw = readStdin();
}

if (!raw.trim()) {
  console.error("❌ Girdi boş. JSON dosyası verin veya yapıştırın.");
  process.exit(1);
}

let sa;
try {
  sa = JSON.parse(raw);
} catch {
  console.error("❌ Geçersiz JSON. Tüm dosya içeriğini eksiksiz yapıştırın.");
  process.exit(1);
}

const projectId = sa.project_id;
const clientEmail = sa.client_email;
const privateKey = sa.private_key;

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "❌ JSON'da project_id / client_email / private_key bulunamadı. Bu bir service account dosyası mı?",
  );
  process.exit(1);
}

if (sa.type !== "service_account") {
  console.error(
    '⚠️  Uyarı: "type" alanı "service_account" değil. Yine de devam ediliyor.',
  );
}

// Gerçek satır sonlarını \n kaçışına çevir (tek satır, tırnaklı saklanır).
const escapedKey = privateKey.replace(/\r?\n/g, "\\n");

const newLines = {
  FIREBASE_ADMIN_PROJECT_ID: projectId,
  FIREBASE_ADMIN_CLIENT_EMAIL: clientEmail,
  FIREBASE_ADMIN_PRIVATE_KEY: `"${escapedKey}"`,
};

const envPath = resolve(process.cwd(), ".env.local");
let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";

// Mevcut FIREBASE_ADMIN_* satırlarını kaldır.
content = content
  .split("\n")
  .filter((line) => !/^\s*FIREBASE_ADMIN_(PROJECT_ID|CLIENT_EMAIL|PRIVATE_KEY)\s*=/.test(line))
  .join("\n")
  .replace(/\n+$/, "");

const block =
  "\n\n# Firebase Admin SDK (service account) — import-service-account ile yazıldı\n" +
  Object.entries(newLines)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") +
  "\n";

writeFileSync(envPath, (content + block).replace(/^\n+/, ""), "utf8");

console.log("✅ .env.local güncellendi:");
console.log(`   FIREBASE_ADMIN_PROJECT_ID=${projectId}`);
console.log(`   FIREBASE_ADMIN_CLIENT_EMAIL=${clientEmail}`);
console.log("   FIREBASE_ADMIN_PRIVATE_KEY=*** (gizli, yazıldı)");
console.log("\nSonraki adım:");
console.log("   npm run firebase:set-claims -- d1do4bC10LZL8APg9hTuPfSLFEr1 SUPER_ADMIN system system");
