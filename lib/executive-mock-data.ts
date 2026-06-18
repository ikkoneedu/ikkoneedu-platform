/**
 * ikkoneedu — Executive Dashboard için mock veriler.
 * Yalnızca arayüz içindir; gerçek veri/AI/grafik kütüphanesi yoktur.
 */

import {
  GraduationCap,
  UserPlus,
  Percent,
  Star,
  Wallet,
  Clock,
  FileText,
  CalendarRange,
  Megaphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Özet metrikler ---------------------------- */

export interface ExecutiveMetric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export const executiveMetrics: ExecutiveMetric[] = [
  { id: "ogrenci", label: "Toplam Öğrenci", value: "1.248", delta: "+%6", trend: "up", icon: GraduationCap },
  { id: "basvuru", label: "Aday Veli Başvurusu", value: "386", delta: "+42", trend: "up", icon: UserPlus },
  { id: "donusum", label: "Kayıt Dönüşüm Oranı", value: "%32", delta: "+%4", trend: "up", icon: Percent },
  { id: "memnuniyet", label: "Veli Memnuniyeti", value: "4.8/5", delta: "+0.2", trend: "up", icon: Star },
  { id: "gelir", label: "Aylık Gelir", value: "₺4.2M", delta: "+%8", trend: "up", icon: Wallet },
  { id: "tasarruf", label: "AI ile Tasarruf Edilen Süre", value: "186 saat", delta: "+24", trend: "up", icon: Clock },
];

/* ------------------------------ Kayıt funnel ------------------------------ */

export interface FunnelStage {
  id: string;
  label: string;
  value: number;
}

export const admissionsFunnel: FunnelStage[] = [
  { id: "aday", label: "Aday Veli", value: 386 },
  { id: "randevu", label: "Randevu", value: 240 },
  { id: "gorusme", label: "Görüşme", value: 124 },
  { id: "kayit", label: "Kayıt", value: 82 },
];

export interface AdmissionsBreakdown {
  id: string;
  label: string;
  value: string;
}

export const admissionsBreakdown: AdmissionsBreakdown[] = [
  { id: "web", label: "Web Başvuruları", value: "164" },
  { id: "demo", label: "Demo Talepleri", value: "98" },
  { id: "randevu", label: "Randevu Talepleri", value: "124" },
  { id: "kayit", label: "Kayıta Dönüşen", value: "82" },
  { id: "kayip", label: "Kaybedilen Aday", value: "46" },
];

/* ------------------------------ Finansal ---------------------------------- */

export interface FinancialMetric {
  id: string;
  label: string;
  value: string;
}

export const financialMetrics: FinancialMetric[] = [
  { id: "tahsilat", label: "Bu Ay Tahsilat", value: "₺3.6M" },
  { id: "bekleyen", label: "Bekleyen Ödeme", value: "₺620K" },
  { id: "erken", label: "Erken Kayıt Geliri", value: "₺1.1M" },
  { id: "kampanya", label: "Kampanya Etkisi", value: "+%14" },
];

export interface TrendPoint {
  label: string;
  value: number;
}

export const monthlyRevenueTrend: TrendPoint[] = [
  { label: "Oca", value: 3.4 },
  { label: "Şub", value: 3.6 },
  { label: "Mar", value: 3.8 },
  { label: "Nis", value: 3.9 },
  { label: "May", value: 4.0 },
  { label: "Haz", value: 4.2 },
];

/* ------------------------------ Akademik ---------------------------------- */

export interface AcademicMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
}

export const academicMetrics: AcademicMetric[] = [
  { id: "lgs", label: "LGS Başarı Endeksi", value: "82", delta: "+5", trend: "up" },
  { id: "ingilizce", label: "İngilizce Gelişim Skoru", value: "88", delta: "+6", trend: "up" },
  { id: "deneme", label: "Deneme Sınavı Ortalaması", value: "74", delta: "+3", trend: "up" },
  { id: "devamsizlik", label: "Devamsızlık Trendi", value: "%2.1", delta: "-0.4", trend: "down" },
];

export const academicTrend: TrendPoint[] = [
  { label: "Oca", value: 70 },
  { label: "Şub", value: 72 },
  { label: "Mar", value: 73 },
  { label: "Nis", value: 76 },
  { label: "May", value: 79 },
  { label: "Haz", value: 82 },
];

/* ------------------------------ Veli memnuniyeti -------------------------- */

export interface SatisfactionMetric {
  id: string;
  label: string;
  value: string;
  /** İlerleme çubuğu için 0-100 (opsiyonel). */
  percent?: number;
}

export const parentSatisfaction: SatisfactionMetric[] = [
  { id: "genel", label: "Genel Memnuniyet", value: "4.8/5", percent: 96 },
  { id: "kullanim", label: "Uygulama Kullanım Oranı", value: "%76", percent: 76 },
  { id: "okunma", label: "Duyuru Okunma Oranı", value: "%91", percent: 91 },
  { id: "yanit", label: "Mesaj Yanıt Süresi", value: "18 dk" },
];

/* ------------------------------ AI etkisi --------------------------------- */

export interface AiImpactMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const aiImpact: AiImpactMetric[] = [
  { id: "sorgu", label: "Toplam AI Sorgusu", value: "12.840", icon: Sparkles },
  { id: "sinav", label: "Üretilen Sınav", value: "128", icon: FileText },
  { id: "program", label: "Oluşturulan Ders Programı", value: "24", icon: CalendarRange },
  { id: "duyuru", label: "Hazırlanan Veli Duyurusu", value: "310", icon: Megaphone },
  { id: "tasarruf", label: "Tahmini Zaman Tasarrufu", value: "186 saat", icon: Clock },
];

/* ------------------------------ Kampüs karşılaştırması -------------------- */

export interface CampusRow {
  id: string;
  name: string;
  students: string;
  applications: string;
  satisfaction: string;
  aiUsage: string;
  revenue: string;
  status: "Aktif" | "Deneme";
}

export const campusComparison: CampusRow[] = [
  { id: "ikk", name: "İngiliz Kültür Kolejleri", students: "1.248", applications: "386", satisfaction: "4.8", aiUsage: "12.840", revenue: "₺4.2M", status: "Aktif" },
  { id: "atael", name: "Atael Koleji", students: "842", applications: "214", satisfaction: "4.6", aiUsage: "8.120", revenue: "₺2.8M", status: "Aktif" },
  { id: "demo", name: "Demo Okul", students: "120", applications: "38", satisfaction: "4.4", aiUsage: "1.240", revenue: "₺320K", status: "Deneme" },
];

/* ------------------------------ AI öngörüleri ----------------------------- */

export const executiveInsights: string[] = [
  "Erken kayıt kampanyası bu hızla devam ederse ay sonunda %18 daha fazla kayıt bekleniyor.",
  "Veli uygulama kullanım oranı yüksek olan sınıflarda memnuniyet puanı daha yüksek.",
  "8. sınıflarda deneme sınavı başarı trendi son 3 haftada %7 yükseldi.",
  "AI destekli duyuru metinleri, standart duyurulara göre %22 daha yüksek okunma oranı sağladı.",
];

/* ------------------------------ Stratejik aksiyonlar ---------------------- */

export interface StrategicAction {
  id: string;
  label: string;
}

export const strategicActions: StrategicAction[] = [
  { id: "kayit", label: "Kayıt Raporunu İncele" },
  { id: "memnuniyet", label: "Veli Memnuniyet Raporu" },
  { id: "ai", label: "AI Kullanım Raporu" },
  { id: "finans", label: "Finansal Rapor" },
  { id: "kampus", label: "Kampüs Karşılaştırması" },
  { id: "sunum", label: "Yönetim Sunumu Oluştur" },
];
