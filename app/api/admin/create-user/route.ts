import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";

export const runtime = "nodejs";

/**
 * Sunucu tarafı yönetilen kullanıcı oluşturma (Admin SDK).
 *
 * Üretim güvenliği: hesap oluşturma istemci SDK / ikincil app yerine burada,
 * çağıranın ID token'ı DOĞRULANARAK yapılır. Yetki Firestore profilinden
 * okunur; rol/tenant kısıtları sunucuda zorlanır.
 *
 * İstek (POST): {
 *   idToken, email, displayName, role, tenantId, schoolId?,
 *   link?: { kind: 'parent'|'teacher'|'student', recordId }
 * }
 * Yanıt: { ok, mode:'created'|'linked', uid, email, tempPassword? }
 * tempPassword YALNIZCA bir kez döner; Firestore'a ASLA yazılmaz.
 */

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGIT = "23456789";
const SYM = "!@#$%*?";

function strongPassword(): string {
  const all = ALPHA + LOWER + DIGIT + SYM;
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
  let out = pick(ALPHA) + pick(LOWER) + pick(DIGIT) + pick(SYM);
  for (let i = 0; i < 11; i += 1) out += pick(all);
  return out.split("").sort(() => Math.random() - 0.5).join("");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STAFF_CREATABLE = ["TEACHER", "PARENT", "STUDENT"];

/** Çağıran rolü, hedef rolü, aynı tenant mı → oluşturma izni var mı? */
function canCreate(callerRole: string, targetRole: string, sameTenant: boolean): boolean {
  if (callerRole === "SUPER_ADMIN") return true; // her rol, her tenant
  if (["SCHOOL_ADMIN", "FOUNDER", "PRINCIPAL"].includes(callerRole)) {
    // Yalnız kendi tenant'ında TEACHER/PARENT/STUDENT. SUPER/FOUNDER/SCHOOL_ADMIN OLAMAZ.
    return sameTenant && STAFF_CREATABLE.includes(targetRole);
  }
  return false;
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin SDK yapılandırılmamış (FIREBASE_ADMIN_* eksik)." },
      { status: 503 },
    );
  }
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ ok: false, error: "Servis kullanılamıyor." }, { status: 503 });
  }

  let body: {
    idToken?: string;
    email?: string;
    displayName?: string;
    role?: string;
    tenantId?: string;
    schoolId?: string;
    link?: { kind?: string; recordId?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const idToken = String(body.idToken ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  const displayName = String(body.displayName ?? "").trim();
  const role = String(body.role ?? "").trim();
  const tenantId = String(body.tenantId ?? "").trim();
  const schoolId = String(body.schoolId ?? "").trim() || tenantId;
  const link = body.link;

  if (!idToken) return NextResponse.json({ ok: false, error: "Kimlik doğrulanamadı." }, { status: 401 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Geçerli bir e-posta girin." }, { status: 400 });
  if (!role || !tenantId) return NextResponse.json({ ok: false, error: "Rol ve tenant zorunludur." }, { status: 400 });

  // 1) Çağıranı doğrula.
  let callerUid: string;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    callerUid = decoded.uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }

  // 2) Çağıran profilini oku.
  const callerSnap = await adminDb.doc(`users/${callerUid}`).get();
  if (!callerSnap.exists) {
    return NextResponse.json({ ok: false, error: "Yetki profili bulunamadı." }, { status: 403 });
  }
  const caller = callerSnap.data() ?? {};
  const callerRole = String(caller.role ?? "");
  const callerTenant = String(caller.tenantId ?? "");
  const callerStatus = String(caller.status ?? "");
  if (callerStatus !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Hesabınız aktif değil." }, { status: 403 });
  }

  // 3) Yetki kontrolü (rol + tenant).
  const sameTenant = callerTenant === tenantId;
  if (!canCreate(callerRole, role, sameTenant)) {
    return NextResponse.json(
      { ok: false, error: "Bu rolde/tenant'ta kullanıcı oluşturma yetkiniz yok." },
      { status: 403 },
    );
  }

  // 4) Bağ alanlarını (link) kayıttan türet — sunucu okur, istemciye güvenilmez.
  const linkFields: Record<string, unknown> = {};
  let recordPath: string | null = null;
  if (link?.kind && link.recordId) {
    const recId = String(link.recordId);
    if (link.kind === "parent") {
      recordPath = `tenants/${tenantId}/parents/${recId}`;
      const r = (await adminDb.doc(recordPath).get()).data() ?? {};
      linkFields.linkedParentId = recId;
      linkFields.linkedStudentIds = Array.isArray(r.linkedStudentIds) ? r.linkedStudentIds : [];
    } else if (link.kind === "teacher") {
      recordPath = `tenants/${tenantId}/teachers/${recId}`;
      const r = (await adminDb.doc(recordPath).get()).data() ?? {};
      linkFields.linkedTeacherId = recId;
      linkFields.classIds = Array.isArray(r.classIds) ? r.classIds : [];
    } else if (link.kind === "student") {
      recordPath = `tenants/${tenantId}/students/${recId}`;
      const r = (await adminDb.doc(recordPath).get()).data() ?? {};
      linkFields.linkedStudentId = recId;
      linkFields.classId = String(r.classId ?? "");
    }
  }

  const now = new Date();
  const profileBase = {
    email,
    displayName: displayName || email,
    role,
    tenantId,
    schoolId,
    status: "ACTIVE",
    mustChangePassword: true,
    createdBy: callerUid,
    ...linkFields,
    updatedAt: now,
  };

  // 5) Var olan e-posta → BAĞLAMA yolu (aynı tenant şartı).
  try {
    const existing = await adminAuth.getUserByEmail(email).catch(() => null);
    if (existing) {
      const existingProfileRef = adminDb.doc(`users/${existing.uid}`);
      const existingProfile = (await existingProfileRef.get()).data();
      if (!existingProfile || String(existingProfile.tenantId ?? "") !== tenantId) {
        return NextResponse.json(
          { ok: false, error: "Bu e-posta başka bir okula/hesaba ait; bağlanamadı." },
          { status: 409 },
        );
      }
      // Yalnız bağ alanlarını güncelle (rol/tenant/status DEĞİŞMEZ).
      await existingProfileRef.set({ ...linkFields, updatedAt: now }, { merge: true });
      if (recordPath) await adminDb.doc(recordPath).set({ userId: existing.uid, updatedAt: now }, { merge: true });
      return NextResponse.json({ ok: true, mode: "linked", uid: existing.uid, email });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Kullanıcı kontrolü başarısız." }, { status: 500 });
  }

  // 6) Yeni hesap oluştur (Auth) → profil → kayıt bağı. Hata olursa ROLLBACK.
  const password = strongPassword();
  let uid: string;
  try {
    const created = await adminAuth.createUser({ email, password, displayName: profileBase.displayName });
    uid = created.uid;
  } catch (err) {
    const code = (err as { code?: string })?.code ?? "";
    if (code === "auth/email-already-exists") {
      return NextResponse.json({ ok: false, error: "Bu e-posta zaten kullanımda." }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Hesap oluşturulamadı." }, { status: 500 });
  }

  try {
    await adminDb.doc(`users/${uid}`).set({ uid, ...profileBase, createdAt: now });
    if (recordPath) await adminDb.doc(recordPath).set({ userId: uid, updatedAt: now }, { merge: true });
  } catch {
    // Telafi: profil/bağ yazılamadıysa Auth hesabını sil.
    try {
      await adminAuth.deleteUser(uid);
    } catch {
      /* rollback başarısız olsa da hata bildir */
    }
    return NextResponse.json({ ok: false, error: "Profil yazılamadı; işlem geri alındı." }, { status: 500 });
  }

  // Custom claims (role + tenantId + schoolId) → kullanıcı token'ında taşınır.
  // En iyi çaba: profil zaten kayıtlı (kurallar profil get() ile çalışır), bu
  // yüzden claim atama başarısız olsa bile hesap çalışır; sonraki girişte/token
  // yenilemesinde claim etkin olur. Hatada işlemi BAŞARISIZ saymayız.
  try {
    await adminAuth.setCustomUserClaims(uid, { role, tenantId, schoolId });
  } catch {
    /* claim atanamadıysa profil otoritedir; sessizce devam */
  }

  return NextResponse.json({ ok: true, mode: "created", uid, email, tempPassword: password });
}
