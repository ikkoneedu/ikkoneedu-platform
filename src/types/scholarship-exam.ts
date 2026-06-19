/**
 * Bursluluk Sınavı Yönetim Sistemi — canonical veri modelleri.
 * Firestore (tenant bazlı) entegrasyonuna hazır; gerçek backend yok.
 */

export type ExamMode = "fiziksel" | "online" | "hibrit";
export type ExamStatus = "aktif" | "pasif" | "taslak";

export interface ScholarshipExam {
  id: string;
  tenantId: string;
  schoolId?: string;
  name: string;
  campus: string;
  mode: ExamMode;
  applicationStart: string;
  applicationEnd: string;
  examDate: string;
  examTime: string;
  resultDate: string;
  /** Başvuru kabul edilen kademeler. */
  gradeLevels: string[];
  capacity: number;
  status: ExamStatus;
  createdAt: string;
  updatedAt?: string;
}

export type ApplicationStatus =
  | "Bekliyor"
  | "Onaylandı"
  | "Eksik Bilgi"
  | "Oturum Atandı"
  | "Sınava Girdi"
  | "Sonuç Açıklandı"
  | "Randevu Aldı"
  | "Kayıt Oldu";

export interface ScholarshipApplication {
  id: string;
  tenantId: string;
  examId: string;
  applicationNo: string;
  studentName: string;
  parentName: string;
  phone: string;
  grade: string;
  currentSchool: string;
  campusPreference: string;
  status: ApplicationStatus;
  sessionId?: string;
  roomId?: string;
  seatNo?: number;
  crmStatus?: ScholarshipCRMStatus;
  createdAt: string;
}

export interface ScholarshipSession {
  id: string;
  tenantId: string;
  examId: string;
  name: string;
  grades: string[];
  capacity: number;
  occupancy: number;
}

export interface ExamRoom {
  id: string;
  tenantId: string;
  name: string;
  capacity: number;
  occupancy: number;
  campus?: string;
}

export interface SeatAssignment {
  id: string;
  tenantId: string;
  applicationId: string;
  roomId: string;
  seatNo: number;
  /** QR giriş kodu (hazırlık). */
  qrCode?: string;
}

export interface Proctor {
  id: string;
  tenantId: string;
  roomId: string;
  name: string;
  assistant?: string;
  studentCount: number;
  status: "Atandı" | "Bekliyor";
}

export interface AdmissionCard {
  id: string;
  tenantId: string;
  applicationId: string;
  applicationNo: string;
  studentName: string;
  examName: string;
  examDate: string;
  examTime: string;
  campus: string;
  room: string;
  seatNo: number;
  qrCode?: string;
}

export interface ScholarshipResult {
  id: string;
  tenantId: string;
  applicationId: string;
  studentName: string;
  netsBySubject: Record<string, number>;
  totalScore: number;
  rank: number;
  percentile: number;
  award?: ScholarshipAward;
}

export interface ScholarshipAward {
  /** Burs oranı (%). */
  rate: number;
  label: string;
}

export interface ScholarshipRule {
  id: string;
  /** Üst yüzdelik dilim eşiği (ör. 1, 5, 10, 20). */
  topPercentile: number | null;
  award: number;
  label: string;
}

export type ScholarshipCRMStatus =
  | "Lead"
  | "Sınava Katıldı"
  | "Burs Kazandı"
  | "Arandı"
  | "Randevu Aldı"
  | "Kayıt Oldu";
