/**
 * Bildirim veri erişim katmanı (mock).
 * İleride Firestore "notifications" koleksiyonu + push servisiyle değiştirilecek.
 */

import type { Notification } from "@/src/types/notification";

const notifications: Notification[] = [
  { id: "nt-1", tenantId: "ikk", recipientId: "pa-yilmaz", category: "urgent", title: "Acil Duyuru", message: "Hava koşulları nedeniyle yarın okul tatil edilmiştir.", channels: ["push", "sms"], read: false, createdAt: "2026-06-18T08:00:00Z" },
  { id: "nt-2", tenantId: "ikk", recipientId: "pa-yilmaz", category: "transport", title: "Servis Bildirimi", message: "Servis 12 dakika sonra varış noktasında olacak.", channels: ["push"], read: false, createdAt: "2026-06-18T07:30:00Z" },
  { id: "nt-3", tenantId: "ikk", recipientId: "pa-demir", category: "academic", title: "Akademik Bildirim", message: "Matematik sınavı sonucu yayınlandı.", channels: ["push", "email"], read: true, createdAt: "2026-06-17T15:00:00Z" },
];

export async function getNotifications(recipientId?: string): Promise<Notification[]> {
  return recipientId
    ? notifications.filter((n) => n.recipientId === recipientId)
    : notifications;
}
