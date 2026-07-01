import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getAttendanceSecret, signParentAttendance } from "@/lib/attendance/sign";
import { buildParentAttendanceQR, oneYearValidity } from "@/lib/attendance/token";

export const runtime = "nodejs";

/**
 * Velinin YIL BOYU SABİT imzalı QR token'ını döndürür.
 *
 * Personel QR'ının aksine günlük değil, ~1 yıl geçerlidir (bkz.
 * `oneYearValidity`) ve aksiyon (giriş/çıkış) taşımaz — okul girişinde
 * okutulduğunda `/api/attendance/student-scan` hangi öğrenci(ler)e ait
 * olduğunu `linkedStudentIds` üzerinden otomatik bulur.
 *
 * İstek (POST): { idToken }
 * Yanıt: { ok, uid, expiresDate, qr }
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
    return NextResponse.json(
      { ok: false, error: "Admin SDK yapılandırılmamış (FIREBASE_ADMIN_* eksik)." },
      { status: 503 },
    );
  }
  const secret = getAttendanceSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "ATTENDANCE_QR_SECRET tanımlı değil (sunucu)." },
      { status: 503 },
    );
  }
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ ok: false, error: "Servis kullanılamıyor." }, { status: 503 });
  }

  let body: { idToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }
  const idToken = String(body.idToken ?? "");
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Kimlik doğrulanamadı." }, { status: 401 });
  }

  let uid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }

  let data: Record<string, unknown> = {};
  try {
    const snap = await adminDb.doc(`users/${uid}`).get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Profil bulunamadı." }, { status: 403 });
    }
    data = snap.data() ?? {};
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Sunucu Firestore'a erişemedi: ${String((e as Error)?.message ?? e)}` },
      { status: 502 },
    );
  }
  if (String(data.status ?? "") !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Hesap aktif değil." }, { status: 403 });
  }
  if (String(data.role ?? "") !== "PARENT") {
    return NextResponse.json({ ok: false, error: "Bu QR yalnızca veli hesapları içindir." }, { status: 403 });
  }
  const linkedStudentIds = Array.isArray(data.linkedStudentIds) ? data.linkedStudentIds : [];
  if (linkedStudentIds.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Bu veliye bağlı öğrenci bulunamadı. Okul yönetimiyle iletişime geçin." },
      { status: 409 },
    );
  }

  const expiresDate = oneYearValidity(Date.now());
  const qr = buildParentAttendanceQR(uid, expiresDate, signParentAttendance(secret, uid, expiresDate));

  return NextResponse.json({ ok: true, uid, expiresDate, qr });
}
