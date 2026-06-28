import { NextResponse } from "next/server";
import { cert } from "firebase-admin/app";
import { isAdminConfigured, getAdminDb, readAdminCreds } from "@/lib/firebase/admin";
import { getAttendanceSecret } from "@/lib/attendance/sign";

export const runtime = "nodejs";

/**
 * Teşhis ucu (GİZLİ DEĞER İÇERMEZ) — sunucu ortamının doğru kurulup
 * kurulmadığını boolean'larla raporlar. Tarayıcıdan GET ile açılır.
 * Sorun çözülünce bu dosya silinebilir.
 */
export async function GET() {
  const creds = readAdminCreds();
  const source = process.env.FIREBASE_SERVICE_ACCOUNT?.trim()
    ? "FIREBASE_SERVICE_ACCOUNT (json)"
    : process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? "FIREBASE_ADMIN_* (üçlü)"
      : "yok";
  const pk = creds?.privateKey ?? "";

  const out: Record<string, unknown> = {
    credsSource: source,
    projectId: creds?.projectId ?? null,
    clientEmail: creds?.clientEmail ?? null,
    hasPrivateKey: pk.length > 0,
    privateKeyLength: pk.length,
    privateKeyStartsOk: pk.startsWith("-----BEGIN PRIVATE KEY-----"),
    privateKeyEndsOk: pk.trimEnd().endsWith("-----END PRIVATE KEY-----"),
    hasAttendanceSecret: Boolean(getAttendanceSecret()),
    adminConfigured: isAdminConfigured(),
  };

  // 1) Private key gerçekten parse oluyor mu? (gerçek hata mesajı — sır içermez)
  if (creds) {
    try {
      cert(creds);
      out.certParse = "ok";
    } catch (e) {
      out.certParse = `error: ${String((e as Error)?.message ?? e)}`;
    }
  } else {
    out.certParse = "kimlik bilgisi yok";
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
