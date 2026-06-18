/**
 * Mesaj veri modeli.
 * Okul içi mesajlaşma ve çok kanallı iletişim için.
 */

export type MessageChannel = "in-app" | "push" | "email" | "sms" | "whatsapp";
export type MessageStatus = "draft" | "scheduled" | "sent";

export interface Message {
  id: string;
  tenantId: string;
  schoolId?: string;
  /** Gönderen kullanıcı kimliği. */
  senderId: string;
  /** Hedef grup (ör. "all-parents", "class-5a"). */
  audience: string;
  channel: MessageChannel;
  title: string;
  body: string;
  status: MessageStatus;
  /** Okunma oranı (0-100). */
  readRate?: number;
  createdAt: string;
  updatedAt?: string;
  /** Zamanlanmış gönderim tarihi. */
  scheduledAt?: string;
}
