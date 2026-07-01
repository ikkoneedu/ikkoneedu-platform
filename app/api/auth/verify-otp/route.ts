import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { verifyOtpCode, OTP_MAX_ATTEMPTS } from "@/lib/auth/otp";

export const runtime = "nodejs";

/**
 * E-posta girişinin ikinci faktörünü doğrular (SUNUCU, Admin SDK).
 * Bkz. `/api/auth/send-otp`.
 *
 * İstek (POST): { idToken, code }
 * Yanıt: { ok, error? }
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

  let body: { idToken?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }
  const idToken = String(body.idToken ?? "");
  const code = String(body.code ?? "").trim();
  if (!idToken || !code) {
    return NextResponse.json({ ok: false, error: "Kod gerekli." }, { status: 400 });
  }

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }

  const ref = adminDb.doc(`otpCodes/${uid}`);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ ok: false, error: "Önce yeni bir kod isteyin." }, { status: 404 });
  }
  const data = snap.data() ?? {};
  const expiresAtMs = (data.expiresAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
  const attempts = Number(data.attempts ?? 0);

  if (Date.now() > expiresAtMs) {
    await ref.delete();
    return NextResponse.json({ ok: false, error: "Kodun süresi doldu. Yeni bir kod isteyin." }, { status: 400 });
  }
  if (attempts >= OTP_MAX_ATTEMPTS) {
    await ref.delete();
    return NextResponse.json({ ok: false, error: "Çok fazla hatalı deneme. Yeni bir kod isteyin." }, { status: 429 });
  }

  const codeHash = String(data.codeHash ?? "");
  if (!verifyOtpCode(code, codeHash)) {
    await ref.set({ attempts: attempts + 1 }, { merge: true });
    return NextResponse.json({ ok: false, error: "Kod hatalı." }, { status: 400 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
