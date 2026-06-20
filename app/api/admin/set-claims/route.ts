import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * Bir kullanıcıya custom claims (role + tenantId) atar.
 *
 * Güvenlik: çağıranın ID token'ı doğrulanır ve Firestore profilinden
 * SUPER_ADMIN olduğu teyit edilir. Yalnızca SUPER_ADMIN claim atayabilir.
 *
 * İstek gövdesi: { idToken, targetUid, role, tenantId, schoolId? }
 */
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin SDK yapılandırılmamış (FIREBASE_ADMIN_* eksik)." },
      { status: 503 },
    );
  }

  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ error: "Admin SDK kullanılamıyor." }, { status: 503 });
  }

  let body: {
    idToken?: string;
    targetUid?: string;
    role?: string;
    tenantId?: string;
    schoolId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const { idToken, targetUid, role, tenantId, schoolId } = body;
  if (!idToken || !targetUid || !role || !tenantId) {
    return NextResponse.json(
      { error: "idToken, targetUid, role ve tenantId zorunludur." },
      { status: 400 },
    );
  }

  // 1) Çağıranı doğrula.
  let callerUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    callerUid = decoded.uid;
  } catch {
    return NextResponse.json({ error: "Kimlik doğrulanamadı." }, { status: 401 });
  }

  // 2) Çağıran SUPER_ADMIN mi? (Firestore profilinden)
  const callerSnap = await adminDb.doc(`users/${callerUid}`).get();
  if (!callerSnap.exists || callerSnap.get("role") !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Bu işlem için SUPER_ADMIN yetkisi gerekir." },
      { status: 403 },
    );
  }

  // 3) Hedef kullanıcıya claim ata.
  try {
    await adminAuth.setCustomUserClaims(targetUid, {
      role,
      tenantId,
      ...(schoolId ? { schoolId } : {}),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Claim atanamadı." },
      { status: 500 },
    );
  }
}
