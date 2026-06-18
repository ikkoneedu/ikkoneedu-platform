/**
 * Öğrenci veri modeli.
 */

export interface Student {
  id: string;
  tenantId: string;
  schoolId?: string;
  firstName: string;
  lastName: string;
  grade: string;
  classGroup: string;
  /** Bağlı veli kimlikleri. */
  parentIds: string[];
  gpa?: number;
  attendanceRate?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPerformance {
  studentId: string;
  subject: string;
  score: number;
  trend: "up" | "down" | "neutral";
}
