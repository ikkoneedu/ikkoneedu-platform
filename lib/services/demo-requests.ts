/**
 * Demo talep servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { createDocument, type CreateResult } from "@/lib/services/firestore-helpers";
import {
  tenantDemoRequests,
  platformDemoRequests,
} from "@/lib/firebase/collections";
import { createLead, createPlatformLead } from "@/lib/services/leads";

/** Demo talebi pipeline durumları. */
export const DEMO_STATUSES = [
  "new",
  "contacted",
  "demo_booked",
  "converted",
  "lost",
] as const;

export type DemoStatus = (typeof DEMO_STATUSES)[number];

export const DEMO_STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime geçildi",
  demo_booked: "Demo planlandı",
  converted: "Lead'e dönüştü",
  lost: "Kaybedildi",
};

export function demoStatusLabel(status: string): string {
  return DEMO_STATUS_LABELS[status] ?? status;
}

export interface DemoRequestInput {
  institution: string;
  fullName: string;
  role?: string;
  phone: string;
  email: string;
  city?: string;
  institutionType?: string;
  studentCount?: string;
  message?: string;
}

export async function createDemoRequest(
  data: DemoRequestInput,
): Promise<CreateResult> {
  // Platform düzeyi (kök) koleksiyon — bir okula bağlı değildir.
  return createDocument(platformDemoRequests(), {
    ...data,
    type: "demo_request",
    status: "new",
  });
}

export interface DemoRequestRecord {
  id: string;
  institution: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  institutionType: string;
  studentCount: string;
  message: string;
  status: string;
  note: string;
  assignedTo: string;
  /** Lead'e çevrildiyse oluşan lead kimliği. */
  leadId: string;
  /** Lead bir okula bağlandıysa o tenant; platform lead ise boş. */
  leadTenantId: string;
  createdAt: number | null;
}

/** Platform düzeyindeki demo taleplerini listeler (yalnızca SUPER_ADMIN). */
export async function listDemoRequests(): Promise<DemoRequestRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, platformDemoRequests())),
  );
  const rows = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      institution: String(data.institution ?? ""),
      fullName: String(data.fullName ?? ""),
      phone: String(data.phone ?? ""),
      email: String(data.email ?? ""),
      city: String(data.city ?? ""),
      institutionType: String(data.institutionType ?? ""),
      studentCount: String(data.studentCount ?? ""),
      message: String(data.message ?? ""),
      status: String(data.status ?? "new"),
      note: String(data.note ?? ""),
      assignedTo: String(data.assignedTo ?? ""),
      leadId: String(data.leadId ?? ""),
      leadTenantId: String(data.leadTenantId ?? ""),
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
  return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Demo talebini günceller (durum / not / atanan kişi). Yalnızca SUPER_ADMIN. */
export interface DemoRequestPatch {
  status?: DemoStatus;
  note?: string;
  assignedTo?: string;
  leadId?: string;
  leadTenantId?: string;
}

export async function updateDemoRequest(
  id: string,
  patch: DemoRequestPatch,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.status !== undefined) data.status = patch.status;
  if (patch.note !== undefined) data.note = patch.note;
  if (patch.assignedTo !== undefined) data.assignedTo = patch.assignedTo;
  if (patch.leadId !== undefined) data.leadId = patch.leadId;
  if (patch.leadTenantId !== undefined) data.leadTenantId = patch.leadTenantId;
  await updateDoc(doc(db, `${platformDemoRequests()}/${id}`), data);
}

export interface ConvertResult {
  ok: boolean;
  leadId: string | null;
  /** Lead bir okula bağlandıysa tenant; platform lead ise null. */
  tenantId: string | null;
  error?: string;
}

/**
 * Demo talebini CRM lead'ine çevirir.
 *  - `tenantId` verilirse: `tenants/{tenantId}/leads` altına okul lead'i yazılır.
 *  - verilmezse: kök `platformLeads` altına platform satış lead'i yazılır
 *    (okul henüz müşteri olmadığı için tenant'a zorlanmaz).
 * Başarılıysa demo talebi `converted` olarak işaretlenir ve leadId bağlanır.
 */
export async function convertDemoToLead(params: {
  demo: DemoRequestRecord;
  tenantId?: string;
}): Promise<ConvertResult> {
  const { demo, tenantId } = params;
  const note = demo.message || demo.note || "";

  const result = tenantId
    ? await createLead({
        tenantId,
        fullName: demo.fullName,
        phone: demo.phone,
        email: demo.email,
        source: "demo_request",
        note,
      })
    : await createPlatformLead({
        fullName: demo.fullName,
        phone: demo.phone,
        email: demo.email,
        institution: demo.institution,
        city: demo.city,
        source: "demo_request",
        note,
        demoRequestId: demo.id,
      });

  if (!result.ok || !result.id) {
    return {
      ok: false,
      leadId: null,
      tenantId: null,
      error: result.error ?? "Lead oluşturulamadı.",
    };
  }

  // Demo talebini dönüştürülmüş olarak işaretle (mock modda yazma atlanır).
  if (!result.mock) {
    await updateDemoRequest(demo.id, {
      status: "converted",
      leadId: result.id,
      leadTenantId: tenantId ?? "",
    });
  }

  return { ok: true, leadId: result.id, tenantId: tenantId ?? null };
}

/* -------------------------------------------------------------------------- */
/*  Okula özel aday/iletişim talepleri (belirli bir tenant'a yazılır)         */
/* -------------------------------------------------------------------------- */

export interface SchoolInquiryInput {
  schoolName: string;
  fullName: string;
  phone: string;
  email: string;
  /** İlgilenilen sınıf/kademe (opsiyonel). */
  grade?: string;
  message?: string;
}

/**
 * Aday velinin belirli bir okula gönderdiği bilgi/iletişim talebi.
 * `tenants/{tenantId}/demoRequests` altına yazılır (anonim/halka açık oluşturma);
 * okul personeli bunu CRM gelen kutusunda görür.
 */
export async function createSchoolInquiry(
  tenantId: string,
  data: SchoolInquiryInput,
): Promise<CreateResult> {
  return createDocument(tenantDemoRequests(tenantId), {
    ...data,
    institution: data.schoolName,
    type: "school_inquiry",
    status: "new",
  });
}

export interface SchoolInquiryRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  grade: string;
  message: string;
  type: string;
  status: string;
  createdAt: number | null;
}

/** Bir okulun aldığı aday/iletişim taleplerini listeler (tenant üyesi). */
export async function listSchoolInquiries(
  tenantId: string,
): Promise<SchoolInquiryRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantDemoRequests(tenantId))),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt;
    return {
      id: d.id,
      fullName: String(data.fullName ?? ""),
      phone: String(data.phone ?? ""),
      email: String(data.email ?? ""),
      grade: String(data.grade ?? ""),
      message: String(data.message ?? ""),
      type: String(data.type ?? "school_inquiry"),
      status: String(data.status ?? "new"),
      createdAt:
        ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
}
