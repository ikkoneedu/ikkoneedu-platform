/**
 * Duyuru servisi — okul/öğretmen → veli/öğrenci iletişimi.
 *
 * - createAnnouncement: personel (öğretmen/müdür/yönetici) duyuru oluşturur.
 * - listAnnouncements: tenant'taki son duyurular (tüm tenant üyeleri okur).
 *
 * Yazma yetkisi Firestore kurallarıyla personele kısıtlanır.
 */

import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantAnnouncements } from "@/lib/firebase/collections";

export const ANNOUNCEMENT_STATUSES = ["draft", "published", "archived"] as const;
export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export interface AnnouncementInput {
  tenantId: string;
  schoolId?: string;
  authorUid: string;
  authorName: string;
  title: string;
  body: string;
  /** Hedef roller (boş = tüm roller). */
  targetRoles?: string[];
  /** Hedef sınıf kimlikleri (boş = tüm sınıflar). */
  targetClassIds?: string[];
  /** Yayın durumu (vars. published). */
  status?: AnnouncementStatus;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  authorName: string;
  createdAt: Date | null;
}

/** Hedefleme/durum bilgisini de taşıyan zengin duyuru kaydı. */
export interface AnnouncementRecord extends Announcement {
  createdBy: string;
  targetRoles: string[];
  targetClassIds: string[];
  status: string;
}

/** Oluşturulan duyurunun kimliğini döner (notification fan-out için). */
export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<string | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const ref = await addDoc(collection(db, tenantAnnouncements(input.tenantId)), {
    title: input.title,
    body: input.body,
    authorUid: input.authorUid,
    authorName: input.authorName,
    createdBy: input.authorUid,
    schoolId: input.schoolId ?? input.tenantId,
    targetRoles: input.targetRoles ?? [],
    targetClassIds: input.targetClassIds ?? [],
    status: input.status ?? "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

function mapRecord(id: string, data: Record<string, unknown>): AnnouncementRecord {
  const ts = data.createdAt as { toDate?: () => Date } | null | undefined;
  return {
    id,
    title: String(data.title ?? ""),
    body: String(data.body ?? ""),
    authorName: String(data.authorName ?? ""),
    createdBy: String(data.createdBy ?? data.authorUid ?? ""),
    targetRoles: Array.isArray(data.targetRoles) ? (data.targetRoles as string[]) : [],
    targetClassIds: Array.isArray(data.targetClassIds)
      ? (data.targetClassIds as string[])
      : [],
    status: String(data.status ?? "published"),
    createdAt: ts?.toDate ? ts.toDate() : null,
  };
}

/**
 * Geçerli kullanıcı için görünür duyurular: yayınlanmış (published) VE hedef
 * rolü kullanıcının rolünü içeren (veya hedef rol boş) VE hedef sınıf kullanıcı
 * sınıfını içeren (veya hedef sınıf boş). Filtre istemcide uygulanır.
 */
export async function listAnnouncementsForCurrentUser(
  tenantId: string,
  role: string,
  classId?: string,
  max = 30,
): Promise<AnnouncementRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(
    query(collection(db, tenantAnnouncements(tenantId)), limit(max)),
  );
  const rows = snap.docs
    .map((d) => mapRecord(d.id, d.data()))
    .filter((a) => a.status === "published")
    .filter((a) => a.targetRoles.length === 0 || a.targetRoles.includes(role))
    .filter(
      (a) =>
        a.targetClassIds.length === 0 ||
        (classId ? a.targetClassIds.includes(classId) : false),
    );
  rows.sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );
  return rows;
}

/** Tenant'taki son duyuruları (yeni → eski) döner. */
export async function listAnnouncements(
  tenantId: string,
  max = 20,
): Promise<Announcement[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, tenantAnnouncements(tenantId)),
      orderBy("createdAt", "desc"),
      limit(max),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toDate?: () => Date } | null | undefined;
    return {
      id: d.id,
      title: String(data.title ?? ""),
      body: String(data.body ?? ""),
      authorName: String(data.authorName ?? ""),
      createdAt: ts?.toDate ? ts.toDate() : null,
    };
  });
}
