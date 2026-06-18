/**
 * Duyuru veri erişim katmanı (mock).
 * İleride Firestore "announcements" koleksiyonuyla değiştirilecek.
 */

import type { Announcement } from "@/src/types/announcement";

const announcements: Announcement[] = [
  { id: "an-1", tenantId: "ikk", title: "23 Nisan Kutlama Programı", description: "Ulusal Egemenlik ve Çocuk Bayramı töreni okul bahçesinde yapılacaktır.", category: "Etkinlik", audience: "all", publishedAt: "2026-04-18", authorId: "te-ayse" },
  { id: "an-2", tenantId: "ikk", title: "Veli Toplantısı Hatırlatması", description: "Dönem sonu veli görüşmeleri için randevu takvimi açıldı.", category: "Toplantı", audience: "parents", publishedAt: "2026-06-15", authorId: "te-ayse" },
  { id: "an-3", tenantId: "ikk", title: "Yaz Okulu Ön Kayıtları", description: "Yaz okulu programı ön kayıtları başlamıştır.", category: "Kayıt", audience: "all", publishedAt: "2026-06-12", authorId: "te-john" },
];

export async function getAnnouncements(tenantId?: string): Promise<Announcement[]> {
  return tenantId ? announcements.filter((a) => a.tenantId === tenantId) : announcements;
}
