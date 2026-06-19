/**
 * Finans kaydı ve burs veri modelleri.
 */

export type FinanceRecordType = "tuition" | "early-enrollment" | "other";

export interface FinanceRecord {
  id: string;
  tenantId: string;
  schoolId?: string;
  type: FinanceRecordType;
  /** Tutar (TL). */
  amount: number;
  /** İlişkili öğrenci/veli kimliği. */
  partyId?: string;
  description?: string;
  period: string;
  createdAt: string;
  updatedAt?: string;
}
