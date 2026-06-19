/**
 * Karne (report card) veri modeli.
 */

export type ReportTone = "kurumsal" | "sicak" | "gelisim-odakli" | "kisa" | "detayli";
export type AchievementLevel = "cok-iyi" | "iyi" | "orta" | "gelistirilmeli";

export interface ReportCard {
  id: string;
  tenantId: string;
  schoolId?: string;
  studentId: string;
  teacherId: string;
  classGroup: string;
  subject: string;
  achievement: AchievementLevel;
  /** Davranış ve katılım gözlemi. */
  observation?: string;
  developmentAreas: string[];
  tone: ReportTone;
  /** AI tarafından üretilen yorum metni. */
  comment: string;
  createdAt: string;
  updatedAt?: string;
}
