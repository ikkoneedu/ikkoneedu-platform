import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { z } from "zod";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { ROLES } from "@/lib/auth/role-constants";

export const runtime = "nodejs";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_DOMAIN = "codes.ikkoneedu.app";
const STAFF_ROLES = new Set<string>([
  ROLES.TEACHER,
  ROLES.COORDINATOR,
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.SUPER_ADMIN,
]);

const codedSchema = z.object({
  idToken: z.string().min(20),
  tenantId: z.string().min(1).max(120),
  role: z.enum([ROLES.STUDENT, ROLES.PARENT]),
  displayName: z.string().trim().min(1).max(160),
  classId: z.string().max(160).optional(),
  className: z.string().max(160).optional(),
  teacherName: z.string().max(160).optional(),
  linkedStudentIds: z.array(z.string().min(1).max(160)).optional(),
  linkedStudents: z.array(z.object({ uid: z.string().min(1).max(160), displayName: z.string().max(160) })).optional(),
  expiresAt: z.number().int().positive().optional(),
});

function randomCode(len = 6): string {
  let out = "";
  for (let i = 0; i < len; i += 1) {
    out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return out;
}

function compactToEmail(compact: string): string {
  return `${compact.toLowerCase()}@${CODE_DOMAIN}`;
}

function compactToPassword(compact: string): string {
  return `ikko-${compact}`;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
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
  const parsed = codedSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz istek alanları.", details: parsed.error.issues.map((i) => i.message) },
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
  const callerTenant = asString(caller.tenantId);
  if (!callerSnap.exists || asString(caller.status) !== "ACTIVE" || !STAFF_ROLES.has(callerRole)) {
    return NextResponse.json({ error: "Bu işlem için aktif personel yetkisi gerekir." }, { status: 403 });
  }
  if (callerRole !== ROLES.SUPER_ADMIN && callerTenant !== body.tenantId) {
    return NextResponse.json({ error: "Farklı tenant için kod üretilemez." }, { status: 403 });
  }

  const prefix = body.role === ROLES.STUDENT ? "OGR" : "VEL";
  let compact = "";
  let code = "";
  let email = "";
  for (let i = 0; i < 5; i += 1) {
    compact = `${prefix}${randomCode(6)}`;
    code = `${prefix}-${compact.slice(prefix.length)}`;
    email = compactToEmail(compact);
    const codeSnap = await adminDb.doc(`tenants/${body.tenantId}/accessCodes/${code}`).get();
    if (!codeSnap.exists) break;
  }
  const password = compactToPassword(compact);

  let uid = "";
  try {
    const created = await adminAuth.createUser({
      email,
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
        schoolId: body.tenantId,
      });
      const batch = adminDb.batch();
      batch.set(adminDb.doc(`users/${uid}`), {
        uid,
        email,
        displayName: body.displayName,
        role: body.role,
        tenantId: body.tenantId,
        schoolId: body.tenantId,
        status: "ACTIVE",
        createdBy: callerUid,
        ...(body.teacherName ? { createdByName: body.teacherName } : {}),
        accessCode: code,
        accessCodeStatus: "ACTIVE",
        ...(body.expiresAt ? { accessCodeExpiresAt: body.expiresAt } : {}),
        linkedStudentIds: body.linkedStudentIds ?? [],
        linkedStudents: body.linkedStudents ?? [],
        ...(body.classId ? { classId: body.classId } : {}),
        ...(body.className ? { className: body.className } : {}),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      batch.set(adminDb.doc(`tenants/${body.tenantId}/accessCodes/${code}`), {
        code,
        uid,
        role: body.role,
        displayName: body.displayName,
        createdBy: callerUid,
        status: "ACTIVE",
        ...(body.expiresAt ? { expiresAt: body.expiresAt } : {}),
        ...(body.classId ? { classId: body.classId } : {}),
        createdAt: FieldValue.serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      try {
        await adminAuth.deleteUser(uid);
      } catch {
        // Rollback best-effort.
      }
      throw error;
    }
    return NextResponse.json({ code, uid, role: body.role, displayName: body.displayName });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kodlu hesap oluşturulamadı." },
      { status: 500 },
    );
  }
}
