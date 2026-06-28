import { NextResponse } from "next/server";
import { cert } from "firebase-admin/app";
import { isAdminConfigured, getAdminDb } from "@/lib/firebase/admin";
import { getAttendanceSecret } from "@/lib/attendance/sign";

export const runtime = "nodejs";

/**
 * Teşhis ucu (GİZLİ DEĞER İÇERMEZ) — sunucu ortamının doğru kurulup
 * kurulmadığını boolean'larla raporlar. Tarayıcıdan GET ile açılır.
 * Sorun çözülünce bu dosya silinebilir.
 */
export async function GET() {
  const pk = process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "";
  const norm = pk.replace(/\\n/g, "\n");

  const out: Record<string, unknown> = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? null,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? null,
    hasPrivateKey: pk.length > 0,
    privateKeyLength: pk.length,
    privateKeyStartsOk: norm.startsWith("-----BEGIN PRIVATE KEY-----"),
    privateKeyEndsOk: norm.trimEnd().endsWith("-----END PRIVATE KEY-----"),
    hasAttendanceSecret: Boolean(getAttendanceSecret()),
    adminConfigured: isAdminConfigured(),
  };

  // 1) Private key gerçekten parse oluyor mu? (gerçek hata mesajı — sır içermez)
  try {
    cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: norm,
    });
    out.certParse = "ok";
  } catch (e) {
    out.certParse = `error: ${String((e as Error)?.message ?? e)}`;
  }

  // 2) Firestore okunabiliyor mu? (IAM testi)
  try {
    const db = getAdminDb();
    if (!db) {
      out.firestore = "admin init null";
    } else {
      await db.collection("tenants").limit(1).get();
      out.firestore = "ok";
    }
  } catch (e) {
    out.firestore = `error: ${String((e as Error)?.message ?? e)}`;
  }

  return NextResponse.json(out, { status: 200 });
}
