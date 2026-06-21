/**
 * Global CRM toplama servisi — yalnızca SUPER_ADMIN.
 *
 * Mimari: CRM verisi okul (tenant) bazında izoledir. Her okul yalnızca kendi
 * lead/başvuru/talep kayıtlarını görür. Süper admin ise TÜM okulların verisini
 * tek bir birleşik akışta görür; bunun için Firestore "collection group"
 * sorguları kullanılır (tek sorguda tüm tenant alt koleksiyonları).
 *
 * Veri kalitesi: her kaydın hangi okula ait olduğu BELGE YOLUNDAN türetilir
 * (tenants/{tenantId}/...); alanda saklanan tenantId'ye güvenilmez. Böylece tek
 * doğruluk kaynağı korunur. Tüm kayıtlar ortak `GlobalCrmEntry` şemasına
 * normalize edilir.
 *
 * Not: collection group sorguları için Firestore kurallarında
 * `match /{path=**}/<koleksiyon>/{id}` biçiminde SUPER_ADMIN okuma izni gerekir.
 */

import {
  collectionGroup,
  getDocs,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";

export type CrmKind = "lead" | "scholarship" | "inquiry" | "demo";

export interface GlobalCrmEntry {
  id: string;
  /** Belge yolundan türetilen okul (tenant) kimliği. */
  tenantId: string;
  kind: CrmKind;
  /** Görüntülenecek ad (öğrenci/aday/kurum yetkilisi). */
  name: string;
  phone: string;
  email: string;
  /** Pipeline durumu (stage/status). */
  status: string;
  /** Kaynak/etiket (lead source, başvuru no, kurum vb.). */
  detail: string;
  createdAt: number | null;
}

const KIND_LABELS: Record<CrmKind, string> = {
  lead: "Lead",
  scholarship: "Bursluluk Başvurusu",
  inquiry: "Bilgi Talebi",
  demo: "Demo Talebi",
};

export function crmKindLabel(kind: CrmKind): string {
  return KIND_LABELS[kind] ?? kind;
}

function toMillis(value: unknown): number | null {
  const ts = value as { toMillis?: () => number } | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : null;
}

/** Belge yolundan tenantId çıkarır: tenants/{tenantId}/<col>/{id}. */
function tenantIdFromPath(snap: QueryDocumentSnapshot): string {
  return snap.ref.parent.parent?.id ?? "—";
}

async function fetchGroup(
  collectionId: string,
  map: (snap: QueryDocumentSnapshot) => GlobalCrmEntry | null,
): Promise<GlobalCrmEntry[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDocs(collectionGroup(db, collectionId));
    return snap.docs
      .map(map)
      .filter((e): e is GlobalCrmEntry => e !== null);
  } catch {
    // Kurallar/izin yoksa sessizce boş dön (panel diğer kaynakları gösterir).
    return [];
  }
}

/**
 * Tüm okulların CRM kayıtlarını (lead + bursluluk + talep) birleşik ve
 * normalize edilmiş şekilde, en yeni önce sıralı döndürür.
 */
export async function listAllCrm(): Promise<GlobalCrmEntry[]> {
  const [leads, applications, requests] = await Promise.all([
    fetchGroup(COLLECTIONS.LEADS, (d) => {
      const data = d.data();
      return {
        id: d.id,
        tenantId: tenantIdFromPath(d),
        kind: "lead",
        name: String(data.fullName ?? "—"),
        phone: String(data.phone ?? ""),
        email: String(data.email ?? ""),
        status: String(data.status ?? data.stage ?? "new"),
        detail: String(data.source ?? data.note ?? ""),
        createdAt: toMillis(data.createdAt),
      };
    }),
    fetchGroup(COLLECTIONS.SCHOLARSHIP_APPLICATIONS, (d) => {
      const data = d.data();
      return {
        id: d.id,
        tenantId: tenantIdFromPath(d),
        kind: "scholarship",
        name: String(data.studentName ?? "—"),
        phone: String(data.parentPhone ?? ""),
        email: String(data.parentEmail ?? ""),
        status: String(data.status ?? "received"),
        detail: String(data.applicationNo ?? data.parentName ?? ""),
        createdAt: toMillis(data.createdAt),
      };
    }),
    fetchGroup(COLLECTIONS.DEMO_REQUESTS, (d) => {
      const data = d.data();
      const isInquiry = String(data.type ?? "") === "school_inquiry";
      return {
        id: d.id,
        tenantId: tenantIdFromPath(d),
        kind: isInquiry ? "inquiry" : "demo",
        name: String(data.fullName ?? "—"),
        phone: String(data.phone ?? ""),
        email: String(data.email ?? ""),
        status: String(data.status ?? "new"),
        detail: String(data.grade ?? data.institution ?? ""),
        createdAt: toMillis(data.createdAt),
      };
    }),
  ]);

  return [...leads, ...applications, ...requests].sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  );
}
