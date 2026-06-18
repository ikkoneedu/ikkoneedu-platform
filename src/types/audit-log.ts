/**
 * Denetim kaydı (audit log) veri modeli.
 * Kritik işlemlerin izlenebilirliği için.
 */

export interface AuditLog {
  id: string;
  /** Global platform logları için tenantId boş olabilir. */
  tenantId?: string;
  schoolId?: string;
  /** İşlemi yapan kullanıcı kimliği. */
  actorId: string;
  /** İşlem tanımı (ör. "settings.update", "school.create"). */
  action: string;
  /** Etkilenen kaynak (ör. "tenants/ikk/settings/security"). */
  resource?: string;
  status: "success" | "info" | "error";
  createdAt: string;
}
