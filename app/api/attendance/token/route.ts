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
 * Yanıt: { ok, uid, date, qrIn, qrOut } — giriş ve çıkış için ayrı imzalı QR.
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
  let data: Record<string, unknown> = {};
  try {
    const snap = await adminDb.doc(`users/${uid}`).get();
    if (!snap.exists) {
      return NextResponse.json({ ok: false, error: "Profil bulunamadı." }, { status: 403 });
    }
    data = snap.data() ?? {};
  } catch (e) {
    // Çoğunlukla sunucu service account'unun Firestore IAM yetkisi eksik.
    return NextResponse.json(
      { ok: false, error: `Sunucu Firestore'a erişemedi: ${String((e as Error)?.message ?? e)}` },
      { status: 502 },
    );
  }
  if (String(data.status ?? "") !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Hesap aktif değil." }, { status: 403 });
  }

  const date = dateStr(Date.now());
  const qrIn = buildAttendanceQR(uid, date, "in", signAttendance(secret, uid, date, "in"));
  const qrOut = buildAttendanceQR(uid, date, "out", signAttendance(secret, uid, date, "out"));

  return NextResponse.json({ ok: true, uid, date, qrIn, qrOut });
}
