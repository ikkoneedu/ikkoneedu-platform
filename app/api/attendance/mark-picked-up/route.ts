import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

const MANAGEMENT_ROLES = [
  "SCHOOL_ADMIN", "FOUNDER", "PRINCIPAL", "VICE_PRINCIPAL", "COORDINATOR", "SUPPORT",
];

/**
 * Bekleme odası / çağırma ekranından "Teslim Edildi" onayı (SUNUCU, Admin SDK).
 *
 * Yalnızca sınıfın öğretmeni (kendi sınıfı) veya yönetim/danışma (SUPPORT)
 * bir öğrenciyi "velisi bekliyor" durumundan "teslim edildi"ye geçirebilir.
 * İstemci `studentAttendanceLogs`'a doğrudan yazamaz (kurallar `write: false`).
 *
 * İstek (POST): { idToken, logId }
 * Yanıt: { ok }
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

  let body: { idToken?: string; logId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }
  const idToken = String(body.idToken ?? "");
  const logId = String(body.logId ?? "");
  if (!idToken || !logId) {
    return NextResponse.json({ ok: false, error: "Eksik parametre." }, { status: 400 });
  }

  let operatorUid: string;
  try {
    operatorUid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }
  const opSnap = await adminDb.doc(`users/${operatorUid}`).get();
  const op = opSnap.exists ? opSnap.data() ?? {} : {};
  const opRole = String(op.role ?? "");
  const opTenant = String(op.tenantId ?? "");
  const opStatus = String(op.status ?? "");
  const isSuper = opRole === "SUPER_ADMIN";
  if (!opSnap.exists || opStatus !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Yetkili personel değilsiniz." }, { status: 403 });
  }

  const ref = adminDb.doc(`tenants/${opTenant}/studentAttendanceLogs/${logId}`);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ ok: false, error: "Kayıt bulunamadı." }, { status: 404 });
  }
  const log = snap.data() ?? {};
  if (String(log.status ?? "") !== "awaiting_pickup") {
    return NextResponse.json({ ok: false, error: "Bu öğrenci şu anda bekleme durumunda değil." }, { status: 409 });
  }

  const isManagement = isSuper || MANAGEMENT_ROLES.includes(opRole);
  const isOwnClassTeacher =
    opRole === "TEACHER" &&
    Array.isArray(op.classIds) &&
    op.classIds.includes(String(log.classId ?? ""));
  if (!isManagement && !isOwnClassTeacher) {
    return NextResponse.json({ ok: false, error: "Bu öğrenciyi teslim etme yetkiniz yok." }, { status: 403 });
  }

  await ref.set(
    { status: "picked_up", pickedUpAt: new Date(), pickedUpBy: operatorUid, updatedAt: new Date() },
    { merge: true },
  );
  return NextResponse.json({ ok: true });
}
