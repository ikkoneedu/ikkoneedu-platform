/**
 * Randevu veri modeli.
 * Kayıt ve veli görüşmeleri için.
 */

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "canceled";

export interface Appointment {
  id: string;
  tenantId: string;
  schoolId?: string;
  /** İlişkili lead veya veli kimliği. */
  leadId?: string;
  parentName: string;
  campus: string;
  advisorId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
}
