import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import {
  generateOtpCode,
  hashOtpCode,
  OTP_TTL_MS,
  OTP_RESEND_COOLDOWN_MS,
} from "@/lib/auth/otp";
import { sendEmail } from "@/lib/email/resend";
import { productName } from "@/lib/constants";

export const runtime = "nodejs";

/**
 * E-posta girişinin ikinci faktörü — şifre doğrulandıktan sonra 6 haneli kod
 * üretip kullanıcının e-postasına gönderir (SUNUCU, Admin SDK + Resend).
 *
 * Şifre sistemini DEĞİŞTİRMEZ; üzerine eklenir (bkz. `/login` sayfası akışı).
 *
 * İstek (POST): { idToken } — az önce şifreyle giriş yapmış kullanıcının token'ı.
 * Yanıt: { ok, mock? }
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

  let body: { idToken?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }
  const idToken = String(body.idToken ?? "");
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }

  const userSnap = await adminDb.doc(`users/${uid}`).get();
  if (!userSnap.exists) {
    return NextResponse.json({ ok: false, error: "Profil bulunamadı." }, { status: 403 });
  }
  const profile = userSnap.data() ?? {};
  const email = String(profile.email ?? "");
  if (!email) {
    return NextResponse.json({ ok: false, error: "Hesapta e-posta bulunamadı." }, { status: 400 });
  }

  // Soğuma: son 60 saniye içinde kod istendiyse tekrar gönderme (spam/maliyet önleme).
  const ref = adminDb.doc(`otpCodes/${uid}`);
  const existing = await ref.get();
  if (existing.exists) {
    const createdAtMs = (existing.data()?.createdAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
    if (Date.now() - createdAtMs < OTP_RESEND_COOLDOWN_MS) {
      return NextResponse.json(
        { ok: false, error: "Az önce bir kod gönderildi. Lütfen biraz bekleyin." },
        { status: 429 },
      );
    }
  }

  const code = generateOtpCode();
  const now = new Date();
  await ref.set({
    codeHash: hashOtpCode(code),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    attempts: 0,
    createdAt: now,
  });

  const result = await sendEmail({
    to: email,
    subject: `${productName} giriş doğrulama kodunuz: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:24px;">
        <h2 style="color:#0A2342;">${productName} giriş doğrulaması</h2>
        <p>Giriş yapmak için aşağıdaki 6 haneli kodu kullanın. Kod 5 dakika geçerlidir.</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#0A2342;">${code}</p>
        <p style="color:#666;font-size:13px;">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
      </div>
    `,
  });
  if (!result.ok) {
    // Gönderim başarısızsa kodu SİL — aksi halde kullanıcı, hiç kod gelmediği
    // hâlde 60sn soğuma süresine takılıp tekrar deneyemez (özellikle Resend
    // alan adı doğrulanmadan gönderim reddedildiğinde). Silince hemen yeniden
    // deneyebilir; başarılı gönderimde soğuma normal işler.
    await ref.delete().catch(() => {});
    return NextResponse.json({ ok: false, error: friendlyEmailError(result.error) }, { status: 502 });
  }

  // Mock modda (RESEND_API_KEY yok) + production DIŞINDA, geliştiricinin test
  // edebilmesi için kod yanıtta da döner. Production'da ASLA (gerçek e-posta
  // servisi yapılandırıldığında bu dal zaten çalışmaz — result.mock false olur).
  const devCode = result.mock && process.env.NODE_ENV !== "production" ? code : undefined;
  return NextResponse.json({ ok: true, mock: result.mock, devCode });
}

/**
 * Resend/e-posta hatalarını kullanıcı için anlaşılır Türkçe mesaja çevirir.
 * En yaygın üretim hatası, alan adı doğrulanmadan başka adrese gönderim
 * denemesidir ("you can only send testing emails to your own address").
 */
function friendlyEmailError(raw?: string): string {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("verify a domain") || s.includes("testing emails") || s.includes("own email")) {
    return "Doğrulama kodu e-postası gönderilemedi: e-posta alan adı henüz doğrulanmamış. Yönetici, e-posta servisinde (Resend) alan adı doğrulamasını tamamlamalı.";
  }
  return raw ?? "Doğrulama kodu e-postası gönderilemedi. Lütfen tekrar deneyin.";
}
