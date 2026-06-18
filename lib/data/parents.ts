/**
 * Veli veri erişim katmanı (mock).
 * İleride Firestore "parents" / "users" koleksiyonuyla değiştirilecek.
 */

import type { Parent } from "@/src/types/parent";

const parents: Parent[] = [
  { id: "pa-yilmaz", tenantId: "ikk", schoolId: "sc-ikk-atasehir", firstName: "Yılmaz", lastName: "Ailesi", email: "yilmaz@example.com", studentIds: ["st-defne", "st-arda"], active: true, createdAt: "2025-09-01" },
  { id: "pa-demir", tenantId: "ikk", schoolId: "sc-ikk-atasehir", firstName: "Demir", lastName: "Ailesi", email: "demir@example.com", studentIds: ["st-elif"], active: true, createdAt: "2025-09-02" },
];

export async function getParents(tenantId?: string): Promise<Parent[]> {
  return tenantId ? parents.filter((p) => p.tenantId === tenantId) : parents;
}

export async function getParentById(id: string): Promise<Parent | undefined> {
  return parents.find((p) => p.id === id);
}
