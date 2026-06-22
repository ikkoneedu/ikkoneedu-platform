/**
 * Bursluluk başvuru servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  tenantScholarshipApplications,
  COLLECTIONS,
} from "@/lib/firebase/collections";

const resultsPath = (tenantId: string) =>
  `${COLLECTIONS.TENANTS}/${tenantId}/scholarshipResults`;

/** Bir tenant belirtilmezse kullanılan varsayılan (genel bursluluk sayfası). */
const DEFAULT_TENANT_ID = "platform"; // tenant'siz fallback (demo/genel) — süper admin okur

export interface ScholarshipApplicationInput {
  /** Başvurunun bağlı olduğu okul/tenant (slug resolver'dan gelir). */
  tenantId?: string;
  /** Üretilen başvuru numarası (ör. IKK-2026-000001). */
  applicationNo: string;
  studentName: string;
  studentTc?: string;
  birthDate?: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  district?: string;
  address?: string;
}

/**
 * Başvuru numarası üretir: `PREFIX-YYYY-000000`.
 * Örn. generateApplicationNo("IKK") -> "IKK-2026-014823"
 */
export function generateApplicationNo(prefix = "IKK"): string {
  const year = new Date().getFullYear();
  const sequence = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `${prefix}-${year}-${sequence}`;
}

/**
 * Okul adından başvuru numarası ön eki üretir.
 * Örn. "Örnek Koleji" -> "OK", "Atael" -> "ATA".
 */
export function deriveApplicationPrefix(name: string): string {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "C", Ğ: "G", İ: "I", Ö: "O", Ş: "S", Ü: "U",
  };
  const ascii = name
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
  const words = ascii.split(/\s+/).filter(Boolean);
  const prefix =
    words.length >= 2
      ? words.map((w) => w[0]).join("").slice(0, 4)
      : (words[0] ?? "OKL").slice(0, 3);
  return prefix.replace(/[^A-Za-z0-9]/g, "").toUpperCase() || "OKL";
}

export interface CreateApplicationResult {
  ok: boolean;
  /** Firebase yapılandırılmamışsa (Mock Mod) true. */
  mock: boolean;
  /** Oluşturulan belge kimliği (= applicationNo) — başarısızsa null. */
  id: string | null;
  /** Kesinleşen başvuru numarası — çakışma olursa yeniden üretilmiş olabilir. */
  applicationNo: string | null;
  error?: string;
}

/**
 * Bursluluk başvurusunu, `applicationNo`'yu BELGE KİMLİĞİ olarak kullanarak
 * oluşturur. Böylece aynı numara iki kez yazılamaz (çakışma güvenli).
 *
 * Çakışma stratejisi:
 *  - Okuma izni olan (personel) için önce belge var mı diye bakılır.
 *  - Anonim aday okuyamaz; bu durumda "create-only" güvenlik kuralına güvenilir:
 *    var olan belgeye yazım `update` sayılır ve reddedilir → yeni numara ile
 *    en çok 5 kez yeniden denenir.
 *  - `createdAt` istemciden ALINMAZ; her zaman `serverTimestamp()` kullanılır.
 *  - `tenantId` alanı belge yolundaki tenant ile aynıdır (tutarlılık kuralı).
 */
export async function createScholarshipApplication(
  data: ScholarshipApplicationInput,
): Promise<CreateApplicationResult> {
  const tenantId = data.tenantId ?? DEFAULT_TENANT_ID;

  // Mock Mod: Firestore'a yazma; istemcinin/üretilen numarayı geri döndür.
  if (!isFirebaseConfigured() || !db) {
    const no = (data.applicationNo || generateApplicationNo()).trim();
    return { ok: true, mock: true, id: no, applicationNo: no };
  }
  const database = db;

  const buildPayload = (applicationNo: string): Record<string, unknown> => {
    const payload: Record<string, unknown> = {
      tenantId,
      applicationNo,
      studentName: data.studentName,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      parentEmail: data.parentEmail,
      type: "scholarship_application",
      status: "received",
      createdAt: serverTimestamp(),
    };
    // Opsiyonel alanlar yalnızca doluysa eklenir (Firestore undefined kabul etmez).
    if (data.studentTc) payload.studentTc = data.studentTc;
    if (data.birthDate) payload.birthDate = data.birthDate;
    if (data.district) payload.district = data.district;
    if (data.address) payload.address = data.address;
    return payload;
  };

  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const applicationNo =
      attempt === 0 && data.applicationNo
        ? data.applicationNo.trim()
        : generateApplicationNo();
    const ref = doc(
      database,
      `${tenantScholarshipApplications(tenantId)}/${applicationNo}`,
    );
    try {
      // Personel (okuma izinli) için çakışmayı erken yakala.
      try {
        const existing = await getDoc(ref);
        if (existing.exists()) {
          lastError = new Error("Başvuru numarası çakıştı.");
          continue;
        }
      } catch {
        // Anonim aday okuyamaz; create-only kuralı üzerine yazmayı engeller.
      }
      await setDoc(ref, buildPayload(applicationNo));
      return { ok: true, mock: false, id: applicationNo, applicationNo };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    ok: false,
    mock: false,
    id: null,
    applicationNo: null,
    error:
      lastError instanceof Error
        ? lastError.message
        : "Başvuru oluşturulamadı.",
  };
}

export interface ScholarshipApplicationRecord {
  id: string;
  applicationNo: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: string;
  /** Sonuç alanları (yönetici girer). */
  examScore: string;
  scholarshipRate: string;
  resultStatus: string;
  room: string;
  seatNo: string;
}

/** Tenant'taki bursluluk başvurularını listeler (personel). */
export async function listScholarshipApplications(
  tenantId: string,
): Promise<ScholarshipApplicationRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantScholarshipApplications(tenantId))),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      applicationNo: String(data.applicationNo ?? ""),
      studentName: String(data.studentName ?? ""),
      parentName: String(data.parentName ?? ""),
      parentPhone: String(data.parentPhone ?? ""),
      parentEmail: String(data.parentEmail ?? ""),
      status: String(data.status ?? ""),
      examScore: String(data.examScore ?? ""),
      scholarshipRate: String(data.scholarshipRate ?? ""),
      resultStatus: String(data.resultStatus ?? ""),
      room: String(data.room ?? ""),
      seatNo: String(data.seatNo ?? ""),
    };
  });
}

export interface ScholarshipResultInput {
  examScore?: string;
  scholarshipRate?: string;
  resultStatus?: string;
  room?: string;
  seatNo?: string;
}

/** Yönetici bir başvuruya sınav sonucu / burs oranı / salon bilgisi girer. */
export async function setScholarshipResult(
  tenantId: string,
  applicationId: string,
  result: ScholarshipResultInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [k, v] of Object.entries(result)) {
    if (v !== undefined) data[k] = v;
  }
  // Sonuç girildiyse durumu "Sonuç Açıklandı" yap.
  if (result.scholarshipRate || result.examScore) {
    data.status = "result_published";
  }
  await updateDoc(
    doc(db, `${tenantScholarshipApplications(tenantId)}/${applicationId}`),
    data,
  );
}

export interface PublicScholarshipResult {
  applicationNo: string;
  studentName: string;
  examScore: string;
  scholarshipRate: string;
  status: string;
  room: string;
  seatNo: string;
}

/**
 * Sonucu HALKA AÇIK sorgulanabilir belgeye yayımlar (id = başvuru no).
 * Veli/aday yalnızca başvuru numarasıyla sorgular. İçerik hassas değildir.
 */
export async function publishScholarshipResult(
  tenantId: string,
  result: PublicScholarshipResult,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  const id = result.applicationNo.trim();
  if (!id) return;
  await setDoc(
    doc(db, `${resultsPath(tenantId)}/${id}`),
    { ...result, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

/** Başvuru numarasıyla yayımlanmış sonucu getirir (halka açık). */
export async function getPublicScholarshipResult(
  tenantId: string,
  applicationNo: string,
): Promise<PublicScholarshipResult | null> {
  if (!isFirebaseConfigured() || !db || !tenantId || !applicationNo) return null;
  try {
    const snap = await getDoc(doc(db, `${resultsPath(tenantId)}/${applicationNo.trim()}`));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      applicationNo: String(d.applicationNo ?? applicationNo),
      studentName: String(d.studentName ?? ""),
      examScore: String(d.examScore ?? ""),
      scholarshipRate: String(d.scholarshipRate ?? ""),
      status: String(d.status ?? ""),
      room: String(d.room ?? ""),
      seatNo: String(d.seatNo ?? ""),
    };
  } catch {
    return null;
  }
}
