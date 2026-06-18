/**
 * Okul / kampüs veri modeli.
 * Bir tenant altında birden fazla kampüs olabilir.
 */

export type SchoolLevel = "preschool" | "primary" | "secondary" | "highschool";

export interface School {
  id: string;
  tenantId: string;
  name: string;
  city: string;
  levels: SchoolLevel[];
  studentCount: number;
  active: boolean;
}

export interface ClassGroup {
  id: string;
  schoolId: string;
  name: string;
  grade: string;
  studentCount: number;
}
