/**
 * Denetim kaydı (audit log) servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { createDocument, type CreateResult } from "@/lib/services/firestore-helpers";
import { platformAuditLogs, tenantAuditLogs } from "@/lib/firebase/collections";

const DEFAULT_TENANT_ID = "platform"; // tenant'siz fallback (demo/genel) — süper admin okur

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

/* -------------------------------------------------------------------------- */
/*  Platform düzeyi denetim kaydı (yalnızca SUPER_ADMIN)                        */
/* -------------------------------------------------------------------------- */

export interface PlatformAuditInput {
  actorId?: string;
  /** Yapılan eylem (ör. "school.create", "user.role_change"). */
  action: string;
  /** Etkilenen kaynak (ör. "tenants/ornek-koleji"). */
  resource?: string;
  meta?: Record<string, unknown>;
}

/** Platform geneli yönetim işlemini kaydeder. Hata sessizce yutulur (best-effort). */
export async function createPlatformAuditLog(
  data: PlatformAuditInput,
): Promise<CreateResult> {
  return createDocument(platformAuditLogs(), { ...data });
}

export interface PlatformAuditRecord {
  id: string;
  actorId: string;
  action: string;
  resource: string;
  meta: Record<string, unknown>;
  createdAt: number | null;
}

/** Platform denetim kayıtlarını (en yeni) listeler — yalnızca SUPER_ADMIN. */
export async function listPlatformAuditLogs(
  max = 50,
): Promise<PlatformAuditRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  let snap;
  try {
    snap = await getDocs(
      query(collection(db, platformAuditLogs()), orderBy("createdAt", "desc"), limit(max)),
    );
  } catch {
    snap = await getDocs(collection(db, platformAuditLogs()));
  }
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      actorId: String(data.actorId ?? ""),
      action: String(data.action ?? ""),
      resource: String(data.resource ?? ""),
      meta: (data.meta as Record<string, unknown>) ?? {},
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
}
