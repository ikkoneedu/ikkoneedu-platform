/**
 * Rol sabitleri.
 * Platformdaki tüm kullanıcı rollerinin tek doğruluk kaynağı.
 */

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  TEACHER: "TEACHER",
  PARENT: "PARENT",
  STUDENT: "STUDENT",
  SUPPORT: "SUPPORT",
  SALES: "SALES",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Arayüzde gösterilecek Türkçe rol etiketleri. */
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Süper Admin",
  SCHOOL_ADMIN: "Okul Yöneticisi",
  TEACHER: "Öğretmen",
  PARENT: "Veli",
  STUDENT: "Öğrenci",
  SUPPORT: "Teknik Destek",
  SALES: "Satış Ekibi",
};

/** Yetki seviyesi sıralaması (büyük = daha yetkili). */
export const ROLE_LEVELS: Record<Role, number> = {
  SUPER_ADMIN: 100,
  SCHOOL_ADMIN: 80,
  SUPPORT: 60,
  SALES: 50,
  TEACHER: 40,
  PARENT: 20,
  STUDENT: 10,
};
