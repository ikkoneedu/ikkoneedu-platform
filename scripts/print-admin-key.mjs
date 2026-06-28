/**
 * .env.local'deki FIREBASE_ADMIN_PRIVATE_KEY'i okur, doğrular ve Vercel'e
 * yapıştırılacak hâlini yazdırır. Sır REPODA TUTULMAZ; sadece kendi
 * terminalinde gösterilir.
 *
 * Kullanım: node scripts/print-admin-key.mjs
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
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!(k in process.env)) process.env[k] = v;
    }
  } catch {
    /* yoksa devam */
  }
}

loadEnvLocal();

const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (!raw) {
  console.error("✗ .env.local'de FIREBASE_ADMIN_PRIVATE_KEY yok.");
  process.exit(1);
}

const pem = raw.replace(/\\n/g, "\n").trim();
const ok =
  pem.startsWith("-----BEGIN PRIVATE KEY-----") &&
  pem.includes("-----END PRIVATE KEY-----");

console.log("Geçerli PEM mi:", ok ? "✓ EVET" : "✗ HAYIR (format bozuk!)");
console.log("Project ID  :", process.env.FIREBASE_ADMIN_PROJECT_ID || "(yok)");
console.log("Client email:", process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "(yok)");

console.log("\n========== VERCEL'E YAPIŞTIRILACAK (çok satırlı, tırnaksız) ==========\n");
console.log(pem);
console.log("\n====================================================================");
console.log("\nVercel → FIREBASE_ADMIN_PRIVATE_KEY değerine yukarıdaki bloğu");
console.log("(-----BEGIN ... -----END PRIVATE KEY----- dahil) TIRNAKSIZ yapıştır.");
