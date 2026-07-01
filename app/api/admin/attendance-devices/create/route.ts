import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { generateDeviceId, generateDeviceSecret, hashDeviceSecret } from "@/lib/attendance/device-auth";

export const runtime = "nodejs";

const MANAGEMENT_ROLES = [
  "SCHOOL_ADMIN", "FOUNDER", "PRINCIPAL", "VICE_PRINCIPAL", "COORDINATOR",
];

/**
 * Yeni kiosk cihazı (USB QR okuyucu terminali) etkinleştirir (SUNUCU, Admin SDK).
 *
 * Cihaz sırrı yalnızca BU YANITTA bir kez döner; Firestore'a yalnızca
 * SHA-256 özeti yazılır (bkz. `lib/attendance/device-auth.ts` — personel
 * geçici şifre desenidir, `lib/services/users.ts` ile aynı mantık).
 *
 * İstek (POST): { idToken, tenantId, name, location }
 * Yanıt: { ok, deviceId, secret, tenantId }
 */
export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Sunucu hatası: ${String((e as Error)?.message ?? e)}` },
      { status: 500 },
    );
  }
}

async function handle(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "Admin SDK yapılandırılmamış." }, { status: 503 });
  }
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ ok: false, error: "Servis kullanılamıyor." }, { status: 503 });
  }

  let body: { idToken?: string; tenantId?: string; name?: string; location?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }
  const idToken = String(body.idToken ?? "");
  const tenantId = String(body.tenantId ?? "").trim();
  const name = String(body.name ?? "").trim().slice(0, 80);
  const location = String(body.location ?? "").trim().slice(0, 80);
  if (!idToken) return NextResponse.json({ ok: false, error: "Kimlik doğrulanamadı." }, { status: 401 });
  if (!tenantId || !name) return NextResponse.json({ ok: false, error: "Okul ve cihaz adı zorunludur." }, { status: 400 });

  let callerUid: string;
  try {
    callerUid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }

  const callerSnap = await adminDb.doc(`users/${callerUid}`).get();
  const caller = callerSnap.exists ? callerSnap.data() ?? {} : {};
  const callerRole = String(caller.role ?? "");
  const callerTenant = String(caller.tenantId ?? "");
  const isSuper = callerRole === "SUPER_ADMIN";
  if (!callerSnap.exists || String(caller.status ?? "") !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Hesabınız aktif değil." }, { status: 403 });
  }
  if (!isSuper && (!MANAGEMENT_ROLES.includes(callerRole) || callerTenant !== tenantId)) {
    return NextResponse.json({ ok: false, error: "Cihaz etkinleştirme yetkiniz yok." }, { status: 403 });
  }

  const deviceId = generateDeviceId();
  const secret = generateDeviceSecret();
  const now = new Date();
  await adminDb.doc(`tenants/${tenantId}/attendanceDevices/${deviceId}`).set({
    tenantId,
    name,
    location: location || "main_gate",
    status: "active",
    secretHash: hashDeviceSecret(secret),
    createdBy: callerUid,
    lastUsedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ ok: true, deviceId, secret, tenantId });
}
