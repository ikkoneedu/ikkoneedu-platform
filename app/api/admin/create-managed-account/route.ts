import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { ROLES, type Role } from "@/lib/auth/role-constants";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALL_ROLES = Object.values(ROLES) as [Role, ...Role[]];
const SCHOOL_MANAGER_ROLES = new Set<string>([
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.SUPER_ADMIN,
]);
const SCHOOL_ASSIGNABLE_ROLES = new Set<string>([
  ROLES.TEACHER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.PR,
]);
const SUPER_ASSIGNABLE_ROLES = new Set<string>([
  ...SCHOOL_ASSIGNABLE_ROLES,
  ROLES.FOUNDER,
  ROLES.SCHOOL_ADMIN,
  ROLES.SUPPORT,
  ROLES.SALES,
]);

const createManagedSchema = z.object({
  idToken: z.string().min(20),
  tenantId: z.string().min(1).max(120),
  schoolId: z.string().min(1).max(120).optional(),
  role: z.enum(ALL_ROLES),
  displayName: z.string().trim().min(1).max(160),
  email: z.string().trim().toLowerCase().regex(EMAIL_RE, "Geçerli bir e-posta girin."),
});

type CreateManagedBody = z.infer<typeof createManagedSchema>;

const PW_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PW_LOWER = "abcdefghijkmnpqrstuvwxyz";
const PW_DIGIT = "23456789";
const PW_SYMBOL = "!@#$%*?";

function strongPassword(): string {
  const all = PW_UPPER + PW_LOWER + PW_DIGIT + PW_SYMBOL;
  const pick = (set: string) => set[randomInt(set.length)];
  let out = pick(PW_UPPER) + pick(PW_LOWER) + pick(PW_DIGIT) + pick(PW_SYMBOL);
  for (let i = 0; i < 10; i += 1) out += pick(all);
  return out
    .split("")
    .sort(() => randomInt(3) - 1)
    .join("");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function writeAudit(
  db: Firestore,
  input: {
    actorId?: string;
    ok: boolean;
    reason?: string;
    body?: Partial<CreateManagedBody>;
    uid?: string;
  },
) {
  try {
    await db.collection("platformAuditLogs").add({
      actorId: input.actorId ?? "",
      action: input.ok ? "admin.managed_account.create" : "admin.managed_account.create_denied",
      resource: input.uid ? `users/${input.uid}` : "users/unknown",
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
    // Audit best-effort; asıl hesap oluşturma sonucunu bozmasın.
  }
}

async function tenantExists(db: Firestore, tenantId: string): Promise<boolean> {
  if (tenantId === "public" || tenantId === "platform") return true;
  return (await db.doc(`tenants/${tenantId}`).get()).exists;
}

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

  const parsed = createManagedSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Geçersiz istek alanları.",
        details: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }
  const body = parsed.data;

  let callerUid: string;
  try {
    callerUid = (await adminAuth.verifyIdToken(body.idToken)).uid;
  } catch {
    return NextResponse.json({ error: "Kimlik doğrulanamadı." }, { status: 401 });
  }

  const callerSnap = await adminDb.doc(`users/${callerUid}`).get();
  const caller = callerSnap.data() ?? {};
  const callerRole = asString(caller.role);
  const callerTenantId = asString(caller.tenantId);
  if (!callerSnap.exists || asString(caller.status) !== "ACTIVE" || !SCHOOL_MANAGER_ROLES.has(callerRole)) {
    await writeAudit(adminDb, {
      actorId: callerUid,
      ok: false,
      reason: "caller_not_allowed",
      body,
    });
    return NextResponse.json(
      { error: "Bu işlem için okul yöneticisi/kurucu/müdür yetkisi gerekir." },
      { status: 403 },
    );
  }

  if (callerRole !== ROLES.SUPER_ADMIN && callerTenantId !== body.tenantId) {
    await writeAudit(adminDb, {
      actorId: callerUid,
      ok: false,
      reason: "tenant_mismatch",
      body,
    });
    return NextResponse.json({ error: "Farklı tenant için hesap açılamaz." }, { status: 403 });
  }

  const assignable = callerRole === ROLES.SUPER_ADMIN ? SUPER_ASSIGNABLE_ROLES : SCHOOL_ASSIGNABLE_ROLES;
  if (!assignable.has(body.role)) {
    await writeAudit(adminDb, {
      actorId: callerUid,
      ok: false,
      reason: "role_not_assignable",
      body,
    });
    return NextResponse.json({ error: "Bu rol atanamaz." }, { status: 403 });
  }

  if (!(await tenantExists(adminDb, body.tenantId))) {
    await writeAudit(adminDb, {
      actorId: callerUid,
      ok: false,
      reason: "tenant_not_found",
      body,
    });
    return NextResponse.json({ error: "Tenant/okul bulunamadı." }, { status: 404 });
  }

  const schoolId = body.schoolId ?? body.tenantId;
  if (body.schoolId) {
    const schoolSnap = await adminDb.doc(`schools/${body.schoolId}`).get();
    if (!schoolSnap.exists || schoolSnap.get("tenantId") !== body.tenantId) {
      await writeAudit(adminDb, {
        actorId: callerUid,
        ok: false,
        reason: "school_not_found_or_mismatch",
        body,
      });
      return NextResponse.json(
        { error: "Okul bulunamadı veya tenant ile eşleşmiyor." },
        { status: 404 },
      );
    }
  }

  const password = strongPassword();
  let uid = "";
  try {
    const created = await adminAuth.createUser({
      email: body.email,
      password,
      displayName: body.displayName,
      emailVerified: false,
      disabled: false,
    });
    uid = created.uid;

    try {
      await adminAuth.setCustomUserClaims(uid, {
        role: body.role,
        tenantId: body.tenantId,
        schoolId,
      });
      await adminDb.doc(`users/${uid}`).set({
        uid,
        email: body.email,
        displayName: body.displayName,
        role: body.role,
        tenantId: body.tenantId,
        schoolId,
        status: "ACTIVE",
        mustChangePassword: true,
        createdBy: callerUid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      try {
        await adminAuth.deleteUser(uid);
      } catch {
        // Rollback best-effort; asıl hatayı döndür.
      }
      throw error;
    }

    await writeAudit(adminDb, {
      actorId: callerUid,
      ok: true,
      body,
      uid,
    });

    return NextResponse.json({
      uid,
      email: body.email,
      tempPassword: password,
    });
  } catch (error) {
    await writeAudit(adminDb, {
      actorId: callerUid,
      ok: false,
      reason: error instanceof Error ? error.message : "managed_account_create_failed",
      body,
      uid,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Hesap oluşturulamadı." },
      { status: 500 },
    );
  }
}
