/**
 * ikkoneedu — Finans Merkezi için mock veriler.
 * Yalnızca arayüz içindir; gerçek veri/AI/ödeme/grafik kütüphanesi yoktur.
 */

import {
  Wallet,
  Hourglass,
  CalendarCheck,
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const TENANT_ID = "ikkoneedu-merkez";

/* ------------------------------ Özet metrikler ---------------------------- */

export interface FinanceMetric {
  id: string;
  tenantId: string;
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export const financeMetrics: FinanceMetric[] = [
  { id: "aylik-tahsilat", tenantId: TENANT_ID, label: "Aylık Tahsilat", value: "₺3.6M", delta: "+%9", trend: "up", icon: Wallet },
  { id: "bekleyen-odeme", tenantId: TENANT_ID, label: "Bekleyen Ödeme", value: "₺620K", delta: "-%4", trend: "down", icon: Hourglass },
  { id: "erken-kayit", tenantId: TENANT_ID, label: "Erken Kayıt Geliri", value: "₺1.1M", delta: "+%18", trend: "up", icon: CalendarCheck },
  { id: "burs-orani", tenantId: TENANT_ID, label: "Burs Oranı", value: "%12", delta: "+%1", trend: "neutral", icon: GraduationCap },
  { id: "geciken-odeme", tenantId: TENANT_ID, label: "Geciken Ödeme", value: "₺240K", delta: "+%2", trend: "down", icon: AlertTriangle },
  { id: "net-gelir", tenantId: TENANT_ID, label: "Net Gelir", value: "₺4.2M", delta: "+%8", trend: "up", icon: TrendingUp },
];

/* ------------------------------ Tahsilat tablosu -------------------------- */

export type PaymentStatus = "Ödendi" | "Bekliyor" | "Gecikti";

export interface Payment {
  id: string;
  tenantId: string;
  parent: string;
  student: string;
  grade: string;
  amount: string;
  date: string;
  status: PaymentStatus;
}

export const payments: Payment[] = [
  { id: "pay-001", tenantId: TENANT_ID, parent: "Ayşe Yılmaz", student: "Defne Yılmaz", grade: "5A", amount: "₺28.500", date: "12 Haz 2026", status: "Ödendi" },
  { id: "pay-002", tenantId: TENANT_ID, parent: "Mehmet Demir", student: "Kerem Demir", grade: "6B", amount: "₺28.500", date: "10 Haz 2026", status: "Gecikti" },
  { id: "pay-003", tenantId: TENANT_ID, parent: "Zeynep Kaya", student: "Ela Kaya", grade: "4C", amount: "₺26.000", date: "14 Haz 2026", status: "Bekliyor" },
  { id: "pay-004", tenantId: TENANT_ID, parent: "Ali Şahin", student: "Mert Şahin", grade: "7A", amount: "₺31.200", date: "09 Haz 2026", status: "Ödendi" },
  { id: "pay-005", tenantId: TENANT_ID, parent: "Fatma Çelik", student: "Nil Çelik", grade: "5A", amount: "₺28.500", date: "11 Haz 2026", status: "Gecikti" },
  { id: "pay-006", tenantId: TENANT_ID, parent: "Hasan Aydın", student: "Eren Aydın", grade: "8B", amount: "₺33.800", date: "15 Haz 2026", status: "Bekliyor" },
  { id: "pay-007", tenantId: TENANT_ID, parent: "Elif Arslan", student: "Duru Arslan", grade: "3A", amount: "₺24.500", date: "08 Haz 2026", status: "Ödendi" },
  { id: "pay-008", tenantId: TENANT_ID, parent: "Burak Koç", student: "Toprak Koç", grade: "6B", amount: "₺28.500", date: "13 Haz 2026", status: "Ödendi" },
];

/* ------------------------------ Bekleyen ödemeler ------------------------- */

export interface PendingPayment {
  id: string;
  tenantId: string;
  parent: string;
  student: string;
  amount: string;
  dueDate: string;
  /** Gecikme gün sayısı; 0 ise henüz vadesi geçmemiştir. */
  overdueDays: number;
}

export const pendingPayments: PendingPayment[] = [
  { id: "pend-001", tenantId: TENANT_ID, parent: "Mehmet Demir", student: "Kerem Demir", amount: "₺28.500", dueDate: "10 Haz 2026", overdueDays: 9 },
  { id: "pend-002", tenantId: TENANT_ID, parent: "Fatma Çelik", student: "Nil Çelik", amount: "₺28.500", dueDate: "11 Haz 2026", overdueDays: 8 },
  { id: "pend-003", tenantId: TENANT_ID, parent: "Zeynep Kaya", student: "Ela Kaya", amount: "₺26.000", dueDate: "20 Haz 2026", overdueDays: 0 },
  { id: "pend-004", tenantId: TENANT_ID, parent: "Hasan Aydın", student: "Eren Aydın", amount: "₺33.800", dueDate: "22 Haz 2026", overdueDays: 0 },
  { id: "pend-005", tenantId: TENANT_ID, parent: "Selin Öztürk", student: "Mira Öztürk", amount: "₺26.000", dueDate: "05 Haz 2026", overdueDays: 14 },
];

/* ------------------------------ Erken kayıt geliri ------------------------ */

export interface EarlyEnrollmentTier {
  id: string;
  tenantId: string;
  /** Kademe adı (ör. Anaokulu, İlkokul). */
  level: string;
  enrolled: number;
  revenue: string;
  /** Çubuk yüksekliği için bağıl gelir (₺M). */
  revenueValue: number;
}

export const earlyEnrollment: EarlyEnrollmentTier[] = [
  { id: "tier-ana", tenantId: TENANT_ID, level: "Anaokulu", enrolled: 38, revenue: "₺186K", revenueValue: 0.19 },
  { id: "tier-ilk", tenantId: TENANT_ID, level: "İlkokul", enrolled: 64, revenue: "₺412K", revenueValue: 0.41 },
  { id: "tier-orta", tenantId: TENANT_ID, level: "Ortaokul", enrolled: 52, revenue: "₺348K", revenueValue: 0.35 },
  { id: "tier-lise", tenantId: TENANT_ID, level: "Lise", enrolled: 21, revenue: "₺154K", revenueValue: 0.15 },
];

/* ------------------------------ Burs ve indirim --------------------------- */

export interface Scholarship {
  id: string;
  tenantId: string;
  /** Burs / indirim türü. */
  type: string;
  students: number;
  totalAmount: string;
  /** Toplam gelir içindeki indirim oranı. */
  rate: string;
}

export const scholarships: Scholarship[] = [
  { id: "sch-basari", tenantId: TENANT_ID, type: "Başarı Bursu", students: 64, totalAmount: "₺820K", rate: "%5.2" },
  { id: "sch-kardes", tenantId: TENANT_ID, type: "Kardeş İndirimi", students: 48, totalAmount: "₺410K", rate: "%2.6" },
  { id: "sch-ihtiyac", tenantId: TENANT_ID, type: "İhtiyaç Bursu", students: 22, totalAmount: "₺356K", rate: "%2.3" },
  { id: "sch-personel", tenantId: TENANT_ID, type: "Personel İndirimi", students: 14, totalAmount: "₺188K", rate: "%1.2" },
  { id: "sch-erken", tenantId: TENANT_ID, type: "Erken Kayıt İndirimi", students: 96, totalAmount: "₺112K", rate: "%0.7" },
];

/* ------------------------------ Gelir trendi ------------------------------ */

export interface TrendPoint {
  label: string;
  value: number;
}

export const revenueTrend: TrendPoint[] = [
  { label: "Oca", value: 3.2 },
  { label: "Şub", value: 3.4 },
  { label: "Mar", value: 3.3 },
  { label: "Nis", value: 3.7 },
  { label: "May", value: 3.9 },
  { label: "Haz", value: 4.2 },
];

/* ------------------------------ AI öngörüleri ----------------------------- */

export const aiInsights: string[] = [
  "Erken kayıt döneminde mevcut trend devam ederse bu ay sonu 4.8M TL tahsilat öngörülmektedir.",
  "Geciken ödemelerde 5A ve 6B sınıflarında takip yoğunluğu artmıştır.",
  "Kardeş indirimi kullanan velilerde tahsilat tahsil oranı %98 ile en yüksek seviyededir.",
  "İhtiyaç bursu bütçesi planlanan limitin %4 altında seyretmektedir; ek başvurular için alan mevcuttur.",
];
