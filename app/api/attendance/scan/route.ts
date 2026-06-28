import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getAttendanceSecret, verifyAttendanceSig } from "@/lib/attendance/sign";
import {
  parseAttendanceQR,
  dateStr,
  haversineMeters,
  minutesOfDay,
  isoWeekday,
  parseHm,
} from "@/lib/attendance/token";
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
  if (!verifyAttendanceSig(secret, parsed.uid, parsed.date, parsed.action, parsed.sig)) {
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

  // 5) Kayıt upsert — aksiyon QR'da imzalı: GİRİŞ checkIn, ÇIKIŞ checkOut.
  const now = new Date();
  const expireAt = new Date(now.getTime() + ATTENDANCE_RETENTION_DAYS * 86400000);
  const logId = `${parsed.date}_${parsed.uid}`;
  const ref = adminDb.doc(`tenants/${staffTenant}/attendanceLogs/${logId}`);
  const existing = await ref.get();
  const geo = lat !== null && lng !== null ? { lat, lng } : null;
  const action = parsed.action;
  const nowMs = now.getTime();

  // Bu tarama checkIn'i İLK kez yazıyor mu? (geç tespiti yalnız o zaman)
  const willSetCheckIn = action === "in" && (!existing.exists || !existing.data()?.checkIn);

  // Geç-giriş tespiti — mesai programına göre (yoksa geç sayılmaz).
  let late = false;
  let lateMinutes = 0;
  if (willSetCheckIn) {
    const schSnap = await adminDb.doc(`tenants/${staffTenant}/staffSchedules/${parsed.uid}`).get();
    if (schSnap.exists) {
      const s = schSnap.data() ?? {};
      const leaveStart = String(s.leaveStart ?? "");
      const leaveEnd = String(s.leaveEnd ?? "");
      const onLeave = leaveStart && leaveEnd && parsed.date >= leaveStart && parsed.date <= leaveEnd;
      const workdays = Array.isArray(s.workdays) ? s.workdays.map((x: unknown) => Number(x)) : [1, 2, 3, 4, 5];
      const isWorkday = workdays.includes(isoWeekday(nowMs));
      if (!onLeave && isWorkday) {
        const diff = minutesOfDay(nowMs) - (parseHm(String(s.startTime ?? "09:00")) + (Number(s.graceMinutes ?? 0) || 0));
        if (diff > 0) {
          late = true;
          lateMinutes = diff;
        }
      }
    }
  }

  if (!existing.exists) {
    // Gün için ilk kayıt — seçilen aksiyona göre ilgili alanı doldur.
    await ref.set({
      uid: parsed.uid,
      name: String(staff.displayName ?? ""),
      department: String(staff.department ?? ""),
      date: parsed.date,
      checkIn: action === "in" ? now : null,
      checkInGeo: action === "in" ? geo : null,
      checkOut: action === "out" ? now : null,
      checkOutGeo: action === "out" ? geo : null,
      late,
      lateMinutes,
      scannedBy: operatorUid,
      createdAt: now,
      updatedAt: now,
      expireAt,
    });
  } else if (action === "in") {
    // Giriş yalnızca boşsa yazılır (günün ilk girişi korunur).
    if (willSetCheckIn) {
      await ref.set({ checkIn: now, checkInGeo: geo, late, lateMinutes, scannedBy: operatorUid, updatedAt: now }, { merge: true });
    } else {
      await ref.set({ updatedAt: now }, { merge: true });
    }
  } else {
    // Çıkış her seferinde güncellenir (en son çıkış geçerli).
    await ref.set({ checkOut: now, checkOutGeo: geo, scannedBy: operatorUid, updatedAt: now }, { merge: true });
  }

  // Geç giriş → yönetim uyarısı (günde bir; sebep sorma akışı için).
  if (willSetCheckIn && late) {
    const alertRef = adminDb.doc(`tenants/${staffTenant}/staffAlerts/${logId}`);
    if (!(await alertRef.get()).exists) {
      await alertRef.set({
        uid: parsed.uid,
        name: String(staff.displayName ?? ""),
        department: String(staff.department ?? ""),
        phone: String(staff.phone ?? ""),
        date: parsed.date,
        type: "late",
        lateMinutes,
        checkIn: now,
        status: "open",
        question: "",
        answer: "",
        createdAt: now,
        updatedAt: now,
        expireAt,
      });
    }
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
