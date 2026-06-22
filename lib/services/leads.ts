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
  fullName: string;
  phone: string;
  email?: string;
  institution?: string;
  city?: string;
  source?: string;
  note?: string;
  /** Bu lead'in türetildiği demo talebi (varsa). */
  demoRequestId?: string;
}

export interface PlatformLeadRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  institution: string;
  city: string;
  source: string;
  note: string;
  status: string;
  demoRequestId: string;
  createdAt: number | null;
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
    fullName: data.fullName,
    phone: data.phone,
    status: "new",
  };
  if (data.email) payload.email = data.email;
  if (data.institution) payload.institution = data.institution;
  if (data.city) payload.city = data.city;
  if (data.source) payload.source = data.source;
  if (data.note) payload.note = data.note;
  if (data.demoRequestId) payload.demoRequestId = data.demoRequestId;
  return createDocument(platformLeads(), payload);
}

/** Platform satış lead'lerini listeler (yalnızca SUPER_ADMIN). */
export async function listPlatformLeads(): Promise<PlatformLeadRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(query(collection(db, platformLeads())));
  const rows = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      fullName: String(data.fullName ?? ""),
      phone: String(data.phone ?? ""),
      email: String(data.email ?? ""),
      institution: String(data.institution ?? ""),
      city: String(data.city ?? ""),
      source: String(data.source ?? ""),
      note: String(data.note ?? ""),
      status: String(data.status ?? "new"),
      demoRequestId: String(data.demoRequestId ?? ""),
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
  return rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Platform lead'inin pipeline durumunu günceller (yalnızca SUPER_ADMIN). */
export async function updatePlatformLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, `${platformLeads()}/${id}`), {
    status,
    updatedAt: serverTimestamp(),
  });
}
