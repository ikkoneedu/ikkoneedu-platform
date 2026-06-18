/**
 * Öğretmen veri modeli.
 */

export interface Teacher {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  /** Branş (ör. "İngilizce"). */
  subject: string;
  /** Sorumlu olduğu sınıf kimlikleri. */
  classIds: string[];
  active: boolean;
}
