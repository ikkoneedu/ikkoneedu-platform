/**
 * Veli veri modeli.
 */

export interface Parent {
  id: string;
  tenantId: string;
  schoolId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  /** Bağlı öğrenci kimlikleri. */
  studentIds: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
