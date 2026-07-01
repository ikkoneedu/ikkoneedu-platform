/**
 * Okul liderliği/organizasyon yardımcıları.
 *
 * - `getGeneralManagerUids`: QR devam uyarıları ve günlük özet gibi yalnızca
 *   Genel Müdüre (SCHOOL_ADMIN) gitmesi gereken bildirimlerin hedef uid'lerini
 *   çözer.
 * - `listStaffDirectory`: hiyerarşik doğrudan mesajlaşma için (Genel Müdür →
 *   Müdür → Müdür Yardımcısı → Öğretmen) tenant personel listesini döner.
 *
 * `lib/services/users.ts`teki `listTenantUsers` üzerine kurulu — ayrı bir
 * Firestore sorgusu tekrar etmez.
 */

import { ROLES, ROLE_LABELS, type Role } from "@/lib/auth/role-constants";
import { listTenantUsers, type TenantUser } from "@/lib/services/users";

const STAFF_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.FOUNDER,
  ROLES.SCHOOL_ADMIN,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.TEACHER,
  ROLES.SUPPORT,
  ROLES.SALES,
  ROLES.PR,
  ROLES.DRIVER,
];

/** Bir tenant'ın aktif Genel Müdür (SCHOOL_ADMIN) hesap uid'lerini döner. */
export async function getGeneralManagerUids(tenantId: string): Promise<string[]> {
  if (!tenantId) return [];
  const users = await listTenantUsers(tenantId);
  return users
    .filter((u) => u.role === ROLES.SCHOOL_ADMIN && u.status === "ACTIVE")
    .map((u) => u.uid);
}

export interface StaffDirectoryEntry {
  uid: string;
  displayName: string;
  role: Role;
  roleLabel: string;
}

/**
 * Tenant'taki personel dizinini döner (öğrenci/veli hariç), hiyerarşi
 * seviyesine göre sıralı — mesaj alıcı seçicisinde kullanılır.
 * `excludeUid` verilirse (genelde giriş yapan kullanıcı) listeden çıkarılır.
 */
export async function listStaffDirectory(
  tenantId: string,
  excludeUid?: string,
): Promise<StaffDirectoryEntry[]> {
  if (!tenantId) return [];
  const users = await listTenantUsers(tenantId);
  return users
    .filter(
      (u): u is TenantUser =>
        STAFF_ROLES.includes(u.role) &&
        u.status === "ACTIVE" &&
        u.uid !== excludeUid,
    )
    .map((u) => ({
      uid: u.uid,
      displayName: u.displayName || u.email,
      role: u.role,
      roleLabel: ROLE_LABELS[u.role] ?? u.role,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, "tr"));
}
