/**
 * ikkoneedu — AI Sınav Oluşturucu için mock veriler.
 *
 * ÖNEMLİ: Yalnızca mock UI içindir; gerçek AI çağrısı, API anahtarı veya
 * dışa aktarma (PDF/Word/Google Forms) işlemi yoktur.
 *
 * GELECEKTEKİ ENTEGRASYON (öneri):
 *   // lib/ai/exam.ts  (yalnızca sunucu tarafı)
 *   export interface ExamRequest {
 *     provider: "openai" | "anthropic";
 *     level: string; grade: string; lesson: string;
 *     topic: string; outcome: string; // kazanım
 *     questionCount: number; difficulty: string; examType: string;
 *   }
 *   export interface ExamResult {
 *     questions: GeneratedQuestion[];
 *     quality: QualityMetric[];
 *   }
 *   export async function generateExam(req: ExamRequest): Promise<ExamResult> {
 *     // Claude/OpenAI ile soru üretimi; anahtarlar server env'den okunur.
 *   }
 *
 * Bileşenler bu sözleşmeye bağlı kalacak şekilde modüler tasarlanmıştır.
 */

import {
  FileText,
  FileType,
  FormInput,
  Send,
  Share2,
  Languages,
  Calculator,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Form seçenekleri -------------------------- */

export interface ExamFormOptions {
  levels: string[];
  grades: string[];
  lessons: string[];
  topics: string[];
  outcomes: string[];
  questionCounts: string[];
  difficulties: string[];
  examTypes: string[];
}

export const examFormOptions: ExamFormOptions = {
  levels: ["İlkokul", "Ortaokul", "Lise"],
  grades: Array.from({ length: 12 }, (_, i) => `${i + 1}. Sınıf`),
  lessons: ["Matematik", "Türkçe", "Fen Bilimleri", "İngilizce", "Sosyal Bilgiler"],
  topics: ["Present Perfect", "Kesirler", "Maddenin Halleri", "Paragraf", "Coğrafi Bölgeler"],
  outcomes: [
    "Konuyu günlük hayatla ilişkilendirir",
    "Temel kavramları tanımlar",
    "Problem çözer",
    "Metni yorumlar",
  ],
  questionCounts: ["10 Soru", "20 Soru", "30 Soru", "40 Soru"],
  difficulties: ["Kolay", "Orta", "Zor"],
  examTypes: ["Çoktan Seçmeli", "Açık Uçlu", "Karma", "Quiz"],
};

/* ------------------------------ Üretilen sorular -------------------------- */

export interface GeneratedQuestion {
  id: string;
  number: number;
  text: string;
  difficulty: "Kolay" | "Orta" | "Zor";
  outcome: string;
  type: string;
}

export const examGeneratedQuestions: GeneratedQuestion[] = [
  {
    id: "q1",
    number: 1,
    text: "Aşağıdakilerden hangisi maddenin hallerinden biri değildir?",
    difficulty: "Kolay",
    outcome: "Maddenin hallerini ayırt eder",
    type: "Çoktan Seçmeli",
  },
  {
    id: "q2",
    number: 2,
    text: "Boşluğu doldurunuz: Su, ısı kaybettiğinde ........... haline geçer.",
    difficulty: "Orta",
    outcome: "Hal değişimlerini açıklar",
    type: "Boşluk Doldurma",
  },
  {
    id: "q3",
    number: 3,
    text: "Kısa cevap veriniz: Buharlaşma ile kaynama arasındaki fark nedir?",
    difficulty: "Zor",
    outcome: "Kavramları karşılaştırır",
    type: "Açık Uçlu",
  },
];

/* ------------------------------ Soru bankası ------------------------------ */

export interface QuestionBankMetric {
  id: string;
  label: string;
  value: string;
}

export const examQuestionBankMetrics: QuestionBankMetric[] = [
  { id: "toplam", label: "Toplam Soru", value: "12.480" },
  { id: "ingilizce", label: "İngilizce Soruları", value: "3.240" },
  { id: "matematik", label: "Matematik Soruları", value: "2.980" },
  { id: "fen", label: "Fen Soruları", value: "2.100" },
];

export const examBankFilters = {
  lessons: ["Tüm Dersler", "Matematik", "Türkçe", "Fen Bilimleri", "İngilizce"],
  topics: ["Tüm Konular", "Kesirler", "Paragraf", "Maddenin Halleri"],
  outcomes: ["Tüm Kazanımlar", "Tanımlar", "Problem Çözer", "Yorumlar"],
  difficulties: ["Tüm Seviyeler", "Kolay", "Orta", "Zor"],
};

/* ------------------------------ Kalite analizi ---------------------------- */

export interface QualityMetric {
  id: string;
  label: string;
  value: number;
}

export const examQualityMetrics: QualityMetric[] = [
  { id: "mufredat", label: "Müfredat Uyumu", value: 98 },
  { id: "kazanim", label: "Kazanım Kapsamı", value: 95 },
  { id: "zorluk", label: "Zorluk Dengesi", value: 93 },
  { id: "okunabilirlik", label: "Okunabilirlik", value: 97 },
];

/* ------------------------------ Çalışma kağıdı ---------------------------- */

export const examWorksheetOptions = {
  lessons: ["Matematik", "Türkçe", "Fen Bilimleri", "İngilizce"],
  topics: ["Kesirler", "Paragraf", "Maddenin Halleri", "Present Perfect"],
  pageCounts: ["1 Sayfa", "2 Sayfa", "3 Sayfa", "4 Sayfa"],
  activityTypes: ["Alıştırma", "Bulmaca", "Eşleştirme", "Boşluk Doldurma"],
};

/* ------------------------------ Quiz ------------------------------------- */

export const examQuizOptions = {
  lessons: ["Matematik", "Türkçe", "Fen Bilimleri", "İngilizce"],
  topics: ["Kesirler", "Paragraf", "Maddenin Halleri", "Present Perfect"],
  questionCounts: ["5 Soru", "10 Soru", "15 Soru", "20 Soru"],
};

/* ------------------------------ Dışa aktarma ------------------------------ */

export interface ExamExportAction {
  id: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

export const examExportActions: ExamExportAction[] = [
  { id: "pdf", label: "PDF Olarak İndir", icon: FileText, primary: true },
  { id: "word", label: "Word Olarak İndir", icon: FileType },
  { id: "forms", label: "Google Forms'a Aktar", icon: FormInput },
  { id: "ogrenci", label: "Öğrencilere Gönder", icon: Send },
  { id: "lms", label: "LMS'e Yayınla", icon: Share2 },
];

/* ------------------------------ AI önerileri ------------------------------ */

export interface ExamSuggestion {
  id: string;
  text: string;
  icon: LucideIcon;
}

export const examAiSuggestions: ExamSuggestion[] = [
  { id: "s1", text: "Son sınavlarda öğrenciler İngilizce Reading bölümünde zorlanıyor.", icon: Languages },
  { id: "s2", text: "6. sınıf Matematik için ek tekrar öneriliyor.", icon: Calculator },
  { id: "s3", text: "Fen Bilimleri sınavlarında açık uçlu soru oranı artırılabilir.", icon: FlaskConical },
  { id: "s4", text: "Speaking değerlendirmeleri için rubrik önerisi hazırlandı.", icon: Languages },
];
