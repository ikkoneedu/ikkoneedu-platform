import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { FieldValue, type Firestore } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { ROLES, type Role } from "@/lib/auth/role-constants";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCOUNT_ROLES = new Set<string>([
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.SUPER_ADMIN,
]);

const provisionSchema = z.object({
  idToken: z.string().min(20),
  kind: z.enum(["parent", "teacher", "student"]),
  tenantId: z.string().min(1).max(120),
  recordId: z.string().min(1).max(160),
  email: z.string().trim().toLowerCase().regex(EMAIL_RE, "Geçerli bir e-posta girin."),
});

type ProvisionBody = z.infer<typeof provisionSchema>;
type AccountKind = ProvisionBody["kind"];

interface CallerProfile {
  uid: string;
  role: Role;
  tenantId: string;
  schoolId: string;
  status: string;
}

interface RecordContext {
  role: Role;
  displayName: string;
  recordPath: string;
  linkFields: Record<string, unknown>;
}

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

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

async function writeAudit(
  db: Firestore,
  input: {
    actorId?: string;
    tenantId?: string;
    ok: boolean;
    reason?: string;
    body?: Partial<ProvisionBody>;
    uid?: string;
  },
) {
  try {
    await db.collection("platformAuditLogs").add({
      actorId: input.actorId ?? "",
      action: input.ok ? "admin.account.provision" : "admin.account.provision_denied",
      resource: input.uid ? `users/${input.uid}` : `${input.body?.kind ?? "account"}/${input.body?.recordId ?? "unknown"}`,
      meta: {
        ok: input.ok,
        reason: input.reason ?? "",
        kind: input.body?.kind ?? "",
        tenantId: input.body?.tenantId ?? input.tenantId ?? "",
        recordId: input.body?.recordId ?? "",
      },
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // Audit best-effort; provisioning sonucunu audit hatası bozmasın.
  }
}

async function getCallerProfile(
  db: Firestore,
  uid: string,
): Promise<CallerProfile | null> {
  const snap = await db.doc(`users/${uid}`).get();
  if (!snap.exists) return null;
  const data = snap.data() ?? {};
  return {
    uid,
    role: asString(data.role) as Role,
    tenantId: asString(data.tenantId),
    schoolId: asString(data.schoolId),
    status: asString(data.status),
  };
}

async function getRecordContext(
  db: Firestore,
  tenantId: string,
  kind: AccountKind,
  recordId: string,
): Promise<RecordContext | null> {
  const collection =
    kind === "parent" ? "parents" : kind === "teacher" ? "teachers" : "students";
  const recordPath = `tenants/${tenantId}/${collection}/${recordId}`;
  const snap = await db.doc(recordPath).get();
  if (!snap.exists) return null;
  const data = snap.data() ?? {};
  const displayName = asString(data.fullName) || [asString(data.firstName), asString(data.lastName)].filter(Boolean).join(" ");

  if (kind === "parent") {
    return {
      role: ROLES.PARENT,
      displayName,
      recordPath,
      linkFields: {
        linkedParentId: recordId,
        linkedStudentIds: asStringArray(data.linkedStudentIds),
      },
    };
  }

  if (kind === "teacher") {
    return {
      role: ROLES.TEACHER,
      displayName,
      recordPath,
      linkFields: {
        linkedTeacherId: recordId,
        classIds: asStringArray(data.classIds),
      },
    };
  }

  return {
    role: ROLES.STUDENT,
    displayName,
    recordPath,
    linkFields: {
      linkedStudentId: recordId,
      classId: asString(data.classId),
    },
  };
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

  const parsed = provisionSchema.safeParse(rawBody);
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

  const caller = await getCallerProfile(adminDb, callerUid);
  if (!caller || caller.status !== "ACTIVE" || !ACCOUNT_ROLES.has(caller.role)) {
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

  if (caller.role !== ROLES.SUPER_ADMIN && caller.tenantId !== body.tenantId) {
    await writeAudit(adminDb, {
      actorId: callerUid,
      ok: false,
      reason: "tenant_mismatch",
      body,
    });
    return NextResponse.json({ error: "Farklı tenant için hesap açılamaz." }, { status: 403 });
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

  const ctx = await getRecordContext(adminDb, body.tenantId, body.kind, body.recordId);
  if (!ctx || !ctx.displayName) {
    await writeAudit(adminDb, {
      actorId: callerUid,
      ok: false,
      reason: "record_not_found",
      body,
    });
    return NextResponse.json({ error: "Bağlanacak kayıt bulunamadı." }, { status: 404 });
  }

  const schoolId = caller.role === ROLES.SUPER_ADMIN ? body.tenantId : caller.schoolId || body.tenantId;
  const password = strongPassword();

  try {
    let uid: string;
    let mode: "created" | "linked";
    let tempPassword: string | undefined;

    try {
      const created = await adminAuth.createUser({
        email: body.email,
        password,
        displayName: ctx.displayName,
        emailVerified: false,
        disabled: false,
      });
      uid = created.uid;
      mode = "created";
      tempPassword = password;

      try {
        await adminAuth.setCustomUserClaims(uid, {
          role: ctx.role,
          tenantId: body.tenantId,
          schoolId,
        });
        const batch = adminDb.batch();
        batch.set(adminDb.doc(`users/${uid}`), {
          uid,
          email: body.email,
          displayName: ctx.displayName,
          role: ctx.role,
          tenantId: body.tenantId,
          schoolId,
          status: "ACTIVE",
          mustChangePassword: true,
          createdBy: callerUid,
          ...ctx.linkFields,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        batch.update(adminDb.doc(ctx.recordPath), {
          userId: uid,
          updatedAt: FieldValue.serverTimestamp(),
        });
        await batch.commit();
      } catch (error) {
        try {
          await adminAuth.deleteUser(uid);
        } catch {
          // Rollback best-effort; asıl hatayı döndür.
        }
        throw error;
      }
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code !== "auth/email-already-exists") throw error;

      const existing = await adminAuth.getUserByEmail(body.email);
      uid = existing.uid;
      mode = "linked";

      const profileRef = adminDb.doc(`users/${uid}`);
      const profileSnap = await profileRef.get();
      if (!profileSnap.exists) {
        throw new Error("Bu e-posta profilsiz bir Auth hesabına ait; otomatik bağlanamaz.");
      }
      const profile = profileSnap.data() ?? {};
      if (asString(profile.tenantId) !== body.tenantId || asString(profile.role) !== ctx.role) {
        throw new Error("Bu e-posta aynı tenant ve beklenen role ait değil.");
      }

      const batch = adminDb.batch();
      batch.update(profileRef, {
        ...ctx.linkFields,
        updatedAt: FieldValue.serverTimestamp(),
      });
      batch.update(adminDb.doc(ctx.recordPath), {
        userId: uid,
        updatedAt: FieldValue.serverTimestamp(),
      });
      await batch.commit();
      await adminAuth.setCustomUserClaims(uid, {
        role: ctx.role,
        tenantId: body.tenantId,
        schoolId: asString(profile.schoolId) || schoolId,
      });
    }

    await writeAudit(adminDb, {
      actorId: callerUid,
      tenantId: body.tenantId,
      ok: true,
      body,
      uid,
    });

    return NextResponse.json({
      ok: true,
      mode,
      uid,
      email: body.email,
      ...(tempPassword ? { tempPassword } : {}),
    });
  } catch (error) {
    await writeAudit(adminDb, {
      actorId: callerUid,
      tenantId: body.tenantId,
      ok: false,
      reason: error instanceof Error ? error.message : "provision_failed",
      body,
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Hesap oluşturulamadı." },
      { status: 500 },
    );
  }
}
