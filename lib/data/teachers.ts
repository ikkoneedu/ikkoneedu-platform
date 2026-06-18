/**
 * Öğretmen veri erişim katmanı (mock).
 * İleride Firestore "teachers" / "users" koleksiyonuyla değiştirilecek.
 */

import type { Teacher } from "@/src/types/teacher";

const teachers: Teacher[] = [
  { id: "te-ayse", tenantId: "ikk", schoolId: "sc-ikk-atasehir", firstName: "Ayşe", lastName: "Yılmaz", email: "ayse@example.com", subject: "Matematik", classIds: ["5a", "6b", "8b"], active: true, createdAt: "2025-08-20" },
  { id: "te-john", tenantId: "ikk", schoolId: "sc-ikk-atasehir", firstName: "John", lastName: "Smith", email: "john@example.com", subject: "İngilizce", classIds: ["5a", "7a"], active: true, createdAt: "2025-08-20" },
  { id: "te-zeynep", tenantId: "ikk", schoolId: "sc-ikk-atasehir", firstName: "Zeynep", lastName: "Kaya", email: "zeynep@example.com", subject: "Fen Bilimleri", classIds: ["7a", "8b"], active: true, createdAt: "2025-08-21" },
];

export async function getTeachers(tenantId?: string): Promise<Teacher[]> {
  return tenantId ? teachers.filter((t) => t.tenantId === tenantId) : teachers;
}

export async function getTeacherById(id: string): Promise<Teacher | undefined> {
  return teachers.find((t) => t.id === id);
}
