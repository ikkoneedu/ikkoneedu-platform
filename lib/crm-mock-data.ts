/**
 * ikkoneedu — CRM & Lead Yönetimi için mock veriler.
 * Yalnızca arayüz içindir; gerçek CRM / backend yoktur.
 */

import {
  Users,
  UserPlus,
  MessagesSquare,
  CalendarClock,
  CheckCircle2,
  Percent,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Instagram,
  Facebook,
  Search,
  Globe,
  Share2,
  Award,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Metrikler --------------------------------- */

export interface CrmMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const crmMetrics: CrmMetric[] = [
  { id: "toplam", label: "Toplam Lead", value: "1.248", icon: Users },
  { id: "yeni", label: "Yeni Lead", value: "82", icon: UserPlus },
  { id: "aktif", label: "Aktif Görüşme", value: "164", icon: MessagesSquare },
  { id: "randevu", label: "Planlanan Randevu", value: "48", icon: CalendarClock },
  { id: "kayit", label: "Kayıta Dönüşen", value: "212", icon: CheckCircle2 },
  { id: "donusum", label: "Dönüşüm Oranı", value: "%34", icon: Percent },
];

/* ------------------------------ Pipeline (Kanban) ------------------------- */

export interface PipelineLead {
  id: string;
  parentName: string;
  childAge: string;
  level: string;
  campus: string;
  advisor: string;
}

export interface PipelineColumn {
  id: string;
  title: string;
  leads: PipelineLead[];
}

export const pipeline: PipelineColumn[] = [
  {
    id: "yeni",
    title: "Yeni Lead",
    leads: [
      { id: "l1", parentName: "Elif Demir", childAge: "5 yaş", level: "Anaokulu", campus: "Batıkent", advisor: "Ayşe Y." },
      { id: "l2", parentName: "Can Öztürk", childAge: "7 yaş", level: "1. Sınıf", campus: "Merkez", advisor: "Mehmet D." },
    ],
  },
  {
    id: "iletisim",
    title: "İletişim Kuruldu",
    leads: [
      { id: "l3", parentName: "Zeynep Arslan", childAge: "11 yaş", level: "Ortaokul", campus: "Çayyolu", advisor: "Ayşe Y." },
    ],
  },
  {
    id: "randevu",
    title: "Randevu Planlandı",
    leads: [
      { id: "l4", parentName: "Murat Kaya", childAge: "6 yaş", level: "1. Sınıf", campus: "Çayyolu", advisor: "Mehmet D." },
      { id: "l5", parentName: "Selin Yıldız", childAge: "4 yaş", level: "Anaokulu", campus: "Batıkent", advisor: "Ayşe Y." },
    ],
  },
  {
    id: "ziyaret",
    title: "Okul Ziyareti",
    leads: [
      { id: "l6", parentName: "Ahmet Şahin", childAge: "13 yaş", level: "Lise", campus: "Merkez", advisor: "Satış Ekibi" },
    ],
  },
  {
    id: "teklif",
    title: "Teklif Gönderildi",
    leads: [
      { id: "l7", parentName: "Derya Aksoy", childAge: "8 yaş", level: "2. Sınıf", campus: "Merkez", advisor: "Mehmet D." },
    ],
  },
  {
    id: "kayit",
    title: "Kayıt Tamamlandı",
    leads: [
      { id: "l8", parentName: "Burak Çelik", childAge: "6 yaş", level: "1. Sınıf", campus: "Batıkent", advisor: "Ayşe Y." },
    ],
  },
];

/* ------------------------------ Lead detay -------------------------------- */

export interface LeadDetail {
  parentName: string;
  phone: string;
  email: string;
  studentInfo: string;
  level: string;
  source: string;
  lastContact: string;
  nextAction: string;
}

export const leadDetail: LeadDetail = {
  parentName: "Elif Demir",
  phone: "0 5xx xxx 12 34",
  email: "elif.demir@example.com",
  studentInfo: "Kız çocuğu, 5 yaş",
  level: "Anaokulu",
  source: "Instagram",
  lastContact: "Bugün, 11:20 — WhatsApp",
  nextAction: "Yarın 14:00 tanıtım randevusu",
};

/* ------------------------------ Lead kaynakları --------------------------- */

export interface LeadSource {
  id: string;
  name: string;
  /** Toplam lead içindeki pay (%). */
  share: number;
  /** Kaynağın dönüşüm oranı (%). */
  conversion: number;
  icon: LucideIcon;
}

export const leadSources: LeadSource[] = [
  { id: "instagram", name: "Instagram", share: 34, conversion: 38, icon: Instagram },
  { id: "facebook", name: "Facebook", share: 14, conversion: 24, icon: Facebook },
  { id: "google", name: "Google Ads", share: 22, conversion: 31, icon: Search },
  { id: "organik", name: "Organik Web", share: 16, conversion: 29, icon: Globe },
  { id: "referans", name: "Referans", share: 9, conversion: 52, icon: Share2 },
  { id: "bursluluk", name: "Bursluluk Sınavı", share: 11, conversion: 47, icon: Award },
  { id: "telefon", name: "Telefon", share: 5, conversion: 41, icon: Phone },
];

/* ------------------------------ Randevular -------------------------------- */

export type AppointmentStatus = "Bekliyor" | "Onaylandı" | "Gerçekleşti" | "İptal";

export interface CrmAppointment {
  id: string;
  parent: string;
  date: string;
  time: string;
  campus: string;
  advisor: string;
  status: AppointmentStatus;
}

export const crmAppointments: CrmAppointment[] = [
  { id: "a1", parent: "Murat Kaya", date: "24 Haz", time: "14:00", campus: "Çayyolu", advisor: "Mehmet D.", status: "Onaylandı" },
  { id: "a2", parent: "Selin Yıldız", date: "24 Haz", time: "15:30", campus: "Batıkent", advisor: "Ayşe Y.", status: "Bekliyor" },
  { id: "a3", parent: "Ahmet Şahin", date: "23 Haz", time: "11:00", campus: "Merkez", advisor: "Satış Ekibi", status: "Gerçekleşti" },
  { id: "a4", parent: "Derya Aksoy", date: "25 Haz", time: "10:00", campus: "Merkez", advisor: "Mehmet D.", status: "Bekliyor" },
  { id: "a5", parent: "Okan Tan", date: "22 Haz", time: "16:00", campus: "Çayyolu", advisor: "Ayşe Y.", status: "İptal" },
];

/* ------------------------------ AI içgörüleri ----------------------------- */

export const crmAiInsights: string[] = [
  "Anaokulu leadleri daha yüksek dönüşüm sağlıyor.",
  "Batıkent bölgesi bu ay %18 daha fazla başvuru üretti.",
  "48 saat içinde aranan leadlerin dönüşüm oranı daha yüksek.",
  "WhatsApp dönüşleri telefon görüşmelerinden daha başarılı.",
];

/* ------------------------------ Görev merkezi ----------------------------- */

export interface TaskGroup {
  id: string;
  title: string;
  count: number;
  items: string[];
}

export const taskGroups: TaskGroup[] = [
  { id: "aranacak", title: "Bugün Aranacak Veliler", count: 12, items: ["Elif Demir", "Can Öztürk", "Selin Yıldız"] },
  { id: "teklif", title: "Teklif Bekleyen Veliler", count: 6, items: ["Derya Aksoy", "Ahmet Şahin"] },
  { id: "hatirlatma", title: "Randevu Hatırlatmaları", count: 8, items: ["Murat Kaya — yarın 14:00", "Selin Yıldız — yarın 15:30"] },
  { id: "geri-donus", title: "Geri Dönüş Yapılacak Adaylar", count: 9, items: ["Okan Tan", "Zeynep Arslan"] },
];

/* ------------------------------ Hızlı işlemler ---------------------------- */

export interface CrmAction {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Varsa gerçek hedef route; yoksa render tarafı /coming-soon kullanır. */
  href?: string;
}

export const crmActions: CrmAction[] = [
  { id: "lead", label: "Yeni Lead Ekle", icon: UserPlus },
  { id: "randevu", label: "Randevu Oluştur", icon: CalendarClock },
  { id: "whatsapp", label: "WhatsApp Gönder", icon: MessageCircle, href: "/messages" },
  { id: "eposta", label: "E-posta Hazırla", icon: Mail, href: "/messages" },
  { id: "rapor", label: "CRM Raporu Al", icon: FileText },
];

/* ------------------------------ Kayıt tahmini ----------------------------- */

export interface CrmForecast {
  registrations: string;
  expectedRevenue: string;
  conversion: string;
}

export const crmForecast: CrmForecast = {
  registrations: "86 kayıt",
  expectedRevenue: "₺4.8M",
  conversion: "%38",
};
