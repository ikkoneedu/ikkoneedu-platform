import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getAttendanceSecret, signAttendance } from "@/lib/attendance/sign";
import { buildAttendanceQR, dateStr } from "@/lib/attendance/token";

export const runtime = "nodejs";

/**
 * Personelin BUGÜNE ÖZEL imzalı QR token'ını döndürür.
 *
 * Token günlüktür: tarih sunucuda üretildiğinden dünkü ekran görüntüsü ertesi
 * gün geçersizdir. Yalnızca kimliği doğrulanmış kullanıcı KENDİ token'ını alır.
 *
 * İstek (POST): { idToken }
 * Yanıt: { ok, qr, uid, date }
 */
export async function POST(request: Request) {
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

  // Profil aktif mi? (askıya alınan personel QR alamaz)
  const snap = await adminDb.doc(`users/${uid}`).get();
  const data = snap.exists ? snap.data() ?? {} : {};
  if (!snap.exists || String(data.status ?? "") !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Hesap aktif değil." }, { status: 403 });
  }

  const date = dateStr(Date.now());
  const sig = signAttendance(secret, uid, date);
  const qr = buildAttendanceQR(uid, date, sig);

  return NextResponse.json({ ok: true, qr, uid, date });
}
