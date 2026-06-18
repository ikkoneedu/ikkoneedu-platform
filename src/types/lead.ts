/**
 * Lead (aday veli) veri modeli.
 * CRM ve kayıt funnel süreçleri için.
 */

export type LeadStage =
  | "new"
  | "contacted"
  | "appointment"
  | "visit"
  | "offer"
  | "enrolled"
  | "lost";

export type LeadPriority = "hot" | "warm" | "cold";

export interface Lead {
  id: string;
  tenantId: string;
  schoolId?: string;
  parentName: string;
  phone?: string;
  email?: string;
  childAge?: string;
  /** İlgilenilen kademe (ör. "Anaokulu"). */
  level: string;
  location?: string;
  /** Lead kaynağı (ör. "Instagram", "Referans"). */
  source: string;
  stage: LeadStage;
  priority: LeadPriority;
  /** Atanan danışman kimliği. */
  advisorId?: string;
  createdAt: string;
  updatedAt?: string;
}
