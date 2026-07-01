import { NextResponse } from "next/server";
import type { Firestore } from "firebase-admin/firestore";
import { getAdminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { getAttendanceSecret, verifyAttendanceSig } from "@/lib/attendance/sign";
import {
  parseAttendanceQR,
  dateStr,
  isoWeekday,
  minutesOfDay,
  parseHm,
  type AttendanceAction,
} from "@/lib/attendance/token";
import { verifyDeviceSecret } from "@/lib/attendance/device-auth";
import { ATTENDANCE_RETENTION_DAYS } from "@/lib/config/school-location";
import { notifyGeneralManagers } from "@/lib/server/tenant-leadership-admin";

export const runtime = "nodejs";

const NON_STAFF = ["PARENT", "STUDENT", "PUBLIC"];

type ScanResultCode =
  | "success"
  | "expired"
  | "replay"
  | "duplicate"
  | "unauthorized_device"
  | "invalid_token"
  | "tenant_mismatch"
  | "staff_not_found"
  | "server_error";

interface ScanResponseBody {
  ok: boolean;
  message: string;
  staffName?: string;
  action?: "checkIn" | "checkOut";
  time?: string;
  statusCode: ScanResultCode;
}

const MESSAGES: Record<ScanResultCode, string> = {
  success: "Kayıt başarılı.",
  expired: "QR süresi dolmuş.",
  replay: "Bu QR daha önce kullanılmış.",
  duplicate: "Bugünkü giriş/çıkış zaten tamamlanmış.",
  unauthorized_device: "Yetkisiz cihaz.",
  invalid_token: "Geçersiz QR.",
  tenant_mismatch: "Personel bu okula ait değil.",
  staff_not_found: "Personel bulunamadı.",
  server_error: "Sunucu hatası. Tekrar deneyin.",
};

/**
 * Kiosk (USB QR okuyucu / Keyboard Wedge) personel giriş-çıkış tarama uç
 * noktası — SUNUCU (Admin SDK).
 *
 * Kamera akışındaki `/api/attendance/scan`dan farkı: burada oturum açmış bir
 * OPERATÖR (idToken) yoktur — kiosk bilgisayarı, aktivasyonda üretilen cihaz
 * sırrıyla (bkz. `lib/attendance/device-auth.ts`) doğrulanır. QR imza
 * doğrulaması AYNI mevcut fonksiyonlardır (`parseAttendanceQR`,
 * `verifyAttendanceSig`) — token üretim/doğrulama mantığı DEĞİŞTİRİLMEDİ.
 *
 * İstek (POST): { scannedValue, tenantId, deviceId, deviceSecret, scanMode? }
 *   scanMode şu an yalnızca "auto" olarak davranır (QR'ın kendi imzalı
 *   action'ı kullanılır); "checkIn"/"checkOut" değerleri ileride manuel
 *   geçersiz kılma için ayrılmıştır, imzalı action'ı değiştirmez.
 * Yanıt: { ok, message, staffName?, action?, time?, statusCode }
 */
export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: `${MESSAGES.server_error} (${String((e as Error)?.message ?? e)})`, statusCode: "server_error" } satisfies ScanResponseBody,
      { status: 500 },
    );
  }
}

async function handle(request: Request): Promise<NextResponse> {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Admin SDK yapılandırılmamış.", statusCode: "server_error" } satisfies ScanResponseBody,
      { status: 503 },
    );
  }
  const secret = getAttendanceSecret();
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "ATTENDANCE_QR_SECRET tanımlı değil (sunucu).", statusCode: "server_error" } satisfies ScanResponseBody,
      { status: 503 },
    );
  }
  const adminDb = getAdminDb();
  if (!adminDb) {
    return NextResponse.json(
      { ok: false, message: "Servis kullanılamıyor.", statusCode: "server_error" } satisfies ScanResponseBody,
      { status: 503 },
    );
  }

  let body: {
    scannedValue?: string;
    tenantId?: string;
    deviceId?: string;
    deviceSecret?: string;
    scanMode?: "auto" | "checkIn" | "checkOut";
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Geçersiz istek.", statusCode: "server_error" } satisfies ScanResponseBody,
      { status: 400 },
    );
  }

  const scannedValue = String(body.scannedValue ?? "");
  const tenantId = String(body.tenantId ?? "");
  const deviceId = String(body.deviceId ?? "");
  const deviceSecret = String(body.deviceSecret ?? "");

  // Log yardımcı — her sonuçta (başarılı/başarısız) denetim kaydı bırakır ve
  // aynı anda standart yanıtı döner (tek noktadan; hiçbir dal loglamayı atlamaz).
  const respond = async (
    statusCode: ScanResultCode,
    httpStatus: number,
    extra: Partial<ScanResponseBody> = {},
    logExtra: { staffId?: string; action?: "checkIn" | "checkOut" | "rejected" } = {},
  ): Promise<NextResponse> => {
    if (tenantId) {
      try {
        await adminDb!.collection(`tenants/${tenantId}/attendanceScanLogs`).add({
          tenantId,
          staffId: logExtra.staffId ?? null,
          deviceId: deviceId || null,
          scannedAt: new Date(),
          result: statusCode,
          action: logExtra.action ?? "rejected",
          message: extra.message ?? MESSAGES[statusCode],
          rawLength: scannedValue.length,
          createdAt: new Date(),
        });
      } catch {
        /* denetim kaydı başarısız olsa da yanıtı engellemez */
      }
    }
    return NextResponse.json(
      { ok: statusCode === "success", message: MESSAGES[statusCode], statusCode, ...extra } satisfies ScanResponseBody,
      { status: httpStatus },
    );
  };

  if (!scannedValue || !tenantId || !deviceId || !deviceSecret) {
    return respond("invalid_token", 400, { message: "Eksik parametre." });
  }

  // 1) Cihazı doğrula (kiosk aktivasyonunda üretilen sır — bkz. device-auth.ts).
  const deviceSnap = await adminDb.doc(`tenants/${tenantId}/attendanceDevices/${deviceId}`).get();
  if (!deviceSnap.exists) {
    return respond("unauthorized_device", 403);
  }
  const device = deviceSnap.data() ?? {};
  if (String(device.status ?? "") !== "active") {
    return respond("unauthorized_device", 403);
  }
  if (!verifyDeviceSecret(deviceSecret, String(device.secretHash ?? ""))) {
    return respond("unauthorized_device", 403);
  }

  // 2) QR'ı ayrıştır + tarihi + imzayı doğrula (MEVCUT fonksiyonlar — değiştirilmedi).
  const parsed = parseAttendanceQR(scannedValue);
  if (!parsed) {
    return respond("invalid_token", 400);
  }
  const today = dateStr(Date.now());
  if (parsed.date !== today) {
    return respond("expired", 400, {}, { staffId: parsed.uid });
  }
  if (!verifyAttendanceSig(secret, parsed.uid, parsed.date, parsed.action, parsed.sig)) {
    return respond("invalid_token", 400, {}, { staffId: parsed.uid });
  }

  // 3) Personeli oku + tenant/rol kontrolü.
  const staffSnap = await adminDb.doc(`users/${parsed.uid}`).get();
  const staff = staffSnap.exists ? staffSnap.data() ?? {} : {};
  if (!staffSnap.exists || String(staff.status ?? "") !== "ACTIVE" || NON_STAFF.includes(String(staff.role ?? ""))) {
    return respond("staff_not_found", 404, {}, { staffId: parsed.uid });
  }
  if (String(staff.tenantId ?? "") !== tenantId) {
    return respond("tenant_mismatch", 403, {}, { staffId: parsed.uid });
  }

  // 4) Giriş/çıkış kaydı — TRANSACTION (iki kiosk aynı anda aynı QR'ı işlerse
  //    yalnızca biri başarılı olur; ikincisi 'duplicate' ile reddedilir).
  const logId = `${today}_${parsed.uid}`;
  const ref = adminDb.doc(`tenants/${tenantId}/attendanceLogs/${logId}`);
  const now = new Date();
  const expireAt = new Date(now.getTime() + ATTENDANCE_RETENTION_DAYS * 86400000);
  const staffName = String(staff.displayName ?? "");

  let txResult:
    | { ok: true; late: boolean; lateMinutes: number; earlyLeave: boolean; earlyMinutes: number }
    | { ok: false; reason: "duplicate" };
  try {
    txResult = await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(ref);
      const d = existing.exists ? existing.data() ?? {} : {};
      const action: AttendanceAction = parsed.action;

      if (action === "in" && d.checkIn) {
        return { ok: false, reason: "duplicate" as const };
      }
      if (action === "out" && d.checkOut) {
        return { ok: false, reason: "duplicate" as const };
      }

      let late = false;
      let lateMinutes = 0;
      let earlyLeave = false;
      let earlyMinutes = 0;
      const schSnap = await tx.get(adminDb!.doc(`tenants/${tenantId}/staffSchedules/${parsed.uid}`));
      if (schSnap.exists) {
        const s = schSnap.data() ?? {};
        const workdays = Array.isArray(s.workdays) ? s.workdays.map((x: unknown) => Number(x)) : [1, 2, 3, 4, 5];
        const isWorkday = workdays.includes(isoWeekday(now.getTime()));
        if (action === "in") {
          const leaveStart = String(s.leaveStart ?? "");
          const leaveEnd = String(s.leaveEnd ?? "");
          const onLeave = leaveStart && leaveEnd && today >= leaveStart && today <= leaveEnd;
          if (!onLeave && isWorkday) {
            const diff = minutesOfDay(now.getTime()) - (parseHm(String(s.startTime ?? "09:00")) + (Number(s.graceMinutes ?? 0) || 0));
            if (diff > 0) {
              late = true;
              lateMinutes = diff;
            }
          }
        } else if (isWorkday) {
          const diff = parseHm(String(s.endTime ?? "17:00")) - minutesOfDay(now.getTime());
          if (diff > 0) {
            earlyLeave = true;
            earlyMinutes = diff;
          }
        }
      }

      if (action === "in") {
        tx.set(ref, {
          uid: parsed.uid,
          name: staffName,
          department: String(staff.department ?? ""),
          date: today,
          checkIn: now,
          checkInGeo: null,
          late,
          lateMinutes,
          scannedBy: `kiosk:${deviceId}`,
          createdAt: existing.exists ? d.createdAt ?? now : now,
          updatedAt: now,
          expireAt,
        }, { merge: true });
      } else {
        tx.set(ref, {
          uid: parsed.uid,
          name: staffName,
          department: String(staff.department ?? ""),
          date: today,
          checkOut: now,
          checkOutGeo: null,
          scannedBy: `kiosk:${deviceId}`,
          createdAt: existing.exists ? d.createdAt ?? now : now,
          updatedAt: now,
          expireAt,
        }, { merge: true });
      }

      return { ok: true, late, lateMinutes, earlyLeave, earlyMinutes };
    });
  } catch {
    return respond("server_error", 500, {}, { staffId: parsed.uid });
  }

  if (!txResult.ok) {
    return respond("duplicate", 409, { staffName }, { staffId: parsed.uid, action: "rejected" });
  }

  // 5) Geç-giriş/erken-çıkış → Genel Müdüre bildirim (mevcut Faz 1 yardımcısı).
  const alertType = txResult.late ? "late" : txResult.earlyLeave ? "early_leave" : null;
  if (alertType) {
    const alertRef = adminDb.doc(`tenants/${tenantId}/staffAlerts/${logId}_${alertType}`);
    if (!(await alertRef.get()).exists) {
      await alertRef.set({
        uid: parsed.uid,
        name: staffName,
        department: String(staff.department ?? ""),
        phone: String(staff.phone ?? ""),
        date: today,
        type: alertType,
        lateMinutes: alertType === "late" ? txResult.lateMinutes : txResult.earlyMinutes,
        checkIn: alertType === "late" ? now : null,
        checkOut: alertType === "early_leave" ? now : null,
        status: "open",
        question: "",
        answer: "",
        createdAt: now,
        updatedAt: now,
        expireAt,
      });
      await notifyGeneralManagers(adminDb as Firestore, tenantId, {
        title: alertType === "late" ? "Geç giriş" : "Erken çıkış",
        body:
          alertType === "late"
            ? `${staffName} bugün ${txResult.lateMinutes} dk geç geldi (kiosk).`
            : `${staffName} bugün mesai bitmeden ${txResult.earlyMinutes} dk önce çıktı (kiosk).`,
        expireAt,
      });
    }
  }

  const time = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  const action: "checkIn" | "checkOut" = parsed.action === "in" ? "checkIn" : "checkOut";

  return respond(
    "success",
    200,
    { staffName, action, time },
    { staffId: parsed.uid, action },
  );
}
