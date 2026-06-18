/**
 * Kullanıcı veri modeli.
 * Tüm roller (super admin, okul yöneticisi, öğretmen, veli, öğrenci vb.) için
 * ortak temel kullanıcı yapısı.
 */

import type { Role } from "@/lib/auth/role-constants";

export interface BaseUser {
  id: string;
  /** Bağlı olduğu tenant (okul) kimliği. */
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
}

export interface UserProfile extends BaseUser {
  title?: string;
  lastLoginAt?: string;
}
