/**
 * Rehberlik görüşmesi (counseling session) veri modeli.
 */

export type CounselingType = "student" | "parent" | "group";
export type RiskPriority = "high" | "medium" | "low";

export interface CounselingSession {
  id: string;
  tenantId: string;
  schoolId?: string;
  studentId: string;
  counselorId: string;
  type: CounselingType;
  /** Görüşme notu (gizli — rol bazlı erişim). */
  note: string;
  /** Risk/öncelik seviyesi. */
  priority: RiskPriority;
  tags?: string[];
  date: string;
  createdAt: string;
  updatedAt?: string;
}
