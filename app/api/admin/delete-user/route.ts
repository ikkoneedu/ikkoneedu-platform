import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * Kullanıcıyı YEDEKLEYEREK siler (SUNUCU, Admin SDK) — yalnızca SUPER_ADMIN.
 *
 * "Birinin eline geçerse sistem tamamen sıfırlanmasın" güvenliği:
 *  - Kendi hesabınızı silemezsiniz.
 *  - Sistemdeki SON aktif SUPER_ADMIN silinemez (tam kilitlenmeyi önler).
 *  - Silmeden ÖNCE profil `deletedUsers/{uid}` kök koleksiyonuna kopyalanır
 *    (bkz. `/api/admin/restore-user`) — Auth hesabı + Firestore profili
 *    kalıcı silinir ama veri bir yerde kalır, geri yüklenebilir.
 *  - Tenant alt koleksiyonlarındaki (student/parent/teacher) bağlı kayıtlara
 *    dokunulmaz — onlar kendi soft-delete/status mekanizmasını kullanır.
 *
 * İstek (POST): { idToken, targetUid }
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

  if (targetUid === callerUid) {
    return NextResponse.json({ ok: false, error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
  }

  const targetSnap = await adminDb.doc(`users/${targetUid}`).get();
  if (!targetSnap.exists) {
    return NextResponse.json({ ok: false, error: "Kullanıcı bulunamadı." }, { status: 404 });
  }
  const target = targetSnap.data() ?? {};

  if (String(target.role ?? "") === "SUPER_ADMIN") {
    const superAdmins = await adminDb
      .collection("users")
      .where("role", "==", "SUPER_ADMIN")
      .where("status", "==", "ACTIVE")
      .get();
    if (superAdmins.size <= 1) {
      return NextResponse.json(
        { ok: false, error: "Sistemdeki son süper admin silinemez." },
        { status: 400 },
      );
    }
  }

  const now = new Date();
  await adminDb.doc(`deletedUsers/${targetUid}`).set({
    ...target,
    originalUid: targetUid,
    deletedAt: now,
    deletedBy: callerUid,
    deletedByName: String(caller.displayName ?? ""),
    restoredAt: null,
  });

  try {
    await adminAuth.deleteUser(targetUid);
  } catch (e) {
    const code = (e as { code?: string })?.code ?? "";
    if (code !== "auth/user-not-found") {
      // Yedek zaten yazıldı; Auth silme başarısız olsa da profil silinmeden dur.
      return NextResponse.json(
        { ok: false, error: `Auth hesabı silinemedi: ${String((e as Error)?.message ?? e)}` },
        { status: 500 },
      );
    }
  }
  await adminDb.doc(`users/${targetUid}`).delete();

  return NextResponse.json({ ok: true });
}
