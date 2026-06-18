/**
 * Firestore belge/koleksiyon yolu yardımcıları (hazırlık).
 * Gerçek Firestore çağrısı yapmaz; yalnızca tutarlı yol üretimi sağlar.
 */

import { COLLECTIONS, PLATFORM, type CollectionName } from "@/lib/firebase/collections";

/** tenants/{tenantId} */
export function tenantDoc(tenantId: string): string {
  return `${COLLECTIONS.TENANTS}/${tenantId}`;
}

/** tenants/{tenantId}/{collection} */
export function tenantCollection(tenantId: string, collection: CollectionName): string {
  return `${tenantDoc(tenantId)}/${collection}`;
}

/** tenants/{tenantId}/{collection}/{docId} */
export function tenantDocPath(
  tenantId: string,
  collection: CollectionName,
  docId: string,
): string {
  return `${tenantCollection(tenantId, collection)}/${docId}`;
}

/** Kullanıcı cihazları: tenants/{tenantId}/users/{userId}/devices/{deviceId} */
export function userDevicePath(
  tenantId: string,
  userId: string,
  deviceId: string,
): string {
  return `${tenantCollection(tenantId, COLLECTIONS.USERS)}/${userId}/${COLLECTIONS.DEVICES}/${deviceId}`;
}

/** Bildirim tercihi: tenants/{tenantId}/notificationPreferences/{userId} */
export function notificationPreferencePath(tenantId: string, userId: string): string {
  return `${tenantCollection(tenantId, COLLECTIONS.NOTIFICATION_PREFERENCES)}/${userId}`;
}

/** Platform geneli config yolu. */
export const platformPaths = PLATFORM;
