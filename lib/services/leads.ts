/**
 * Lead (aday) servisi — Firestore'a yazmaya hazır.
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
import { tenantLeads, platformLeads } from "@/lib/firebase/collections";

const DEFAULT_TENANT_ID = "platform"; // tenant'siz fallback (demo/genel) — süper admin okur

/** CRM satış lead'i pipeline durumları (yeni → kazanım/kayıp). */
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "meeting_scheduled",
  "proposal_sent",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime geçildi",
  meeting_scheduled: "Toplantı planlandı",
  proposal_sent: "Teklif gönderildi",
  won: "Kazanıldı",
  lost: "Kaybedildi",
};

export function leadStatusLabel(status: string): string {
  return LEAD_STATUS_LABELS[status] ?? status;
}

export interface LeadInput {
  tenantId?: string;
  fullName: string;
  phone: string;
  email?: string;
  source?: string;
  note?: string;
}

export async function createLead(data: LeadInput): Promise<CreateResult> {
  const tenantId = data.tenantId ?? DEFAULT_TENANT_ID;
  return createDocument(tenantLeads(tenantId), {
    ...data,
    tenantId,
    stage: "new",
  });
}

export interface LeadRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  source: string;
  note: string;
  status: string;
}

/** Tenant'taki lead'leri listeler (personel). */
export async function listLeads(tenantId: string): Promise<LeadRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(query(collection(db, tenantLeads(tenantId))));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      fullName: String(data.fullName ?? ""),
      phone: String(data.phone ?? ""),
      email: String(data.email ?? ""),
      source: String(data.source ?? ""),
      note: String(data.note ?? ""),
      status: String(data.status ?? data.stage ?? "new"),
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Platform düzeyi SaaS satış lead'leri (kök platformLeads — yalnızca SUPER) */
/* -------------------------------------------------------------------------- */

export interface PlatformLeadInput {
  /** Türetildiği demo talebi (platformDemoRequests/{id}). */
  sourceRequestId?: string;
  institution?: string;
  contactName: string;
  phone: string;
  email?: string;
  city?: string;
  institutionType?: string;
  studentCount?: string;
  notes?: string;
  assignedTo?: string;
}

export interface PlatformLeadRecord {
  id: string;
  sourceRequestId: string;
  institution: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  institutionType: string;
  studentCount: string;
  status: string;
  notes: string;
  assignedTo: string;
  createdAt: number | null;
  updatedAt: number | null;
}

/**
 * Platform satış lead'i oluşturur (kök `platformLeads`). Okul henüz tenant
 * değildir; bu yüzden lead tenant altına yazılmaz. status = "new".
 */
export async function createPlatformLead(
  data: PlatformLeadInput,
): Promise<CreateResult> {
  // Boş opsiyonel alanları yazma (temiz belge).
  const payload: Record<string, unknown> = {
    contactName: data.contactName,
    phone: data.phone,
    status: "new",
  };
  if (data.sourceRequestId) payload.sourceRequestId = data.sourceRequestId;
  if (data.institution) payload.institution = data.institution;
  if (data.email) payload.email = data.email;
  if (data.city) payload.city = data.city;
  if (data.institutionType) payload.institutionType = data.institutionType;
  if (data.studentCount) payload.studentCount = data.studentCount;
  if (data.notes) payload.notes = data.notes;
  if (data.assignedTo) payload.assignedTo = data.assignedTo;
  return createDocument(platformLeads(), payload);
}

/** Platform satış lead'lerini listeler (yalnızca SUPER_ADMIN). */
export async function listPlatformLeads(): Promise<PlatformLeadRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const toMillis = (v: unknown): number | null => {
    const ts = v as { toMillis?: () => number } | undefined;
    return ts && typeof ts.toMillis === "function" ? ts.toMillis() : null;
  };
  const snap = await getDocs(query(collection(db, platformLeads())));
  const rows = snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      sourceRequestId: String(data.sourceRequestId ?? ""),
      institution: String(data.institution ?? ""),
      // Geriye dönük uyum: eski `fullName`/`note` alanlarını da oku.
      contactName: String(data.contactName ?? data.fullName ?? ""),
      phone: String(data.phone ?? ""),
      email: String(data.email ?? ""),
      city: String(data.city ?? ""),
      institutionType: String(data.institutionType ?? ""),
      studentCount: String(data.studentCount ?? ""),
      status: String(data.status ?? "new"),
      notes: String(data.notes ?? data.note ?? ""),
      assignedTo: String(data.assignedTo ?? ""),
      createdAt: toMillis(data.createdAt),
      updatedAt: toMillis(data.updatedAt),
    };
  });
  return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export interface PlatformLeadPatch {
  status?: LeadStatus;
  notes?: string;
  assignedTo?: string;
}

/** Platform lead'ini günceller (durum / not / atanan). Yalnızca SUPER_ADMIN. */
export async function updatePlatformLead(
  id: string,
  patch: PlatformLeadPatch,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.status !== undefined) data.status = patch.status;
  if (patch.notes !== undefined) data.notes = patch.notes;
  if (patch.assignedTo !== undefined) data.assignedTo = patch.assignedTo;
  await updateDoc(doc(db, `${platformLeads()}/${id}`), data);
}

/** Platform lead'inin yalnızca durumunu günceller (kısa yol). */
export async function updatePlatformLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<void> {
  await updatePlatformLead(id, { status });
}
