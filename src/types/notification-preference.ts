/**
 * Kullanıcı bildirim tercihi veri modeli.
 */

export interface NotificationPreference {
  id: string;
  tenantId: string;
  /** Tercih sahibi kullanıcı kimliği. */
  userId: string;
  /** Bildirim türü → açık/kapalı eşlemesi (ör. { announcements: true }). */
  channels: Record<string, boolean>;
  updatedAt?: string;
}
