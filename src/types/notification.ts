/**
 * Bildirim veri modeli.
 */

export type NotificationChannel = "push" | "email" | "sms" | "whatsapp" | "in-app";
export type NotificationCategory =
  | "urgent"
  | "message"
  | "event"
  | "transport"
  | "academic";

export interface Notification {
  id: string;
  tenantId: string;
  /** Alıcı kullanıcı kimliği. */
  recipientId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  channels: NotificationChannel[];
  read: boolean;
  createdAt: string;
}
