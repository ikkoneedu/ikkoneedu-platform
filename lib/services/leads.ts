/**
 * Lead (aday) servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

import { collection, getDocs, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { createDocument, type CreateResult } from "@/lib/services/firestore-helpers";
import { tenantLeads } from "@/lib/firebase/collections";

const DEFAULT_TENANT_ID = "tenant_ikk";

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
    };
  });
}
