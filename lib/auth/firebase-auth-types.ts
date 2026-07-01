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
  /** İletişim telefonu (kullanıcı kendi günceller). */
  phone?: string;
  /**
   * Telefon numarası Firebase Phone Auth ile doğrulandı mı? Yalnızca
   * `linkWithPhoneNumber` başarıyla tamamlandığında (SMS kodu onaylanınca)
   * `true` yapılır; telefonla girişin ön koşuludur.
   */
  phoneVerified?: boolean;
  /** Profil/kimlik kartı fotoğrafı URL'i (kullanıcı kendi günceller). */
  photoURL?: string;
  /** Unvan/görev (ör. "İngilizce Öğretmeni") — kimlik kartında gösterilir. */
  title?: string;
  /** Doğum tarihi (YYYY-MM-DD) — kimlik kartında gösterilir. */
  birthDate?: string;
  /** Personel departmanı (lib/staff/departments.ts). */
  department?: string;
  role: Role;
  /** Kullanıcının bağlı olduğu okul/tenant (çoklu kiracılık anahtarı). */
  tenantId: string;
  /** Kampüs/şube. */
  schoolId?: string;
  status: UserStatus;
  /** Öğretmen/öğrenci için bağlı sınıf kimliği. */
  classId?: string;
  /** Sınıf adı (denormalize — öğrenci/veli panelinde gösterim için). */
  className?: string;
  /** Öğretmenin oluşturduğu kullanıcıyı (öğrenci/veli) üreten öğretmenin uid'i. */
  createdBy?: string;
  /** Oluşturan öğretmenin adı (denormalize — mesajlaşma kontağı için). */
  createdByName?: string;
  /** Veli kullanıcılar için bağlı öğrenci kimlikleri. */
  linkedStudentIds?: string[];
  /** Bağlı öğrenci özetleri (denormalize — veli panelinde gösterim için). */
  linkedStudents?: { uid: string; displayName: string }[];
  /** Veli kullanıcının bağlandığı veli kaydı (tenants/{id}/parents/{id}). */
  linkedParentId?: string;
  /** Öğretmen kullanıcının bağlandığı öğretmen kaydı. */
  linkedTeacherId?: string;
  /** Öğrenci kullanıcının bağlandığı öğrenci kaydı. */
  linkedStudentId?: string;
  /** Öğretmenin bağlı sınıf kimlikleri (denormalize — teacher.classIds). */
  classIds?: string[];
  /** İlk girişte şifre değiştirmesi gerekiyor mu (geçici şifreyle açıldıysa). */
  mustChangePassword?: boolean;
  /** Öğrencinin giriş kodu (öğretmen referansı). */
  accessCode?: string;
  createdAt: string;
  updatedAt?: string;
}
