import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { sendEmail } from "@/lib/email/resend";
import { welcomeEmail } from "@/lib/email/templates";
import { ROLE_LABELS, type Role } from "@/lib/auth/role-constants";

export const runtime = "nodejs";

/**
 * Yeni oluşturulan bir hesaba "hoş geldin" (giriş bilgileri) e-postası gönderir.
 *
 * İstemci tarafı `createManagedAccount` (ikincil app ile hesap açar) bu uçtan
 * en iyi çabayla e-posta gönderir; e-posta gönderimi SUNUCUDA olmalı (Resend
 * `server-only`). Yetki: yalnız aktif personel/yönetici çağırabilir (spam/kötüye
 * kullanım engeli). Şifre istemcide zaten üretildiği için burada yalnızca iletilir.
 *
 * İstek (POST): { idToken, email, tempPassword, displayName, role }
 * Yanıt: { ok, sent } — sent, GERÇEK gönderim (mock değil) yapıldıysa true.
 */
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ ok: false, error: "Admin SDK yapılandırılmamış." }, { status: 503 });
  }
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ ok: false, error: "Servis kullanılamıyor." }, { status: 503 });
  }

  let body: {
    idToken?: string;
    email?: string;
    tempPassword?: string;
    displayName?: string;
    role?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const idToken = String(body.idToken ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const tempPassword = String(body.tempPassword ?? "");
  const displayName = String(body.displayName ?? "").trim() || email;
  const role = String(body.role ?? "");
  if (!idToken || !email || !tempPassword) {
    return NextResponse.json({ ok: false, error: "Eksik parametre." }, { status: 400 });
  }

  // Çağıranı doğrula — aktif ve hesap oluşturabilen bir personel/yönetici olmalı.
  let callerUid: string;
  try {
    callerUid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }
  const callerSnap = await adminDb.doc(`users/${callerUid}`).get();
  const caller = callerSnap.data() ?? {};
  const callerRole = String(caller.role ?? "");
  const ALLOWED = [
    "SUPER_ADMIN", "FOUNDER", "SCHOOL_ADMIN", "PRINCIPAL",
    "VICE_PRINCIPAL", "COORDINATOR", "PR", "SALES", "TEACHER",
  ];
  if (String(caller.status ?? "") !== "ACTIVE" || !ALLOWED.includes(callerRole)) {
    return NextResponse.json({ ok: false, error: "Yetkiniz yok." }, { status: 403 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
  const { subject, html } = welcomeEmail({
    displayName,
    email,
    tempPassword,
    roleLabel: ROLE_LABELS[role as Role] ?? role,
    loginUrl: appUrl ? `${appUrl}/login` : undefined,
  });
  const r = await sendEmail({ to: email, subject, html });
  return NextResponse.json({ ok: r.ok, sent: r.ok && !r.mock, error: r.error });
}
