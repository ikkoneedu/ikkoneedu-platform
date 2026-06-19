/**
 * Lead (aday) servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

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
