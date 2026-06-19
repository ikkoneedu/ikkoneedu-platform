/**
 * Firebase Auth tipleri.
 *
 * Roller `role-constants.ts`'ten gelir (tek doğruluk kaynağı). UserProfile,
 * Firestore'daki kullanıcı belgesinin sözleşmesidir.
 */

import { ROLES, type Role } from "@/lib/auth/role-constants";

export { ROLES };
export type { Role };

/** Kullanıcı hesap durumu. */
export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

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
 * Kullanıcı profili — Firestore `users/{uid}` belgesi (MVP).
 *
 * İlk girişte tenantId bilinmediği için profil kök `users/{uid}` belgesinde
 * tutulur; tenantId/schoolId bu belgeden okunur. Çoklu kiracılık korunur:
 * tenantId profilde zorunlu bir alandır.
 */
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  /** Kullanıcının bağlı olduğu okul/tenant (çoklu kiracılık anahtarı). */
  tenantId: string;
  /** Kampüs/şube. */
  schoolId?: string;
  status: UserStatus;
  /** Veli kullanıcılar için bağlı öğrenci kimlikleri. */
  linkedStudentIds?: string[];
  createdAt: string;
  updatedAt?: string;
}
