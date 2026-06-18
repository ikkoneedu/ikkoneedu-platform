/**
 * Ödeme veri modeli.
 * Tahsilat ve finansal işlemler için.
 */

export type PaymentStatus = "pending" | "paid" | "overdue" | "refunded";
export type PaymentMethod = "card" | "transfer" | "cash";

export interface Payment {
  id: string;
  tenantId: string;
  schoolId?: string;
  /** Ödeyen veli/öğrenci kimliği. */
  payerId: string;
  /** Tutar (TL). */
  amount: number;
  status: PaymentStatus;
  method?: PaymentMethod;
  description?: string;
  dueDate: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}
