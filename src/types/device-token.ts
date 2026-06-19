/**
 * Cihaz / FCM token veri modeli.
 * Push bildirim hedeflemesi için.
 */

export type DevicePlatform = "ios" | "android" | "web";

export interface DeviceToken {
  id: string;
  tenantId: string;
  userId: string;
  /** FCM kayıt token'ı. */
  token: string;
  platform: DevicePlatform;
  /** Token'ın hâlâ geçerli olup olmadığı. */
  active: boolean;
  createdAt: string;
  lastSeenAt?: string;
}
