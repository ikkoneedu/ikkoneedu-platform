/**
 * Rol bazlı yönlendirme.
 * Başarılı girişten sonra kullanıcı rolüne göre açılış paneli belirlenir.
 */

import { ROLES, type Role } from "@/lib/auth/role-constants";

/** Rol → açılış route'u. */
export const ROLE_HOME_ROUTE: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "/super-admin",
  [ROLES.SCHOOL_ADMIN]: "/admin",
  [ROLES.PRINCIPAL]: "/admin",
  [ROLES.TEACHER]: "/teacher",
  [ROLES.PARENT]: "/parent",
  [ROLES.STUDENT]: "/student",
  [ROLES.SALES]: "/crm",
  [ROLES.SUPPORT]: "/messages",
  [ROLES.PUBLIC]: "/portal",
};

/** Rol bilinmiyorsa güvenli varsayılan. */
export const FALLBACK_HOME_ROUTE = "/admin";

/**
 * `/login?role=...` query parametresini (UI rolü) gerçek Role'e eşler.
 * Profil okunamazsa yönlendirme için yedek olarak kullanılır.
 */
const QUERY_ROLE_TO_ROLE: Record<string, Role> = {
  admin: ROLES.SCHOOL_ADMIN,
  teacher: ROLES.TEACHER,
  parent: ROLES.PARENT,
  student: ROLES.STUDENT,
  "super-admin": ROLES.SUPER_ADMIN,
  sales: ROLES.SALES,
  support: ROLES.SUPPORT,
};

/** Rol için açılış route'unu döndürür (tanımsızsa güvenli varsayılan). */
export function getHomeRouteForRole(role?: Role | null): string {
  if (role && ROLE_HOME_ROUTE[role]) return ROLE_HOME_ROUTE[role];
  return FALLBACK_HOME_ROUTE;
}

/** `?role=` query parametresini Role'e çevirir (bilinmiyorsa undefined). */
export function roleFromQueryParam(queryRole?: string | null): Role | undefined {
  if (!queryRole) return undefined;
  return QUERY_ROLE_TO_ROLE[queryRole];
}
