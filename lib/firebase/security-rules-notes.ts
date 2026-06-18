/**
 * Firestore Security Rules — planlama notları (hazırlık).
 *
 * Bu dosya gerçek kural dağıtmaz; ileride firestore.rules dosyasına
 * dönüştürülecek mantığı kod içinde belgeler. Custom Claims: role, tenantId, schoolId.
 *
 * Önerilen kural taslağı:
 *
 *   rules_version = '2';
 *   service cloud.firestore {
 *     match /databases/{db}/documents {
 *
 *       function signedIn()   { return request.auth != null; }
 *       function role()       { return request.auth.token.role; }
 *       function tenantId()   { return request.auth.token.tenantId; }
 *       function isSuper()    { return role() == 'SUPER_ADMIN'; }
 *       function sameTenant(t){ return signedIn() && (isSuper() || tenantId() == t); }
 *
 *       // Platform geneli — yalnızca super admin
 *       match /platform/{doc=**} {
 *         allow read, write: if isSuper();
 *       }
 *
 *       // Tenant kökü ve tüm alt koleksiyonları
 *       match /tenants/{tid} {
 *         allow read: if sameTenant(tid);
 *         allow write: if isSuper() || (sameTenant(tid) && role() == 'SCHOOL_ADMIN');
 *
 *         match /{sub}/{docId=**} {
 *           allow read:  if sameTenant(tid);
 *           allow write: if isSuper() || (sameTenant(tid) && role() in ['SCHOOL_ADMIN','TEACHER']);
 *         }
 *       }
 *     }
 *   }
 *
 * Rol bazlı erişim ilkeleri:
 * - SUPER_ADMIN: tüm tenant ve platform verisi.
 * - SCHOOL_ADMIN: yalnızca kendi tenantId'si.
 * - TEACHER: yalnızca bağlı sınıf/öğrenci verisi (schoolId + classIds filtreli sorgu).
 * - PARENT: yalnızca kendi çocuğuyla ilişkili belgeler (studentIds filtreli).
 * - STUDENT: yalnızca kendi belgesi (userId == request.auth.uid).
 */

export interface SecurityRolePolicy {
  role: string;
  scope: string;
}

export const SECURITY_POLICIES: SecurityRolePolicy[] = [
  { role: "SUPER_ADMIN", scope: "Tüm platform ve tenant verileri" },
  { role: "SCHOOL_ADMIN", scope: "Yalnızca kendi tenantId verisi" },
  { role: "TEACHER", scope: "Bağlı sınıf ve öğrenci verileri" },
  { role: "PARENT", scope: "Yalnızca kendi çocuğuyla ilişkili veriler" },
  { role: "STUDENT", scope: "Yalnızca kendi verisi" },
  { role: "SALES", scope: "Tenant lead ve randevu verileri (okuma ağırlıklı)" },
  { role: "SUPPORT", scope: "Tenant okuma + sistem izleme" },
];
