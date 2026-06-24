/**
 * Rol sabitleri.
 * Platformdaki tüm kullanıcı rollerinin tek doğruluk kaynağı.
 */

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  /** Okul sahibi / kurucu — okulun en üst yetkilisi (finans dahil her şey). */
  FOUNDER: "FOUNDER",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  PRINCIPAL: "PRINCIPAL",
  /** Müdür yardımcısı — müdür yetkilerine yakın, finans hariç. */
  VICE_PRINCIPAL: "VICE_PRINCIPAL",
  /** Koordinatör — akademik/öğretmen koordinasyonu, ders programı. */
  COORDINATOR: "COORDINATOR",
  TEACHER: "TEACHER",
  PARENT: "PARENT",
  STUDENT: "STUDENT",
  SUPPORT: "SUPPORT",
  SALES: "SALES",
  /** Servis şoförü — yalnızca atandığı servisin canlı konumunu paylaşır. */
  DRIVER: "DRIVER",
  /** Halkla ilişkiler — CRM/aday veli ve duyuru yönetimi. */
  PR: "PR",
  /** Halk / aday veli — kendi kayıt olan genel kullanıcı. */
  PUBLIC: "PUBLIC",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Arayüzde gösterilecek Türkçe rol etiketleri. */
export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Süper Admin",
  FOUNDER: "Kurucu",
  SCHOOL_ADMIN: "Okul Yöneticisi",
  PRINCIPAL: "Müdür",
  VICE_PRINCIPAL: "Müdür Yardımcısı",
  COORDINATOR: "Koordinatör",
  TEACHER: "Öğretmen",
  PARENT: "Veli",
  STUDENT: "Öğrenci",
  SUPPORT: "Teknik Destek",
  DRIVER: "Servis Şoförü",
  SALES: "Satış Ekibi",
  PR: "Halkla İlişkiler",
  PUBLIC: "Genel Kullanıcı",
};

/** Yetki seviyesi sıralaması (büyük = daha yetkili). */
export const ROLE_LEVELS: Record<Role, number> = {
  SUPER_ADMIN: 100,
  FOUNDER: 90,
  SCHOOL_ADMIN: 80,
  PRINCIPAL: 70,
  VICE_PRINCIPAL: 65,
  SUPPORT: 60,
  COORDINATOR: 55,
  SALES: 50,
  PR: 45,
  TEACHER: 40,
  DRIVER: 30,
  PARENT: 20,
  STUDENT: 10,
  PUBLIC: 5,
};
