import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { strongPassword } from "@/lib/auth/passwords";

export const runtime = "nodejs";

/**
 * Yedeklenmiş (silinmiş) bir kullanıcıyı geri yükler (SUNUCU, Admin SDK) —
 * yalnızca SUPER_ADMIN. Bkz. `/api/admin/delete-user`.
 *
 * AYNI uid ile yeni bir Auth hesabı oluşturulur ki tenant alt kayıtlarındaki
 * (student/parent/teacher) `userId` referansları otomatik çalışır kalsın.
 * Eski şifre kurtarılamaz (Firebase şifre hash'ini asla döndürmez); yeni bir
 * geçici şifre üretilir ve yalnızca bu yanıtta bir kez döner.
 *
 * İstek (POST): { idToken, targetUid }
 * Yanıt: { ok, email, tempPassword }
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

  let body: { idToken?: string; targetUid?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }
  const idToken = String(body.idToken ?? "");
  const targetUid = String(body.targetUid ?? "");
  if (!idToken || !targetUid) {
    return NextResponse.json({ ok: false, error: "Eksik parametre." }, { status: 400 });
  }

  let callerUid: string;
  try {
    callerUid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }

  const callerSnap = await adminDb.doc(`users/${callerUid}`).get();
  const caller = callerSnap.exists ? callerSnap.data() ?? {} : {};
  if (!callerSnap.exists || String(caller.status ?? "") !== "ACTIVE" || String(caller.role ?? "") !== "SUPER_ADMIN") {
    return NextResponse.json({ ok: false, error: "Bu işlem yalnızca süper admin tarafından yapılabilir." }, { status: 403 });
  }

  const backupRef = adminDb.doc(`deletedUsers/${targetUid}`);
  const backupSnap = await backupRef.get();
  if (!backupSnap.exists) {
    return NextResponse.json({ ok: false, error: "Yedek bulunamadı." }, { status: 404 });
  }
  const backup = backupSnap.data() ?? {};
  if (backup.restoredAt) {
    return NextResponse.json({ ok: false, error: "Bu kullanıcı zaten geri yüklenmiş." }, { status: 409 });
  }

  const email = String(backup.email ?? "");
  if (!email) {
    return NextResponse.json({ ok: false, error: "Yedekte e-posta bulunamadı." }, { status: 500 });
  }

  const password = strongPassword();
  try {
    await adminAuth.createUser({
      uid: targetUid,
      email,
      password,
      displayName: String(backup.displayName ?? email),
    });
  } catch (e) {
    const code = (e as { code?: string })?.code ?? "";
    if (code !== "auth/uid-already-exists" && code !== "auth/email-already-exists") {
      return NextResponse.json(
        { ok: false, error: `Auth hesabı oluşturulamadı: ${String((e as Error)?.message ?? e)}` },
        { status: 500 },
      );
    }
    // uid zaten varsa (ör. yarım kalmış önceki geri yükleme denemesi) devam et.
  }

  const { originalUid, deletedAt, deletedBy, deletedByName, restoredAt, ...profile } = backup;
  void originalUid;
  void deletedAt;
  void deletedBy;
  void deletedByName;
  void restoredAt;

  const now = new Date();
  await adminDb.doc(`users/${targetUid}`).set({
    ...profile,
    uid: targetUid,
    mustChangePassword: true,
    updatedAt: now,
  });
  await backupRef.set({ restoredAt: now, restoredBy: callerUid }, { merge: true });

  return NextResponse.json({ ok: true, email, tempPassword: password });
}
