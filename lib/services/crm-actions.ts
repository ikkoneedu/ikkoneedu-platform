/**
 * CRM aksiyon servisi — kayıt durumlarını günceller (pipeline yönetimi).
 *
 * CRM kayıtları okul (tenant) bazında izoledir. Durum güncelleme yetkisi:
 * - Okul personeli (tenant üyesi) kendi okulunun kayıtlarını,
 * - Süper admin tüm okulların kayıtlarını günceller.
 * (Yetki Firestore kurallarıyla zorlanır.)
 *
 * Hedef alt koleksiyon kayıt türünden (CrmKind) türetilir; tek doğruluk
 * kaynağı korunur.
 */

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  tenantLeads,
  tenantScholarshipApplications,
  tenantDemoRequests,
} from "@/lib/firebase/collections";
import type { CrmKind } from "@/lib/services/crm-global";

/** Ortak CRM pipeline durumları (en yeni → kazanım/kayıp). */
export const CRM_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

export type CrmStatus = (typeof CRM_STATUSES)[number];

export const CRM_STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime geçildi",
  qualified: "Nitelikli",
  converted: "Kayıt oldu",
  lost: "Kaybedildi",
  // Eski/kaynak değerler için okunabilir karşılıklar:
  received: "Alındı",
};

export function crmStatusLabel(status: string): string {
  return CRM_STATUS_LABELS[status] ?? status;
}

/** Kayıt türüne göre alt koleksiyon yolunu döndürür. */
function collectionPathFor(kind: CrmKind, tenantId: string): string {
  switch (kind) {
    case "lead":
      return tenantLeads(tenantId);
    case "scholarship":
      return tenantScholarshipApplications(tenantId);
    case "inquiry":
    case "demo":
      return tenantDemoRequests(tenantId);
  }
}

/**
 * Bir CRM kaydının durumunu günceller. Hangi alt koleksiyondaki belge olduğu
 * tür + tenantId ile belirlenir.
 */
export async function updateCrmStatus(params: {
  tenantId: string;
  kind: CrmKind;
  id: string;
  status: CrmStatus;
}): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const path = collectionPathFor(params.kind, params.tenantId);
  // Lead kayıtları geçmişte `stage` alanını kullanır; tutarlılık için her iki
  // alanı da yazarız (okuma tarafı `status`'ü önceler).
  const patch: Record<string, unknown> = {
    status: params.status,
    updatedAt: serverTimestamp(),
  };
  if (params.kind === "lead") patch.stage = params.status;
  await updateDoc(doc(db, `${path}/${params.id}`), patch);
}
