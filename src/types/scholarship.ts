/**
 * Burs / indirim veri modeli.
 */

export type ScholarshipType = "merit" | "need" | "sibling" | "staff";

export interface Scholarship {
  id: string;
  tenantId: string;
  schoolId?: string;
  studentId: string;
  type: ScholarshipType;
  /** İndirim oranı (%). */
  rate: number;
  /** İndirim tutarı (TL). */
  amount?: number;
  createdAt: string;
  updatedAt?: string;
}
