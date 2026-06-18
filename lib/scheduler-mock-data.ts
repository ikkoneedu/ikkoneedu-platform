/**
 * ikkoneedu — AI Ders Programı Oluşturucu için mock veriler.
 *
 * ÖNEMLİ: Yalnızca mock UI içindir; gerçek AI çağrısı, API anahtarı veya
 * dışa aktarma (PDF/Excel) işlemi yoktur.
 *
 * GELECEKTEKİ ENTEGRASYON (öneri):
 *   // lib/ai/scheduler.ts  (yalnızca sunucu tarafı)
 *   export interface ScheduleRequest {
 *     provider: "openai" | "anthropic";
 *     campus: string; level: string; classGroup: string;
 *     weeklyHours: number; teachers: string[]; lessons: string[];
 *     rules: string[]; // öncelik kuralları
 *   }
 *   export interface ScheduleResult {
 *     timetable: ScheduleEntry[][];
 *     conflicts: ConflictAnalysis;
 *     suggestions: string[];
 *   }
 *   export async function generateSchedule(req: ScheduleRequest): Promise<ScheduleResult> {
 *     // Claude/OpenAI ile kısıt çözümü; anahtarlar server env'den okunur.
 *   }
 *
 * Bileşenler bu sözleşmeye bağlı kalacak şekilde modüler tasarlanmıştır.
 */

import {
  UserX,
  CalendarX,
  Gauge,
  Star,
  Sparkles,
  FlaskConical,
  Save,
  FileText,
  Sheet,
  Send,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Form seçenekleri -------------------------- */

export interface SchedulerFormOptions {
  campuses: string[];
  levels: string[];
  classes: string[];
  weeklyHours: string[];
  teachers: string[];
  lessons: string[];
  priorityRules: string[];
}

export const schedulerFormOptions: SchedulerFormOptions = {
  campuses: ["Merkez Kampüs", "Batıkent Kampüs", "Çayyolu Kampüs"],
  levels: ["İlkokul", "Ortaokul", "Lise"],
  classes: ["5A", "5B", "6A", "7A", "8B"],
  weeklyHours: ["25 Saat", "30 Saat", "35 Saat", "40 Saat"],
  teachers: ["John Smith", "Ayşe Yılmaz", "Zeynep Kaya", "Mehmet Demir", "Elif Ak"],
  lessons: ["İngilizce", "Matematik", "Fen Bilimleri", "Türkçe", "Görsel Sanatlar", "Beden Eğitimi"],
  priorityRules: [
    "İngilizce dersleri sabah saatlerinde olsun",
    "Aynı öğretmenin dersleri çakışmasın",
    "Ana dersler ilk 4 saate yerleşsin",
    "Günlük maksimum 7 ders olsun",
    "Laboratuvar dersleri blok yapılsın",
  ],
};

/* ------------------------------ Akıllı kurallar --------------------------- */

export interface SmartRule {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  active: boolean;
}

export const schedulerSmartRules: SmartRule[] = [
  { id: "ogretmen", title: "Öğretmen Çakışması Engeli", description: "Bir öğretmen aynı saatte tek sınıfta.", icon: UserX, active: true },
  { id: "sinif", title: "Sınıf Çakışması Engeli", description: "Bir sınıfta aynı saatte tek ders.", icon: CalendarX, active: true },
  { id: "limit", title: "Günlük Ders Limiti", description: "Günlük maksimum ders sayısı korunur.", icon: Gauge, active: true },
  { id: "brans", title: "Branş Önceliği", description: "Ana dersler erken saatlere yerleşir.", icon: Star, active: true },
  { id: "bos", title: "Boş Saat Optimizasyonu", description: "Öğretmen boşlukları azaltılır.", icon: Sparkles, active: true },
  { id: "lab", title: "Laboratuvar ve Atölye Kullanımı", description: "Lab dersleri blok olarak planlanır.", icon: FlaskConical, active: false },
];

/* ------------------------------ Haftalık program -------------------------- */

export const schedulerDays = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"];
export const schedulerHours = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"];

export interface ScheduleEntry {
  lesson: string;
  teacher: string;
  classGroup: string;
  room: string;
}

const C = "5A";
const make = (lesson: string, teacher: string, room: string): ScheduleEntry => ({
  lesson,
  teacher,
  classGroup: C,
  room,
});

const ING = make("İngilizce", "John Smith", "A-204");
const MAT = make("Matematik", "Ayşe Yılmaz", "A-205");
const FEN = make("Fen Bilimleri", "Zeynep Kaya", "Lab-1");
const TUR = make("Türkçe", "Mehmet Demir", "B-110");
const GOR = make("Görsel Sanatlar", "Elif Ak", "Atölye");
const BED = make("Beden Eğitimi", "Ali Vural", "Spor Salonu");

/** timetable[saat][gün] — boş saatler için null. */
export const schedulerTimetable: (ScheduleEntry | null)[][] = [
  [ING, MAT, FEN, ING, MAT], // 09:00
  [MAT, ING, FEN, TUR, ING], // 10:00
  [FEN, TUR, ING, MAT, GOR], // 11:00
  [TUR, FEN, MAT, BED, TUR], // 13:00
  [GOR, BED, TUR, FEN, FEN], // 14:00
  [BED, null, GOR, null, BED], // 15:00
];

/* ------------------------------ Çakışma analizi --------------------------- */

export interface ConflictAnalysis {
  teacherConflict: number;
  classConflict: number;
  gapOptimization: number;
  fitScore: number;
}

export const schedulerConflictAnalysis: ConflictAnalysis = {
  teacherConflict: 0,
  classConflict: 0,
  gapOptimization: 92,
  fitScore: 96,
};

/* ------------------------------ AI önerileri ------------------------------ */

export const schedulerAiSuggestions: string[] = [
  "5A İngilizce dersleri sabah saatlerinde daha verimli konumlandırıldı.",
  "Fen Bilimleri laboratuvar dersi blok saat olarak planlandı.",
  "Matematik dersi haftanın ilk üç gününe dengeli dağıtıldı.",
  "Öğretmen boşlukları %24 azaltıldı.",
];

/* ------------------------------ Dışa aktarma ------------------------------ */

export interface ExportAction {
  id: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

export const schedulerExportActions: ExportAction[] = [
  { id: "kaydet", label: "Programı Kaydet", icon: Save, primary: true },
  { id: "pdf", label: "PDF Olarak Al", icon: FileText },
  { id: "excel", label: "Excel Olarak Al", icon: Sheet },
  { id: "ogretmen", label: "Öğretmenlere Gönder", icon: Send },
  { id: "veli", label: "Velilere Yayınla", icon: Megaphone },
];
