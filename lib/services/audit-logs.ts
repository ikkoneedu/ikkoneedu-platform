/**
 * Denetim kaydı (audit log) servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

import { createDocument, type CreateResult } from "@/lib/services/firestore-helpers";
import { tenantAuditLogs } from "@/lib/firebase/collections";

const DEFAULT_TENANT_ID = "tenant_ikk";

export interface AuditLogInput {
  tenantId?: string;
  /** Eylemi yapan kullanıcı (ileride Firebase Auth uid). */
  actorId?: string;
  /** Yapılan eylem (ör. "demo_request.create"). */
  action: string;
  /** Etkilenen kaynak (ör. "demoRequests/abc"). */
  resource?: string;
  /** Ek bağlam verisi. */
  meta?: Record<string, unknown>;
}

export async function createAuditLog(data: AuditLogInput): Promise<CreateResult> {
  const tenantId = data.tenantId ?? DEFAULT_TENANT_ID;
  return createDocument(tenantAuditLogs(tenantId), {
    ...data,
    tenantId,
  });
}
