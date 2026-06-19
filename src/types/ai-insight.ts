/**
 * AI öngörü/içgörü veri modeli.
 * CRM, finans, rehberlik ve yönetim panellerindeki AI önerileri için.
 */

export type AiInsightDomain =
  | "admissions"
  | "crm"
  | "finance"
  | "counseling"
  | "academic"
  | "executive";

export interface AiInsight {
  id: string;
  tenantId: string;
  schoolId?: string;
  domain: AiInsightDomain;
  text: string;
  /** Güven skoru (0-1). */
  confidence?: number;
  createdAt: string;
}
