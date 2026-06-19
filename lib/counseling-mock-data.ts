/**
 * ikkoneedu — Rehberlik Merkezi için mock veriler.
 * Yalnızca arayüz içindir; gerçek backend / Firebase / AI yoktur.
 */

import {
  CalendarHeart,
  Users,
  Handshake,
  AlertTriangle,
  CalendarDays,
  TrendingDown,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

const TENANT_ID = "ikko-demo";

/* ------------------------------ Metrikler --------------------------------- */

export interface CounselingMetric {
  id: string;
  tenantId: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const counselingMetrics: CounselingMetric[] = [
  { id: "gorusme", tenantId: TENANT_ID, label: "Bu Ay Görüşme", value: "84", icon: CalendarHeart },
  { id: "takip", tenantId: TENANT_ID, label: "Takipteki Öğrenci", value: "27", icon: Users },
  { id: "veli", tenantId: TENANT_ID, label: "Veli Görüşmesi", value: "19", icon: Handshake },
  { id: "risk", tenantId: TENANT_ID, label: "Risk Uyarısı", value: "6", icon: AlertTriangle },
];

/* ----------------------- Öğrenci Takip Listesi ---------------------------- */

export type WatchPriority = "Yüksek" | "Orta" | "Düşük";

export interface WatchListStudent {
  id: string;
  tenantId: string;
  name: string;
  grade: string;
  lastSession: string;
  status: string;
  priority: WatchPriority;
}

export const watchListStudents: WatchListStudent[] = [
  {
    id: "w-1",
    tenantId: TENANT_ID,
    name: "Elif Yıldız",
    grade: "8-A",
    lastSession: "14 Haz 2026",
    status: "Sınav kaygısı takibi",
    priority: "Yüksek",
  },
  {
    id: "w-2",
    tenantId: TENANT_ID,
    name: "Mert Aslan",
    grade: "7-C",
    lastSession: "11 Haz 2026",
    status: "Devamsızlık izlemi",
    priority: "Yüksek",
  },
  {
    id: "w-3",
    tenantId: TENANT_ID,
    name: "Zeynep Kaya",
    grade: "6-B",
    lastSession: "9 Haz 2026",
    status: "Akademik destek planı",
    priority: "Orta",
  },
  {
    id: "w-4",
    tenantId: TENANT_ID,
    name: "Ahmet Demir",
    grade: "8-D",
    lastSession: "5 Haz 2026",
    status: "Sosyal uyum süreci",
    priority: "Orta",
  },
  {
    id: "w-5",
    tenantId: TENANT_ID,
    name: "Sıla Çelik",
    grade: "5-A",
    lastSession: "2 Haz 2026",
    status: "Rutin izlem",
    priority: "Düşük",
  },
  {
    id: "w-6",
    tenantId: TENANT_ID,
    name: "Kaan Şahin",
    grade: "7-A",
    lastSession: "30 May 2026",
    status: "Motivasyon görüşmesi",
    priority: "Düşük",
  },
];

/* ------------------------------ Görüşme Notları --------------------------- */

export interface SessionNote {
  id: string;
  tenantId: string;
  student: string;
  date: string;
  note: string;
  tag: string;
}

export const sessionNotes: SessionNote[] = [
  {
    id: "n-1",
    tenantId: TENANT_ID,
    student: "Elif Yıldız",
    date: "14 Haz 2026",
    note: "Sınav öncesi nefes ve gevşeme teknikleri paylaşıldı; veli bilgilendirilecek.",
    tag: "Bireysel",
  },
  {
    id: "n-2",
    tenantId: TENANT_ID,
    student: "Mert Aslan",
    date: "11 Haz 2026",
    note: "Devamsızlık nedenleri konuşuldu; sınıf öğretmeniyle ortak takip kararı alındı.",
    tag: "Takip",
  },
  {
    id: "n-3",
    tenantId: TENANT_ID,
    student: "Zeynep Kaya",
    date: "9 Haz 2026",
    note: "Çalışma planı oluşturuldu; matematik destek dersi önerildi.",
    tag: "Akademik",
  },
  {
    id: "n-4",
    tenantId: TENANT_ID,
    student: "Ahmet Demir",
    date: "5 Haz 2026",
    note: "Akran ilişkilerinde olumlu gelişme gözlendi; grup etkinliklerine yönlendirildi.",
    tag: "Sosyal",
  },
];

/* ------------------------------ Veli Görüşmeleri -------------------------- */

export type ParentMeetingStatus = "Planlandı" | "Tamamlandı" | "Ertelendi";

export interface ParentMeeting {
  id: string;
  tenantId: string;
  parent: string;
  date: string;
  topic: string;
  status: ParentMeetingStatus;
}

export const parentMeetings: ParentMeeting[] = [
  {
    id: "p-1",
    tenantId: TENANT_ID,
    parent: "Yıldız ailesi",
    date: "20 Haz 2026",
    topic: "Sınav dönemi destek planı",
    status: "Planlandı",
  },
  {
    id: "p-2",
    tenantId: TENANT_ID,
    parent: "Aslan ailesi",
    date: "13 Haz 2026",
    topic: "Devamsızlık ve okula uyum",
    status: "Tamamlandı",
  },
  {
    id: "p-3",
    tenantId: TENANT_ID,
    parent: "Kaya ailesi",
    date: "10 Haz 2026",
    topic: "Akademik gelişim takibi",
    status: "Tamamlandı",
  },
  {
    id: "p-4",
    tenantId: TENANT_ID,
    parent: "Demir ailesi",
    date: "18 Haz 2026",
    topic: "Sosyal uyum süreci",
    status: "Ertelendi",
  },
];

/* ------------------------------ Risk Analizi ------------------------------ */

export type RiskLevel = "Yüksek" | "Orta" | "Düşük";

export interface RiskFactor {
  id: string;
  tenantId: string;
  label: string;
  percent: number;
  level: RiskLevel;
  icon: LucideIcon;
}

export const riskFactors: RiskFactor[] = [
  {
    id: "r-1",
    tenantId: TENANT_ID,
    label: "Devamsızlık eğilimi",
    percent: 72,
    level: "Yüksek",
    icon: CalendarDays,
  },
  {
    id: "r-2",
    tenantId: TENANT_ID,
    label: "Akademik düşüş",
    percent: 48,
    level: "Orta",
    icon: TrendingDown,
  },
  {
    id: "r-3",
    tenantId: TENANT_ID,
    label: "Sosyal-duygusal göstergeler",
    percent: 26,
    level: "Düşük",
    icon: HeartPulse,
  },
];

export const followUpPlan: string[] = [
  "Devamsızlığı yüksek öğrenciler için haftalık izlem görüşmesi planlanması.",
  "Akademik düşüş gösteren öğrencilere branş öğretmeniyle ortak destek planı.",
  "Sosyal-duygusal göstergeleri izlemek için aylık grup etkinliği takibi.",
];

/* ------------------------------ AI Önerileri ------------------------------ */

export const aiInsights: string[] = [
  "Devamsızlığı artan öğrenciler için sınıf öğretmeniyle koordinasyon önerilir.",
  "Sınav kaygısı yaşayan öğrenciler için kısa bireysel görüşme planlanabilir.",
  "Akademik düşüş gösteren öğrenciler için destek dersi yönlendirmesi değerlendirilebilir.",
  "Sosyal uyum süreçlerinde akran destekli grup etkinlikleri faydalı olabilir.",
];
