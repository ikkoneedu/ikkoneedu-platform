/**
 * Erişim kontrolü yardımcıları (RBAC).
 * Henüz gerçek auth'a bağlı değildir; saf, test edilebilir fonksiyonlardır.
 */

import { type Role, ROLE_LEVELS } from "@/lib/auth/role-constants";
import type { Permission } from "@/lib/auth/permissions";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";

/** Verilen rolün belirtilen yetkiye sahip olup olmadığını döner. */
export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Rolün, izin verilen roller arasında olup olmadığını döner. */
export function hasAnyRole(role: Role, allowed: Role[]): boolean {
  return allowed.includes(role);
}

/** Rolün en az verilen seviye kadar yetkili olup olmadığını döner. */
export function hasMinLevel(role: Role, minRole: Role): boolean {
  return ROLE_LEVELS[role] >= ROLE_LEVELS[minRole];
}
