/**
 * Sunucu (Admin SDK) tarafı Genel Müdür çözümleme + kişisel bildirim yardımcısı.
 *
 * `lib/services/tenant-leadership.ts`nin Admin SDK karşılığı — istemci SDK
 * (firebase/firestore) API routes içinde kullanılamaz, bu yüzden ayrı tutulur.
 * QR giriş-çıkış (geç/erken) uyarıları ve günlük özet burada Genel Müdüre
 * yönlendirilir.
 */

import type { Firestore } from "firebase-admin/firestore";

/** Bir tenant'ın aktif Genel Müdür (SCHOOL_ADMIN) hesap uid'lerini döner (Admin SDK). */
export async function getGeneralManagerUidsAdmin(
  adminDb: Firestore,
  tenantId: string,
): Promise<string[]> {
  if (!tenantId) return [];
  const snap = await adminDb
    .collection("users")
    .where("tenantId", "==", tenantId)
    .where("role", "==", "SCHOOL_ADMIN")
    .where("status", "==", "ACTIVE")
    .get();
  return snap.docs.map((d) => d.id);
}

/**
 * Tenant'ın tüm Genel Müdürlerine kişisel bildirim düşürür (best-effort;
 * hata olsa da çağıran akışı bozmaz). `tenants/{tenantId}/notifications`
 * şemasına uyar (bkz. `lib/services/notifications.ts`).
 */
export async function notifyGeneralManagers(
  adminDb: Firestore,
  tenantId: string,
  input: { title: string; body: string; type?: string; link?: string; expireAt?: Date },
): Promise<void> {
  try {
    const uids = await getGeneralManagerUidsAdmin(adminDb, tenantId);
    if (uids.length === 0) return;
    const now = new Date();
    const batch = adminDb.batch();
    for (const uid of uids) {
      const ref = adminDb.collection(`tenants/${tenantId}/notifications`).doc();
      batch.set(ref, {
        userId: uid,
        schoolId: tenantId,
        title: input.title,
        body: input.body,
        type: input.type ?? "attendance",
        read: false,
        link: input.link ?? "/attendance/logs",
        createdAt: now,
        ...(input.expireAt ? { expireAt: input.expireAt } : {}),
      });
    }
    await batch.commit();
  } catch {
    /* best-effort — bildirim başarısız olsa da yoklama akışı bozulmaz */
  }
}
