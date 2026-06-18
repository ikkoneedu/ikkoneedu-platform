/**
 * ikkoneedu — SaaS Yönetim Merkezi için mock veriler.
 *
 * ÖNEMLİ: Yalnızca mock UI içindir; gerçek ödeme, tenant, AI veya veritabanı
 * bağlantısı yoktur.
 *
 * GELECEKTEKİ ENTEGRASYON (öneri):
 *   // Çoklu okul (multi-tenant) mimarisi için her okul bir "tenant" olur.
 *   // Tenant kimliği subdomain (okuladi.ikkoneedu.com) veya path ile çözülür.
 *   // Abonelik/ödeme: iyzico / Stripe Billing; AI kullanımı tenant bazlı loglanır.
 */

import {
  School,
  Users,
  Wallet,
  Cpu,
  Server,
  Plug,
  Sparkles,
  Database,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ 1. Genel durum ---------------------------- */

export interface SaasMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const saasOverviewMetrics: SaasMetric[] = [
  { id: "okul", label: "Toplam Okul", value: "24", icon: School },
  { id: "kullanici", label: "Aktif Kullanıcı", value: "18.420", icon: Users },
  { id: "gelir", label: "Aylık Gelir", value: "₺238.000", icon: Wallet },
  { id: "ai", label: "AI Kullanımı", value: "128.540 işlem", icon: Cpu },
];

/* ------------------------------ 2. Okullar -------------------------------- */

export interface SaasSchool {
  id: string;
  name: string;
  plan: "Starter" | "Professional" | "Enterprise";
  status: "Aktif" | "Deneme Süreci";
  users: number;
}

export const saasSchools: SaasSchool[] = [
  { id: "ikk", name: "İngiliz Kültür Kolejleri", plan: "Professional", status: "Aktif", users: 1248 },
  { id: "atael", name: "Atael Koleji", plan: "Professional", status: "Aktif", users: 842 },
  { id: "demo", name: "Demo Koleji", plan: "Starter", status: "Aktif", users: 120 },
  { id: "yeni", name: "Yeni Kampüs", plan: "Enterprise", status: "Deneme Süreci", users: 0 },
];

/* ------------------------------ 3. Yeni okul ------------------------------ */

export const saasPlanTypes = ["Starter", "Professional", "Enterprise"];

/* ------------------------------ 4. Abonelikler ---------------------------- */

export interface SaasSubscription {
  id: string;
  name: string;
  price: string;
  features: string[];
  activeSchools: number;
  revenueShare: string;
  highlight?: boolean;
}

export const saasSubscriptions: SaasSubscription[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₺4.900 / ay",
    features: ["1 Kampüs", "Temel modüller", "E-posta destek"],
    activeSchools: 8,
    revenueShare: "₺39.200",
  },
  {
    id: "professional",
    name: "Professional",
    price: "₺9.900 / ay",
    features: ["Çoklu sınıf", "Tüm portallar", "AI modülleri", "Öncelikli destek"],
    activeSchools: 12,
    revenueShare: "₺118.800",
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₺19.900 / ay",
    features: ["Sınırsız kampüs", "Özel marka", "Gelişmiş AI", "7/24 destek", "SLA"],
    activeSchools: 4,
    revenueShare: "₺79.600",
  },
];

/* ------------------------------ 5. Gelir analitiği ------------------------ */

export interface RevenuePoint {
  month: string;
  /** Bin TL cinsinden değer (grafik için). */
  value: number;
}

export const saasRevenueByMonth: RevenuePoint[] = [
  { month: "Ocak", value: 180 },
  { month: "Şubat", value: 195 },
  { month: "Mart", value: 205 },
  { month: "Nisan", value: 218 },
  { month: "Mayıs", value: 228 },
  { month: "Haziran", value: 238 },
];

export interface RevenueMetric {
  id: string;
  label: string;
  sublabel: string;
  value: string;
}

export const saasRevenueMetrics: RevenueMetric[] = [
  { id: "mrr", label: "MRR", sublabel: "Monthly Recurring Revenue", value: "₺238.000" },
  { id: "arr", label: "ARR", sublabel: "Annual Recurring Revenue", value: "₺2.856.000" },
  { id: "yeni", label: "Yeni Müşteri", sublabel: "Bu ay", value: "+5" },
  { id: "churn", label: "Churn Rate", sublabel: "Aylık", value: "%1,8" },
];

/* ------------------------------ 6. AI kullanımı --------------------------- */

export interface AiUsageModule {
  name: string;
  value: number;
}

export interface SaasAiUsage {
  totalQueries: string;
  topSchools: { id: string; name: string; queries: string }[];
  topModules: AiUsageModule[];
}

export const saasAiUsage: SaasAiUsage = {
  totalQueries: "128.540",
  topSchools: [
    { id: "ikk", name: "İngiliz Kültür Kolejleri", queries: "48.200" },
    { id: "atael", name: "Atael Koleji", queries: "31.400" },
    { id: "demo", name: "Demo Koleji", queries: "12.900" },
  ],
  topModules: [
    { name: "AI Brain", value: 52000 },
    { name: "AI Sınav", value: 38000 },
    { name: "AI Ders Programı", value: 24000 },
    { name: "AI Karne", value: 14540 },
  ],
};

/* ------------------------------ 7. Tenant --------------------------------- */

export interface SaasTenant {
  id: string;
  domain: string;
  school: string;
}

export const saasTenants: SaasTenant[] = [
  { id: "ikk", domain: "ingilizkultur.ikkoneedu.com", school: "İngiliz Kültür Kolejleri" },
  { id: "atael", domain: "atael.ikkoneedu.com", school: "Atael Koleji" },
  { id: "demo", domain: "demookul.ikkoneedu.com", school: "Demo Koleji" },
];

export const saasTenantFeatures = [
  "Tenant Isolation",
  "Custom Branding",
  "School Settings",
  "Domain Management",
];

/* ------------------------------ 8. Lisanslar ------------------------------ */

export interface SaasLicense {
  id: string;
  school: string;
  plan: string;
  start: string;
  end: string;
  status: "Aktif" | "Deneme" | "Yenilenecek";
}

export const saasLicenses: SaasLicense[] = [
  { id: "l1", school: "İngiliz Kültür Kolejleri", plan: "Professional", start: "01.09.2025", end: "31.08.2026", status: "Aktif" },
  { id: "l2", school: "Atael Koleji", plan: "Professional", start: "15.09.2025", end: "14.09.2026", status: "Aktif" },
  { id: "l3", school: "Demo Koleji", plan: "Starter", start: "01.06.2026", end: "30.06.2026", status: "Deneme" },
  { id: "l4", school: "Yeni Kampüs", plan: "Enterprise", start: "10.06.2026", end: "10.07.2026", status: "Yenilenecek" },
];

/* ------------------------------ 9. Platform sağlığı ----------------------- */

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  ok: boolean;
}

export const saasPlatformHealth: HealthMetric[] = [
  { id: "sunucu", label: "Sunucu Durumu", value: "99.98%", icon: Server, ok: true },
  { id: "api", label: "API Durumu", value: "Aktif", icon: Plug, ok: true },
  { id: "ai", label: "AI Servisleri", value: "Çalışıyor", icon: Sparkles, ok: true },
  { id: "db", label: "Veritabanı", value: "Normal", icon: Database, ok: true },
];

/* ------------------------------ 10. Vizyon -------------------------------- */

export interface VisionTier {
  id: string;
  schools: string;
  revenue: string;
  highlight?: boolean;
}

export const saasVisionTiers: VisionTier[] = [
  { id: "t10", schools: "10 Okul", revenue: "₺1.2M Yıllık Gelir" },
  { id: "t25", schools: "25 Okul", revenue: "₺3M Yıllık Gelir" },
  { id: "t50", schools: "50 Okul", revenue: "₺6M Yıllık Gelir", highlight: true },
  { id: "t100", schools: "100 Okul", revenue: "₺12M Yıllık Gelir" },
];
