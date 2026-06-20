"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLE_PERMISSIONS } from "@/lib/auth/roles";
import type { Permission } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/role-constants";

/** Mevcut kullanıcının belirli bir izni var mı? */
export function useHasPermission(permission: Permission): boolean {
  const { profile, firebaseReady } = useAuth();
  // Mock Mod: izin kontrolü uygulanmaz (mevcut akış korunur).
  if (!firebaseReady) return true;
  if (!profile) return false;
  return ROLE_PERMISSIONS[profile.role]?.includes(permission) ?? false;
}

/** Mevcut kullanıcının rolü verilen roller arasında mı? */
export function useHasRole(roles: Role[]): boolean {
  const { profile, firebaseReady } = useAuth();
  if (!firebaseReady) return true;
  if (!profile) return false;
  return roles.includes(profile.role);
}

interface RoleGateProps {
  children: ReactNode;
  /** Bu izin yoksa içerik gizlenir. */
  permission?: Permission;
  /** Bu rollerden biri değilse içerik gizlenir. */
  roles?: Role[];
  /** İzin yoksa gösterilecek alternatif (varsayılan: hiçbir şey). */
  fallback?: ReactNode;
}

/**
 * İzin/rol bazlı UI kapısı.
 * Örn. Müdürden finans kartını gizlemek:
 *   <RoleGate permission={PERMISSIONS.FINANCE_READ}>...</RoleGate>
 */
export function RoleGate({ children, permission, roles, fallback = null }: RoleGateProps) {
  const hasPermission = useHasPermission(permission ?? ("" as Permission));
  const hasRole = useHasRole(roles ?? []);

  const permitOk = permission ? hasPermission : true;
  const roleOk = roles && roles.length > 0 ? hasRole : true;

  return permitOk && roleOk ? <>{children}</> : <>{fallback}</>;
}
