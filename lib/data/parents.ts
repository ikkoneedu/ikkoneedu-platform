/**
 * Veli veri erişim katmanı (mock).
 * İleride Firestore "parents" / "users" koleksiyonuyla değiştirilecek.
 */

import type { Parent } from "@/src/types/parent";

const parents: Parent[] = [
  { id: "pa-yilmaz", tenantId: "ikk", firstName: "Yılmaz", lastName: "Ailesi", email: "yilmaz@example.com", studentIds: ["st-defne", "st-arda"], active: true },
  { id: "pa-demir", tenantId: "ikk", firstName: "Demir", lastName: "Ailesi", email: "demir@example.com", studentIds: ["st-elif"], active: true },
];

export async function getParents(tenantId?: string): Promise<Parent[]> {
  return tenantId ? parents.filter((p) => p.tenantId === tenantId) : parents;
}

export async function getParentById(id: string): Promise<Parent | undefined> {
  return parents.find((p) => p.id === id);
}
