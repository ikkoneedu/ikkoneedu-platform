/**
 * ikkoneedu — AI Karne Asistanı için mock veriler.
 *
 * ÖNEMLİ: Yalnızca mock UI içindir; gerçek AI çağrısı, API anahtarı,
 * Firebase ya da PDF dışa aktarma işlemi YOKTUR.
 *
 * GELECEKTEKİ ENTEGRASYON (öneri):
 *   // lib/ai/report-card.ts  (yalnızca sunucu tarafı)
 *   export interface ReportCommentRequest {
 *     provider: "openai" | "anthropic";
 *     studentId: string;
 *     subject: string;
 *     achievementLevel: string;
 *     behaviorNote: string;
 *     developmentAreas: string[];
 *     tone: string;
 *   }
 *   export async function generateReportComment(
 *     req: ReportCommentRequest,
 *   ): Promise<string> {
 *     // Claude/OpenAI ile pedagojik karne yorumu üretimi;
 *     // anahtarlar server env'den okunur.
 *   }
 *
 * Bileşenler bu sözleşmeye bağlı kalacak şekilde modüler tasarlanmıştır.
 */

/* --------------------------------- Öğrenciler ----------------------------- */

export interface ReportStudent {
  id: string;
  tenantId: string;
  name: string;
  classGroup: string;
}

export const students: ReportStudent[] = [
  { id: "std-001", tenantId: "tnt-001", name: "Defne Yılmaz", classGroup: "5-A" },
  { id: "std-002", tenantId: "tnt-001", name: "Arda Demir", classGroup: "5-A" },
  { id: "std-003", tenantId: "tnt-001", name: "Elif Kaya", classGroup: "6-B" },
  { id: "std-004", tenantId: "tnt-001", name: "Mert Şahin", classGroup: "6-B" },
  { id: "std-005", tenantId: "tnt-001", name: "Zeynep Aydın", classGroup: "7-C" },
  { id: "std-006", tenantId: "tnt-001", name: "Kerem Çelik", classGroup: "7-C" },
];

/* --------------------------------- Sınıflar ------------------------------- */

export interface ReportClass {
  id: string;
  tenantId: string;
  name: string;
}

export const classes: ReportClass[] = [
  { id: "cls-5a", tenantId: "tnt-001", name: "5-A" },
  { id: "cls-6b", tenantId: "tnt-001", name: "6-B" },
  { id: "cls-7c", tenantId: "tnt-001", name: "7-C" },
  { id: "cls-8a", tenantId: "tnt-001", name: "8-A" },
];

/* ---------------------------------- Dersler ------------------------------- */

export interface ReportSubject {
  id: string;
  tenantId: string;
  name: string;
}

export const subjects: ReportSubject[] = [
  { id: "sbj-ing", tenantId: "tnt-001", name: "İngilizce" },
  { id: "sbj-mat", tenantId: "tnt-001", name: "Matematik" },
  { id: "sbj-tur", tenantId: "tnt-001", name: "Türkçe" },
  { id: "sbj-fen", tenantId: "tnt-001", name: "Fen Bilimleri" },
  { id: "sbj-sos", tenantId: "tnt-001", name: "Sosyal Bilgiler" },
];

/* ----------------------------- Başarı seviyeleri -------------------------- */

export interface AchievementLevel {
  id: string;
  label: string;
}

export const achievementLevels: AchievementLevel[] = [
  { id: "lvl-cok-iyi", label: "Çok İyi" },
  { id: "lvl-iyi", label: "İyi" },
  { id: "lvl-orta", label: "Orta" },
  { id: "lvl-gelistirilmeli", label: "Geliştirilmeli" },
];

/* ----------------------------------- Tonlar ------------------------------- */

/** Yorum tonları. Client bileşenine yalnızca string[] olarak geçirilir. */
export const tones: string[] = [
  "Kurumsal",
  "Sıcak",
  "Gelişim Odaklı",
  "Kısa",
  "Detaylı",
];

/* ------------------------------- Gelişim alanları ------------------------- */

export interface DevelopmentArea {
  id: string;
  label: string;
}

export const developmentAreas: DevelopmentArea[] = [
  { id: "dev-okuma", label: "Okuma-anlama" },
  { id: "dev-katilim", label: "Sınıf içi katılım" },
  { id: "dev-odev", label: "Ödev takibi" },
  { id: "dev-zaman", label: "Zaman yönetimi" },
  { id: "dev-isbirligi", label: "Grup çalışması / iş birliği" },
  { id: "dev-ozguven", label: "Özgüven" },
];

/* ------------------------------- Örnek yorum ------------------------------ */

export const generatedComment =
  "Defne, dönem boyunca İngilizce derslerine düzenli katılım göstermiş, kelime bilgisini geliştirmiş ve sınıf içi etkinliklerde özgüvenli bir şekilde yer almıştır. Önümüzdeki dönemde okuma-anlama çalışmalarına daha fazla zaman ayırması gelişimini destekleyecektir.";

/* ------------------------------- Önizleme bilgisi ------------------------- */

export interface ReportPreviewInfo {
  schoolName: string;
  term: string;
  studentName: string;
  classGroup: string;
  subject: string;
}

export const reportPreviewInfo: ReportPreviewInfo = {
  schoolName: "ikkoneedu Koleji",
  term: "2025-2026 / 2. Dönem",
  studentName: "Defne Yılmaz",
  classGroup: "5-A",
  subject: "İngilizce",
};
