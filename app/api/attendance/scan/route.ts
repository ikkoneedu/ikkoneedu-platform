import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getAttendanceSecret, verifyAttendanceSig } from "@/lib/attendance/sign";
import { parseAttendanceQR, dateStr, haversineMeters } from "@/lib/attendance/token";
import {
  SCHOOL_LOCATION,
  ATTENDANCE_GEOFENCE_ENABLED,
  ATTENDANCE_RETENTION_DAYS,
} from "@/lib/config/school-location";

export const runtime = "nodejs";

const NON_STAFF = ["PARENT", "STUDENT", "PUBLIC"];

/**
 * QR tarama → personel giriş/çıkış kaydı (SUNUCU, firebase-admin).
 *
 * Güvenlik: (1) operatör doğrulanır (okul personeli, aynı tenant), (2) QR imzası
 * sunucu sırrıyla doğrulanır, (3) tarih BUGÜN olmalı (dünkü ekran görüntüsü
 * geçersiz), (4) konum okul geofence'i içinde olmalı. İlk okutma = GİRİŞ,
 * ikincisi = ÇIKIŞ. Kayıt yalnızca burada (Admin SDK) yazılır.
 *
 * İstek (POST): { idToken (operatör), token (QR metni), lat, lng }
 * Yanıt: { ok, action:'in'|'out', name, date, time }
 */
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Admin SDK yapılandırılmamış." },
      { status: 503 },
    );
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

  let body: { idToken?: string; token?: string; lat?: number; lng?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Geçersiz istek." }, { status: 400 });
  }

  const idToken = String(body.idToken ?? "");
  const qr = String(body.token ?? "");
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lng = typeof body.lng === "number" ? body.lng : null;
  if (!idToken) {
    return NextResponse.json({ ok: false, error: "Operatör doğrulanamadı." }, { status: 401 });
  }

  // 1) Operatörü (okuyucuyu kullanan personel) doğrula.
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

  // 2) QR'ı ayrıştır + imzayı + tarihi doğrula.
  const parsed = parseAttendanceQR(qr);
  if (!parsed) {
    return NextResponse.json({ ok: false, error: "Geçersiz QR." }, { status: 400 });
  }
  const today = dateStr(Date.now());
  if (parsed.date !== today) {
    return NextResponse.json(
      { ok: false, error: "QR bugüne ait değil (süresi dolmuş). Personel QR'ını yenilemeli." },
      { status: 400 },
    );
  }
  if (!verifyAttendanceSig(secret, parsed.uid, parsed.date, parsed.sig)) {
    return NextResponse.json({ ok: false, error: "QR imzası doğrulanamadı." }, { status: 400 });
  }

  // 3) Taranan personeli oku.
  const staffSnap = await adminDb.doc(`users/${parsed.uid}`).get();
  const staff = staffSnap.exists ? staffSnap.data() ?? {} : {};
  if (!staffSnap.exists || String(staff.status ?? "") !== "ACTIVE") {
    return NextResponse.json({ ok: false, error: "Personel hesabı aktif değil." }, { status: 403 });
  }
  const staffTenant = String(staff.tenantId ?? "");
  if (!isSuper && staffTenant !== opTenant) {
    return NextResponse.json(
      { ok: false, error: "Personel farklı bir okula ait." },
      { status: 403 },
    );
  }

  // 4) Geofence — okul konumunda mı?
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
        { ok: false, error: "Okul konumunun dışındasınız; giriş-çıkış reddedildi." },
        { status: 403 },
      );
    }
  }

  // 5) Kayıt upsert — ilk okutma GİRİŞ, sonraki ÇIKIŞ.
  const now = new Date();
  const expireAt = new Date(now.getTime() + ATTENDANCE_RETENTION_DAYS * 86400000);
  const logId = `${parsed.date}_${parsed.uid}`;
  const ref = adminDb.doc(`tenants/${staffTenant}/attendanceLogs/${logId}`);
  const existing = await ref.get();
  const geo = lat !== null && lng !== null ? { lat, lng } : null;

  let action: "in" | "out";
  if (!existing.exists) {
    action = "in";
    await ref.set({
      uid: parsed.uid,
      name: String(staff.displayName ?? ""),
      department: String(staff.department ?? ""),
      date: parsed.date,
      checkIn: now,
      checkInGeo: geo,
      checkOut: null,
      checkOutGeo: null,
      scannedBy: operatorUid,
      createdAt: now,
      updatedAt: now,
      expireAt,
    });
  } else {
    action = "out";
    await ref.set(
      { checkOut: now, checkOutGeo: geo, scannedBy: operatorUid, updatedAt: now },
      { merge: true },
    );
  }

  const time = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);

  return NextResponse.json({
    ok: true,
    action,
    name: String(staff.displayName ?? ""),
    date: parsed.date,
    time,
  });
}
