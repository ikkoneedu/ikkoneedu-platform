/**
 * Öğrenci veri erişim katmanı (mock).
 * İleride Firestore "students" koleksiyonu sorgularıyla değiştirilecek.
 * Bileşenler bu fonksiyonlara bağlanır; veri kaynağı şeffaf biçimde değişebilir.
 */

import type { Student } from "@/src/types/student";

const students: Student[] = [
  { id: "st-defne", tenantId: "ikk", schoolId: "sc-ikk-atasehir", firstName: "Defne", lastName: "Yılmaz", grade: "5. Sınıf", classGroup: "5A", parentIds: ["pa-yilmaz"], gpa: 87, attendanceRate: 98, active: true, createdAt: "2025-09-01" },
  { id: "st-arda", tenantId: "ikk", schoolId: "sc-ikk-atasehir", firstName: "Arda", lastName: "Yılmaz", grade: "8. Sınıf", classGroup: "8B", parentIds: ["pa-yilmaz"], gpa: 84, attendanceRate: 96, active: true, createdAt: "2025-09-01" },
  { id: "st-elif", tenantId: "ikk", schoolId: "sc-ikk-atasehir", firstName: "Elif", lastName: "Demir", grade: "5. Sınıf", classGroup: "5A", parentIds: ["pa-demir"], gpa: 92, attendanceRate: 99, active: true, createdAt: "2025-09-02" },
];

export async function getStudents(tenantId?: string): Promise<Student[]> {
  return tenantId ? students.filter((s) => s.tenantId === tenantId) : students;
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  return students.find((s) => s.id === id);
}
