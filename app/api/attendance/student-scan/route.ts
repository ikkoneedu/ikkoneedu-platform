import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getAttendanceSecret, verifyParentAttendanceSig } from "@/lib/attendance/sign";
import { parseParentAttendanceQR, dateStr, haversineMeters } from "@/lib/attendance/token";
import {
  SCHOOL_LOCATION,
  ATTENDANCE_GEOFENCE_ENABLED,
  ATTENDANCE_RETENTION_DAYS,
} from "@/lib/config/school-location";

export const runtime = "nodejs";

const NON_STAFF = ["PARENT", "STUDENT", "PUBLIC"];

interface StudentCandidate {
  id: string;
  name: string;
  classId: string;
}

/**
 * Veli QR taraması → öğrenci otomatik yoklaması (SUNUCU, firebase-admin).
 *
 * Personel QR'ından farklı olarak veli QR'ı YIL BOYU SABİT ve aksiyon
 * taşımaz: sunucu, öğrencinin BUGÜNKÜ kaydına bakarak otomatik belirler.
 * İlk okutma = öğrenci OKULDA (giriş), ikinci okutma = VELİSİ TARAFINDAN
 * BEKLENİYOR (çıkış/alım talebi — sınıf çağırma ekranı bu durumu okur).
 *
 * Bir velinin birden fazla bağlı öğrencisi varsa ve istekte `studentIds`
 * belirtilmemişse, hiçbir yazma yapılmadan seçim adayları döner
 * (`needsSelection: true`); istemci öğrenci(ler)i seçip tekrar çağırır.
 *
 * İstek (POST): { idToken (operatör), token (veli QR metni), lat, lng, studentIds? }
 * Yanıt: { ok, date, time, results: [{studentId,name,action}] }
 *     veya { ok, needsSelection: true, students: [...] }
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
  const secret = getAttendanceSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "ATTENDANCE_QR_SECRET tanımlı değil (sunucu)." },
      { status: 503 },
    );
  }
  const adminAuth = getAdminAuth();
  const adminDb = getAdminDb();
  if (!adminAuth || !adminDb) {
    return NextResponse.json({ ok: false, error: "Servis kullanılamıyor." }, { status: 503 });
  }

  let body: { idToken?: string; token?: string; lat?: number; lng?: number; studentIds?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const idToken = String(body.idToken ?? "");
  const qr = String(body.token ?? "");
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lng = typeof body.lng === "number" ? body.lng : null;
  const requestedStudentIds = Array.isArray(body.studentIds)
    ? body.studentIds.map((x) => String(x))
    : null;
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Operatör doğrulanamadı." }, { status: 401 });
  }

  // 1) Operatörü doğrula (okul personeli, aynı tenant).
  let operatorUid: string;
  try {
    operatorUid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ ok: false, error: "Oturum doğrulanamadı." }, { status: 401 });
  }
  const opSnap = await adminDb.doc(`users/${operatorUid}`).get();
  const op = opSnap.exists ? opSnap.data() ?? {} : {};
  const opRole = String(op.role ?? "");
  const opTenant = String(op.tenantId ?? "");
  const opStatus = String(op.status ?? "");
  const isSuper = opRole === "SUPER_ADMIN";
  if (!opSnap.exists || opStatus !== "ACTIVE" || NON_STAFF.includes(opRole)) {
    return NextResponse.json(
      { ok: false, error: "Bu işlem için yetkili personel olmanız gerekir." },
      { status: 403 },
    );
  }

  // 2) Veli QR'ını ayrıştır + imzayı + geçerlilik tarihini doğrula.
  const parsed = parseParentAttendanceQR(qr);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: "Geçersiz QR." }, { status: 400 });
  }
  const today = dateStr(Date.now());
  if (parsed.expiresDate < today) {
    return NextResponse.json(
      { ok: false, error: "Veli QR'ının süresi dolmuş. Yeniden oluşturmalı." },
      { status: 400 },
    );
  }
  if (!verifyParentAttendanceSig(secret, parsed.parentUid, parsed.expiresDate, parsed.sig)) {
    return NextResponse.json({ ok: false, error: "QR imzası doğrulanamadı." }, { status: 400 });
  }

  // 3) Veliyi oku.
  const parentSnap = await adminDb.doc(`users/${parsed.parentUid}`).get();
  const parent = parentSnap.exists ? parentSnap.data() ?? {} : {};
  if (!parentSnap.exists || String(parent.status ?? "") !== "ACTIVE" || String(parent.role ?? "") !== "PARENT") {
    return NextResponse.json({ ok: false, error: "Veli hesabı aktif değil." }, { status: 403 });
  }
  const parentTenant = String(parent.tenantId ?? "");
  if (!isSuper && parentTenant !== opTenant) {
    return NextResponse.json({ ok: false, error: "Veli farklı bir okula ait." }, { status: 403 });
  }
  const linkedStudentIds: string[] = Array.isArray(parent.linkedStudentIds)
    ? parent.linkedStudentIds.map((x: unknown) => String(x))
    : [];
  if (linkedStudentIds.length === 0) {
    return NextResponse.json({ ok: false, error: "Bu veliye bağlı öğrenci yok." }, { status: 409 });
  }

  // 4) Bağlı öğrencileri oku (yalnızca aktif olanlar).
  const studentDocs = await Promise.all(
    linkedStudentIds.map((id) => adminDb.doc(`tenants/${parentTenant}/students/${id}`).get()),
  );
  const linkedStudents: StudentCandidate[] = studentDocs
    .filter((d) => d.exists && String(d.data()?.status ?? "active") === "active")
    .map((d) => ({
      id: d.id,
      name: String(d.data()?.fullName ?? d.data()?.firstName ?? ""),
      classId: String(d.data()?.classId ?? ""),
    }));
  if (linkedStudents.length === 0) {
    return NextResponse.json({ ok: false, error: "Bağlı aktif öğrenci bulunamadı." }, { status: 409 });
  }

  // 5) Hedef öğrenci(ler)i belirle. Birden fazla çocuk + seçim yapılmamışsa
  //    yazmadan önce istemciden seçim iste.
  let targets: StudentCandidate[];
  if (requestedStudentIds && requestedStudentIds.length > 0) {
    const allowed = new Set(linkedStudents.map((s) => s.id));
    targets = linkedStudents.filter((s) => requestedStudentIds.includes(s.id) && allowed.has(s.id));
    if (targets.length === 0) {
      return NextResponse.json({ ok: false, error: "Seçilen öğrenci bu veliye bağlı değil." }, { status: 400 });
    }
  } else if (linkedStudents.length === 1) {
    targets = linkedStudents;
  } else {
    return NextResponse.json({ ok: true, needsSelection: true, students: linkedStudents });
  }

  // 6) Geofence — okul konumunda mı?
  if (ATTENDANCE_GEOFENCE_ENABLED) {
    if (lat === null || lng === null) {
      return NextResponse.json(
        { ok: false, error: "Konum alınamadı. Konum izni verin ve tekrar deneyin." },
        { status: 400 },
      );
    }
    const dist = haversineMeters(lat, lng, SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng);
    if (dist > SCHOOL_LOCATION.radiusMeters) {
      return NextResponse.json(
        { ok: false, error: "Okul konumunun dışındasınız; işlem reddedildi." },
        { status: 403 },
      );
    }
  }

  // 7) Her hedef öğrenci için otomatik giriş/çıkış (veli bekliyor) kaydı.
  const now = new Date();
  const expireAt = new Date(now.getTime() + ATTENDANCE_RETENTION_DAYS * 86400000);
  const geo = lat !== null && lng !== null ? { lat, lng } : null;
  const results: Array<{ studentId: string; name: string; action: "in" | "out" | "done" }> = [];

  for (const student of targets) {
    const logId = `${today}_${student.id}`;
    const ref = adminDb.doc(`tenants/${parentTenant}/studentAttendanceLogs/${logId}`);
    const existing = await ref.get();
    const d = existing.exists ? existing.data() ?? {} : {};

    if (!existing.exists || !d.checkIn) {
      await ref.set({
        studentId: student.id,
        studentName: student.name,
        classId: student.classId,
        date: today,
        checkIn: now,
        checkInBy: parsed.parentUid,
        checkInGeo: geo,
        checkOut: null,
        checkOutBy: null,
        checkOutGeo: null,
        status: "in_school",
        createdAt: existing.exists ? d.createdAt ?? now : now,
        updatedAt: now,
        expireAt,
      }, { merge: true });
      results.push({ studentId: student.id, name: student.name, action: "in" });
    } else if (!d.checkOut) {
      await ref.set({
        checkOut: now,
        checkOutBy: parsed.parentUid,
        checkOutGeo: geo,
        status: "awaiting_pickup",
        updatedAt: now,
      }, { merge: true });
      results.push({ studentId: student.id, name: student.name, action: "out" });
    } else {
      results.push({ studentId: student.id, name: student.name, action: "done" });
    }
  }

  const time = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return NextResponse.json({ ok: true, date: today, time, results });
}
