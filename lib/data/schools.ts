/**
 * Okul veri erişim katmanı (mock).
 * İleride Firestore "schools" koleksiyonuyla değiştirilecek.
 */

import type { School } from "@/src/types/school";

const schools: School[] = [
  { id: "sc-ikk-atasehir", tenantId: "ikk", name: "İngiliz Kültür Koleji — Ataşehir", city: "İstanbul", levels: ["primary", "secondary"], studentCount: 1840, active: true },
  { id: "sc-atael", tenantId: "atael", name: "Atael Koleji", city: "Ankara", levels: ["primary", "secondary", "highschool"], studentCount: 842, active: true },
  { id: "sc-demo", tenantId: "demo", name: "Demo Okul", city: "İzmir", levels: ["preschool", "primary"], studentCount: 120, active: true },
];

export async function getSchools(tenantId?: string): Promise<School[]> {
  return tenantId ? schools.filter((s) => s.tenantId === tenantId) : schools;
}
