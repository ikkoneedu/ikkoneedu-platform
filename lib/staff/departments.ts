/**
 * Personel departmanları (tek doğruluk kaynağı).
 *
 * Departman, kullanıcının ROLÜNDEN bağımsız bir gruplama etiketidir (yetki
 * rolde kalır). İngiliz Kültür Koleji'nin çalışan birimlerini temsil eder ve
 * personel ekleme/listeleme ile giriş-çıkış raporlarında kullanılır.
 */

export interface Department {
  id: string;
  /** Türkçe etiket. */
  label: string;
  /** İngilizce etiket. */
  labelEn: string;
}

export const DEPARTMENTS: Department[] = [
  { id: "akademik", label: "Akademik (Öğretmen)", labelEn: "Academic (Teacher)" },
  { id: "yonetim", label: "Yönetim", labelEn: "Management" },
  { id: "personel", label: "Personel (Genel)", labelEn: "Staff (General)" },
  { id: "yemekhane", label: "Yemekhane", labelEn: "Cafeteria" },
  { id: "kayit", label: "Kayıt", labelEn: "Registration" },
  { id: "onburo", label: "Ön Büro", labelEn: "Front Desk" },
  { id: "halklailiskiler", label: "Halkla İlişkiler", labelEn: "Public Relations" },
];

export const DEPARTMENT_IDS = DEPARTMENTS.map((d) => d.id);

export const DEFAULT_DEPARTMENT_ID = "personel";

export function isValidDepartmentId(id: string): boolean {
  return DEPARTMENT_IDS.includes(id);
}

/** Departman Türkçe etiketi (yoksa id döner). */
export function departmentLabel(id: string): string {
  return DEPARTMENTS.find((d) => d.id === id)?.label ?? id;
}
