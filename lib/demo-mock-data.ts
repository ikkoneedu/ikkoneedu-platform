/**
 * ikkoneedu — Demo talep sayfası için mock veriler.
 * Yalnızca tanıtım amaçlıdır; gerçek form gönderimi/CRM bağlantısı yoktur.
 */

import {
  Bot,
  LayoutDashboard,
  Network,
  Smartphone,
  Users,
  FileBarChart,
  ClipboardList,
  PhoneCall,
  MonitorPlay,
  FileText,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Kurum türleri ----------------------------- */

export const institutionTypes = [
  "Anaokulu",
  "İlkokul",
  "Ortaokul",
  "Lise",
  "Kolej",
  "Kampüs",
];

/* ------------------------------ Faydalar ---------------------------------- */

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const demoBenefits: Benefit[] = [
  { id: "ai", title: "Yapay Zeka Destekli", description: "AI Brain ile yönetim, içerik üretimi ve karar süreçleri güçlenir.", icon: Bot },
  { id: "tek-platform", title: "Tek Platform Yönetimi", description: "Tüm okul süreçlerini tek merkezden yönetin.", icon: LayoutDashboard },
  { id: "coklu-okul", title: "Çoklu Okul Desteği", description: "Birden fazla kampüsü tek çatı altında ölçekleyin.", icon: Network },
  { id: "mobil", title: "Mobil Uygulama", description: "Veli, öğrenci ve öğretmenler için mobil deneyim.", icon: Smartphone },
  { id: "deneyim", title: "Öğrenci / Veli / Öğretmen Deneyimi", description: "Herkese özel, kusursuzca bağlı portallar.", icon: Users },
  { id: "raporlama", title: "Kurumsal Raporlama", description: "Stratejik kararlar için gerçek zamanlı analitik.", icon: FileBarChart },
];

/* ------------------------------ Demo süreci ------------------------------- */

export interface DemoStep {
  id: string;
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const demoSteps: DemoStep[] = [
  { id: "talep", step: 1, title: "Talep Oluşturun", description: "Formu doldurun, ihtiyaçlarınızı kısaca paylaşın.", icon: ClipboardList },
  { id: "arama", step: 2, title: "Uzmanımız Sizi Arasın", description: "Ekibimiz en kısa sürede sizinle iletişime geçer.", icon: PhoneCall },
  { id: "demo", step: 3, title: "Online Demo Yapılsın", description: "Platformu canlı olarak birlikte inceleyelim.", icon: MonitorPlay },
  { id: "teklif", step: 4, title: "Okulunuza Özel Teklif Hazırlansın", description: "İhtiyaçlarınıza göre özel teklif sunalım.", icon: FileText },
];

/* ------------------------------ SSS -------------------------------------- */

export interface DemoFaqItem {
  id: string;
  question: string;
  answer: string;
}

export const demoFaq: DemoFaqItem[] = [
  {
    id: "ucret",
    question: "Demo ücretsiz mi?",
    answer: "Evet. Demo görüşmesi tamamen ücretsizdir ve herhangi bir taahhüt gerektirmez.",
  },
  {
    id: "sure",
    question: "Demo ne kadar sürüyor?",
    answer: "Online demo görüşmesi ortalama 30-45 dakika sürer ve okulunuzun ihtiyaçlarına göre şekillenir.",
  },
  {
    id: "kurulum",
    question: "Kurulum süresi ne kadar?",
    answer: "Standart kurulum genellikle birkaç iş günü içinde tamamlanır; veri aktarımı ve onboarding dahildir.",
  },
  {
    id: "mobil",
    question: "Mobil uygulamalar dahil mi?",
    answer: "Evet. Veli, öğrenci ve öğretmen mobil deneyimi platformun bir parçasıdır.",
  },
  {
    id: "ai",
    question: "AI modülleri pakete dahil mi?",
    answer: "Temel AI modülleri Professional ve üzeri paketlere dahildir. Yoğun kullanım için kurumsal teklif hazırlanabilir.",
  },
  {
    id: "veri",
    question: "Veriler nerede saklanıyor?",
    answer: "Tüm veriler KVKK uyumlu, güvenli ve kurumlar arası izole bir altyapıda saklanır.",
  },
];
