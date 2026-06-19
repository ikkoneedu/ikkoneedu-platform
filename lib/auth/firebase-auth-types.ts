/**
 * Firebase Auth tip hazırlığı.
 *
 * Bu sürümde gerçek kimlik doğrulama YOKTUR. Tipler, ileride Firebase Auth
 * custom claims ve Firestore kullanıcı belgeleri için sözleşmeyi tanımlar.
 */

import { ROLES, type Role } from "@/lib/auth/role-constants";

export { ROLES };
export type { Role };

/**
 * Firebase Auth oturumunun taşıyacağı custom claim'ler (ileride).
 * Middleware ve Security Rules bu alanlara göre yetkilendirme yapar.
 */
export interface FirebaseAuthClaims {
  role: Role;
  tenantId: string;
  schoolId?: string;
}

/**
 * Kullanıcı profili — Firestore `tenants/{tenantId}/users/{uid}` belgesi.
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: Role;
  tenantId: string;
  schoolId?: string;
  /** Veli kullanıcılar için bağlı öğrenci kimlikleri. */
  linkedStudentIds?: string[];
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
}
