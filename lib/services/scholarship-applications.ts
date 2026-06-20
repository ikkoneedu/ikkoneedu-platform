/**
 * Bursluluk başvuru servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

import { collection, getDocs, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { createDocument, type CreateResult } from "@/lib/services/firestore-helpers";
import { tenantScholarshipApplications } from "@/lib/firebase/collections";

/** Bir tenant belirtilmezse kullanılan varsayılan (genel bursluluk sayfası). */
const DEFAULT_TENANT_ID = "tenant_ikk";

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

export async function createScholarshipApplication(
  data: ScholarshipApplicationInput,
): Promise<CreateResult> {
  const tenantId = data.tenantId ?? DEFAULT_TENANT_ID;
  return createDocument(tenantScholarshipApplications(tenantId), {
    ...data,
    tenantId,
    type: "scholarship_application",
    status: "received",
  });
}

export interface ScholarshipApplicationRecord {
  id: string;
  applicationNo: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: string;
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
    };
  });
}
