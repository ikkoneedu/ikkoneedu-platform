/**
 * Okul veri erişim katmanı (mock).
 * İleride Firestore "schools" koleksiyonuyla değiştirilecek.
 */

import type { School } from "@/src/types/school";

const schools: School[] = [
  { id: "sc-ikk-atasehir", tenantId: "ikk", name: "İngiliz Kültür Koleji — Ataşehir", city: "İstanbul", levels: ["primary", "secondary"], studentCount: 1840, active: true, createdAt: "2025-08-01" },
  { id: "sc-atael", tenantId: "atael", name: "Atael Koleji", city: "Ankara", levels: ["primary", "secondary", "highschool"], studentCount: 842, active: true, createdAt: "2025-08-05" },
  { id: "sc-demo", tenantId: "demo", name: "Demo Okul", city: "İzmir", levels: ["preschool", "primary"], studentCount: 120, active: true, createdAt: "2026-06-01" },
];

export async function getSchools(tenantId?: string): Promise<School[]> {
  return tenantId ? schools.filter((s) => s.tenantId === tenantId) : schools;
}
