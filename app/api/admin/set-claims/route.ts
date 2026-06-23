import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { ROLES, type Role } from "@/lib/auth/role-constants";

export const runtime = "nodejs";

const assignableRoles = Object.values(ROLES) as [Role, ...Role[]];

const setClaimsSchema = z.object({
  idToken: z.string().min(20, "idToken zorunludur."),
  targetUid: z.string().min(1, "targetUid zorunludur.").max(128),
  role: z.enum(assignableRoles),
  tenantId: z.string().min(1, "tenantId zorunludur.").max(120),
  schoolId: z.string().min(1).max(120).optional(),
});

type SetClaimsBody = z.infer<typeof setClaimsSchema>;

async function writeClaimAudit(
  adminDb: NonNullable<ReturnType<typeof getAdminDb>>,
  input: {
    actorId?: string;
    targetUid?: string;
    ok: boolean;
    reason?: string;
    body?: Partial<SetClaimsBody>;
  },
) {
  try {
    await adminDb.collection("platformAuditLogs").add({
      actorId: input.actorId ?? "",
      action: input.ok ? "admin.claims.set" : "admin.claims.set_denied",
      resource: input.targetUid ? `users/${input.targetUid}` : "users/unknown",
      meta: {
        ok: input.ok,
        reason: input.reason ?? "",
        role: input.body?.role ?? "",
        tenantId: input.body?.tenantId ?? "",
        schoolId: input.body?.schoolId ?? "",
      },
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // Audit best-effort: claim endpoint'inin asıl sonucunu audit yazımı bozmasın.
  }
}

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

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = setClaimsSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Geçersiz istek alanları.",
        details: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }
  const { idToken, targetUid, role, tenantId, schoolId } = parsed.data;

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
    await writeClaimAudit(adminDb, {
      actorId: callerUid,
      targetUid,
      ok: false,
      reason: "caller_not_super_admin",
      body: parsed.data,
    });
    return NextResponse.json(
      { error: "Bu işlem için SUPER_ADMIN yetkisi gerekir." },
      { status: 403 },
    );
  }

  // 3) Hedef Auth kullanıcısı ve tenant varlığını doğrula.
  try {
    await adminAuth.getUser(targetUid);
  } catch {
    await writeClaimAudit(adminDb, {
      actorId: callerUid,
      targetUid,
      ok: false,
      reason: "target_user_not_found",
      body: parsed.data,
    });
    return NextResponse.json({ error: "Hedef kullanıcı bulunamadı." }, { status: 404 });
  }

  if (tenantId !== "public" && tenantId !== "platform") {
    const tenantSnap = await adminDb.doc(`tenants/${tenantId}`).get();
    if (!tenantSnap.exists) {
      await writeClaimAudit(adminDb, {
        actorId: callerUid,
        targetUid,
        ok: false,
        reason: "tenant_not_found",
        body: parsed.data,
      });
      return NextResponse.json({ error: "Tenant/okul bulunamadı." }, { status: 404 });
    }
  }

  // 4) Hedef kullanıcıya claim ata.
  try {
    await adminAuth.setCustomUserClaims(targetUid, {
      role,
      tenantId,
      ...(schoolId ? { schoolId } : {}),
    });
    await writeClaimAudit(adminDb, {
      actorId: callerUid,
      targetUid,
      ok: true,
      body: parsed.data,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await writeClaimAudit(adminDb, {
      actorId: callerUid,
      targetUid,
      ok: false,
      reason: error instanceof Error ? error.message : "claim_set_failed",
      body: parsed.data,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Claim atanamadı." },
      { status: 500 },
    );
  }
}
