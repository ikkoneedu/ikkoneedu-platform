/**
 * ikkoneedu — Bursluluk Sınavı Yönetim Sistemi mock verileri.
 * Yalnızca arayüz içindir; gerçek backend/QR/PDF/SMS/e-posta yoktur.
 * Çoklu okul (tenant) yapısına hazır: her kayıt tenantId taşır.
 */

import {
  FileText,
  CheckCircle2,
  Clock,
  Layers,
  DoorOpen,
  PencilLine,
  Award,
  CalendarCheck,
  Wallet,
  Users,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Sınav bilgisi ----------------------------- */

export const activeExam = {
  id: "exam-2027",
  tenantId: "ikk",
  name: "2027 Bursluluk ve Kabul Sınavı",
  campus: "İngiliz Kültür Kolejleri",
  examDate: "15 Şubat 2027",
  examTime: "10:00",
  resultDate: "22 Şubat 2027",
};

/* ------------------------------ Dashboard --------------------------------- */

export interface ScholarshipMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const dashboardMetrics: ScholarshipMetric[] = [
  { id: "basvuru", label: "Toplam Başvuru", value: "1.842", icon: FileText },
  { id: "onay", label: "Onaylanan Başvuru", value: "1.610", icon: CheckCircle2 },
  { id: "bekleyen", label: "Bekleyen Başvuru", value: "232", icon: Clock },
  { id: "oturum", label: "Oturum Sayısı", value: "6", icon: Layers },
  { id: "salon", label: "Salon Sayısı", value: "18", icon: DoorOpen },
  { id: "katilan", label: "Sınava Katılan", value: "1.524", icon: PencilLine },
  { id: "burs", label: "Burs Kazanan", value: "486", icon: Award },
  { id: "kayit", label: "Kayıta Dönüşen", value: "212", icon: CalendarCheck },
  { id: "gelir", label: "Beklenen Kayıt Geliri", value: "₺18.4M", icon: Wallet },
];

/* ------------------------------ Sınav oluşturucu seçenekleri -------------- */

export const examBuilderOptions = {
  campuses: ["İngiliz Kültür Kolejleri", "Atael Koleji", "Demo Okul"],
  modes: ["Fiziksel", "Online", "Hibrit"],
  statuses: ["Aktif", "Pasif", "Taslak"],
  gradeLevels: [
    "Anaokulu",
    "1. Sınıf",
    "2. Sınıf",
    "3. Sınıf",
    "4. Sınıf",
    "5. Sınıf",
    "6. Sınıf",
    "7. Sınıf",
    "8. Sınıf",
    "9. Sınıf",
    "10. Sınıf",
    "11. Sınıf",
  ],
};

/* ------------------------------ Sınav içeriği ----------------------------- */

export interface ExamSubject {
  subject: string;
  questionCount: number;
}

export interface ExamContent {
  grade: string;
  subjects: ExamSubject[];
  duration: string;
}

export const examContents: ExamContent[] = [
  {
    grade: "4. Sınıf",
    subjects: [
      { subject: "Türkçe", questionCount: 15 },
      { subject: "Matematik", questionCount: 15 },
      { subject: "Fen Bilimleri", questionCount: 10 },
      { subject: "İngilizce", questionCount: 10 },
    ],
    duration: "75 dk",
  },
  {
    grade: "5. Sınıf",
    subjects: [
      { subject: "Türkçe", questionCount: 20 },
      { subject: "Matematik", questionCount: 20 },
      { subject: "Fen Bilimleri", questionCount: 15 },
      { subject: "İngilizce", questionCount: 15 },
    ],
    duration: "90 dk",
  },
];

/* ------------------------------ Başvurular -------------------------------- */

export type ApplicationStatus =
  | "Bekliyor"
  | "Onaylandı"
  | "Eksik Bilgi"
  | "Oturum Atandı"
  | "Sınava Girdi"
  | "Sonuç Açıklandı"
  | "Randevu Aldı"
  | "Kayıt Oldu";

export interface ApplicationRow {
  id: string;
  applicationNo: string;
  studentName: string;
  parentName: string;
  phone: string;
  grade: string;
  currentSchool: string;
  campusPreference: string;
  status: ApplicationStatus;
  session: string;
  room: string;
  seatNo: string;
  crmStatus: string;
}

export const applications: ApplicationRow[] = [
  { id: "a1", applicationNo: "IKK-2027-000124", studentName: "Defne Yılmaz", parentName: "Ayşe Yılmaz", phone: "0 5xx xxx 12 34", grade: "5. Sınıf", currentSchool: "Atatürk İÖO", campusPreference: "Batıkent", status: "Oturum Atandı", session: "1. Oturum", room: "Salon A", seatNo: "A-12", crmStatus: "Lead" },
  { id: "a2", applicationNo: "IKK-2027-000125", studentName: "Arda Kaya", parentName: "Murat Kaya", phone: "0 5xx xxx 23 45", grade: "4. Sınıf", currentSchool: "Cumhuriyet İÖO", campusPreference: "Merkez", status: "Onaylandı", session: "1. Oturum", room: "Salon B", seatNo: "B-04", crmStatus: "Sınava Katıldı" },
  { id: "a3", applicationNo: "IKK-2027-000126", studentName: "Elif Demir", parentName: "Selin Demir", phone: "0 5xx xxx 34 56", grade: "6. Sınıf", currentSchool: "Gazi İÖO", campusPreference: "Çayyolu", status: "Sınava Girdi", session: "2. Oturum", room: "Salon C", seatNo: "C-09", crmStatus: "Burs Kazandı" },
  { id: "a4", applicationNo: "IKK-2027-000127", studentName: "Burak Çelik", parentName: "Hakan Çelik", phone: "0 5xx xxx 45 67", grade: "5. Sınıf", currentSchool: "Yıldız İÖO", campusPreference: "Batıkent", status: "Bekliyor", session: "—", room: "—", seatNo: "—", crmStatus: "—" },
  { id: "a5", applicationNo: "IKK-2027-000128", studentName: "Zeynep Arslan", parentName: "Derya Arslan", phone: "0 5xx xxx 56 78", grade: "7. Sınıf", currentSchool: "Mevlana OO", campusPreference: "Merkez", status: "Eksik Bilgi", session: "—", room: "—", seatNo: "—", crmStatus: "Lead" },
  { id: "a6", applicationNo: "IKK-2027-000129", studentName: "Mert Şahin", parentName: "Onur Şahin", phone: "0 5xx xxx 67 89", grade: "8. Sınıf", currentSchool: "Fatih OO", campusPreference: "Çayyolu", status: "Kayıt Oldu", session: "2. Oturum", room: "Salon A", seatNo: "A-21", crmStatus: "Kayıt Oldu" },
];

export const applicationStatuses: ApplicationStatus[] = [
  "Bekliyor",
  "Onaylandı",
  "Eksik Bilgi",
  "Oturum Atandı",
  "Sınava Girdi",
  "Sonuç Açıklandı",
  "Randevu Aldı",
  "Kayıt Oldu",
];

/* ------------------------------ Sınıf yerleştirme ------------------------- */

export const placementSuggestion = {
  birthDate: "12.05.2017",
  currentGrade: "4. Sınıf",
  suggestedExam: "4. Sınıf Bursluluk Sınavı",
  warnings: [
    "Yaş / sınıf uyumsuzluğu olabilir.",
    "Yönetici onayı gerekebilir.",
  ],
};

/* ------------------------------ AI oturum planlama ------------------------ */

export const aiSessionSuggestions: string[] = [
  "4. sınıf öğrencileri 1. oturuma alınmalı.",
  "5 ve 6. sınıflar için ikinci oturum önerilir.",
  "Salon 203 kapasitesi %92 dolulukta.",
  "Kardeş öğrenciler farklı salonlara dağıtıldı.",
];

export const sessionPlanningRules: string[] = [
  "Salon kapasitesi",
  "Kampüs tercihi",
  "Sınıf seviyesi",
  "Kardeş öğrenci",
  "Engelli öğrenci",
  "Aynı okuldan gelenleri dağıtma",
  "Gözetmen sayısı",
  "Oturum doluluk oranı",
];

/* ------------------------------ Salonlar ---------------------------------- */

export interface Room {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
}

export const rooms: Room[] = [
  { id: "r-a", name: "Salon A", capacity: 30, occupancy: 28 },
  { id: "r-b", name: "Salon B", capacity: 25, occupancy: 23 },
  { id: "r-c", name: "Salon C", capacity: 20, occupancy: 16 },
];

/* ------------------------------ Gözetmenler ------------------------------- */

export interface ProctorRow {
  id: string;
  room: string;
  proctor: string;
  assistant: string;
  studentCount: number;
  status: "Atandı" | "Bekliyor";
}

export const proctors: ProctorRow[] = [
  { id: "p1", room: "Salon A", proctor: "Ayşe Yılmaz", assistant: "Mehmet Demir", studentCount: 28, status: "Atandı" },
  { id: "p2", room: "Salon B", proctor: "Zeynep Kaya", assistant: "John Smith", studentCount: 23, status: "Atandı" },
  { id: "p3", room: "Salon C", proctor: "Ali Vural", assistant: "—", studentCount: 16, status: "Bekliyor" },
];

/* ------------------------------ Giriş belgesi ----------------------------- */

export const admissionCardActions = [
  "Giriş Belgesi Oluştur",
  "Toplu PDF Hazırla",
  "SMS ile Bilgilendir",
  "E-posta ile Gönder",
];

export const examRules: string[] = [
  "Sınav başlangıcından 30 dakika önce salonda olunmalıdır.",
  "Yanınızda nüfus cüzdanı / kimlik belgesi bulundurunuz.",
  "Kurşun kalem, silgi ve kalemtıraş getiriniz.",
  "Cep telefonu ve akıllı saat sınava alınmaz.",
];

export const requiredDocuments: string[] = [
  "Sınav Giriş Belgesi (çıktı veya dijital)",
  "Nüfus cüzdanı / kimlik",
  "2 adet kurşun kalem ve silgi",
];

/* ------------------------------ Sonuç & burs ------------------------------ */

export interface BursRule {
  id: string;
  label: string;
  award: string;
}

export const bursRules: BursRule[] = [
  { id: "b1", label: "İlk %1", award: "%100 burs" },
  { id: "b2", label: "İlk %5", award: "%75 burs" },
  { id: "b3", label: "İlk %10", award: "%50 burs" },
  { id: "b4", label: "İlk %20", award: "%25 burs" },
  { id: "b5", label: "Yönetici Özel Bursu", award: "Değişken" },
];

export interface SubjectNet {
  subject: string;
  net: number;
}

export const sampleResult = {
  studentName: "Defne Yılmaz",
  nets: [
    { subject: "Türkçe", net: 18 },
    { subject: "Matematik", net: 19 },
    { subject: "Fen Bilimleri", net: 14 },
    { subject: "İngilizce", net: 14 },
  ] as SubjectNet[],
  totalScore: 486,
  rank: 14,
  percentile: "%2",
  award: "%75 burs",
  campus: "Batıkent Kampüs",
  aiNote: "Bu öğrenci akademik olarak güçlü ve kayıt potansiyeli yüksek. Özel görüşmeye yönlendirilmesi önerilir.",
};

/* ------------------------------ CRM dönüşüm ------------------------------- */

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

export const crmFunnel: FunnelStage[] = [
  { id: "basvuru", label: "Başvuru", value: 1842 },
  { id: "sinav", label: "Sınava Katıldı", value: 1524 },
  { id: "burs", label: "Burs Kazandı", value: 486 },
  { id: "arandi", label: "Arandı", value: 412 },
  { id: "randevu", label: "Randevu Aldı", value: 268 },
  { id: "kayit", label: "Kayıt Oldu", value: 212 },
];

export interface CrmMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const crmMetrics: CrmMetric[] = [
  { id: "lead", label: "Lead Sayısı", value: "1.842", icon: Users },
  { id: "randevu", label: "Randevu Sayısı", value: "268", icon: CalendarCheck },
  { id: "kayit", label: "Kayıt Sayısı", value: "212", icon: CheckCircle2 },
  { id: "donusum", label: "Dönüşüm Oranı", value: "%11,5", icon: Award },
  { id: "gelir", label: "Beklenen Gelir", value: "₺18.4M", icon: Wallet },
];

/* ------------------------------ Başvuru formu seçenekleri ----------------- */

export const applyFormOptions = {
  grades: examBuilderOptions.gradeLevels,
  currentSchools: ["Devlet Okulu", "Özel Okul", "Diğer"],
  genders: ["Kız", "Erkek"],
  campuses: ["Batıkent", "Merkez", "Çayyolu"],
  sessions: ["1. Oturum (10:00)", "2. Oturum (13:00)"],
  cities: ["Ankara", "İstanbul", "İzmir", "Bursa", "Diğer"],
};

export const applyConsents = [
  "KVKK aydınlatma metnini okudum ve kabul ediyorum.",
  "İletişim izni veriyorum.",
  "Sınav kurallarını kabul ediyorum.",
];

export const applyExtras = [
  "Servis bilgisi almak istiyorum.",
  "Kayıt görüşmesi istiyorum.",
];

/** Başarı ekranı örnek başvuru numarası. */
export const sampleApplicationNo = "IKK-2027-000124";

/* ------------------------------ Bursluluk okul tercihi -------------------- */

/** Halka açık başvuru için tenant/okul listesi (mock — domain hazır). */
export const scholarshipSchools = [
  { id: "ikk", name: "İngiliz Kültür Kolejleri", slug: "ingilizkultur" },
  { id: "atael", name: "Atael Koleji", slug: "atael" },
  { id: "demo", name: "Demo Okul", slug: "demookul" },
];
