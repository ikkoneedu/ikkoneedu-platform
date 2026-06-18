/**
 * ikkoneedu — Kurucu Okul (founder-school) sayfası için mock veriler.
 * Yalnızca kurumsal tanıtım amaçlıdır; backend/ödeme bağlantısı yoktur.
 */

import {
  FlaskConical,
  Building2,
  Wrench,
  Trophy,
  Languages,
  Lightbulb,
  GraduationCap,
  Heart,
  Bot,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface FounderCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/* ------------------------------ Kurucu Okul Nedir? ------------------------ */
export const founderBenefits: FounderCard[] = [
  { id: "ilk-uygulama", title: "İlk Uygulama Merkezi", description: "Platform, gerçek okul ortamında ilk kez İngiliz Kültür Kolejleri'nde hayata geçti.", icon: FlaskConical },
  { id: "pilot", title: "Pilot Kampüs", description: "Yeni özellikler önce burada test edilir, sahadan gelen geri bildirimle olgunlaşır.", icon: Building2 },
  { id: "urun-ortak", title: "Ürün Geliştirme Ortağı", description: "Eğitim uzmanlığı, ürün yol haritasını gerçek ihtiyaçlar üzerinden şekillendirir.", icon: Wrench },
  { id: "lider", title: "Eğitim Teknolojileri Lideri", description: "Dijital dönüşümde öncü konum, sektöre referans bir model sunar.", icon: Trophy },
];

/* ------------------------------ Neden IKC? -------------------------------- */
export const whyIkc: FounderCard[] = [
  { id: "cift-dilli", title: "Çift Dilli Eğitim Modeli", description: "Güçlü dil eğitimi, küresel standartlarda bir öğrenme deneyimi sunar.", icon: Languages },
  { id: "inovasyon", title: "Teknoloji ve İnovasyon Kültürü", description: "Yeniliğe açık kurumsal yapı, dijital dönüşümü hızlandırır.", icon: Lightbulb },
  { id: "akademik", title: "Güçlü Akademik Yapı", description: "Köklü akademik birikim, platformun temelini sağlamlaştırır.", icon: GraduationCap },
  { id: "ogrenci-merkezli", title: "Öğrenci Merkezli Yaklaşım", description: "Her kararın merkezinde öğrenci başarısı ve gelişimi vardır.", icon: Heart },
  { id: "ai-vizyon", title: "Yapay Zeka Vizyonu", description: "Eğitimde yapay zekanın dönüştürücü gücüne olan inanç.", icon: Bot },
  { id: "surekli-gelisim", title: "Sürekli Gelişim Anlayışı", description: "Sürekli iyileştirme kültürü, platformun büyümesini besler.", icon: TrendingUp },
];

/* ------------------------------ Zaman çizelgesi --------------------------- */
export interface TimelineItem {
  id: string;
  year: string;
  title: string;
}

export const transformationTimeline: TimelineItem[] = [
  { id: "2026", year: "2026", title: "Platformun İlk Sürümü" },
  { id: "2027", year: "2027", title: "AI Destekli Akademik Yönetim" },
  { id: "2028", year: "2028", title: "Çoklu Kampüs Yapısı" },
  { id: "2029", year: "2029", title: "Türkiye Geneli SaaS Yayılımı" },
  { id: "2030", year: "2030", title: "Uluslararası Eğitim Teknolojileri Platformu" },
];

/* ------------------------------ Ortaklık modeli --------------------------- */
export interface PartnershipColumn {
  id: string;
  name: string;
  role: string;
  items: string[];
  icon: LucideIcon;
}

export const partnershipModel: PartnershipColumn[] = [
  {
    id: "ikc",
    name: "İngiliz Kültür Kolejleri",
    role: "Eğitim Ortağı",
    items: ["Kurucu Okul", "Referans Kurum", "Pilot Kampüs", "Eğitim Danışmanı"],
    icon: GraduationCap,
  },
  {
    id: "ikkoneedu",
    name: "ikkoneedu",
    role: "Teknoloji Ortağı",
    items: ["Teknoloji Geliştirme", "Ürün Yönetimi", "Yapay Zeka Altyapısı", "SaaS Operasyonları"],
    icon: Bot,
  },
];

/* ------------------------------ Gelir paylaşımı --------------------------- */
export interface FounderRevenueShare {
  ownerPercent: number;
  partnerPercent: number;
  ownerLabel: string;
  partnerLabel: string;
  scenarioLabel: string;
  totalYearly: string;
  ownerShare: string;
  partnerShare: string;
}

export const founderRevenueShare: FounderRevenueShare = {
  ownerPercent: 70,
  partnerPercent: 30,
  ownerLabel: "Platform Geliştiricisi",
  partnerLabel: "İngiliz Kültür Kolejleri",
  scenarioLabel: "50 Okul",
  totalYearly: "₺8.940.000",
  ownerShare: "₺6.258.000",
  partnerShare: "₺2.682.000",
};

/* ------------------------------ Vizyon metrikleri ------------------------- */
export interface VisionMetric {
  id: string;
  schools: string;
  yearly: string;
  highlight?: boolean;
}

export const founderVisionMetrics: VisionMetric[] = [
  { id: "v10", schools: "10 Okul", yearly: "₺1.788.000 / yıl" },
  { id: "v25", schools: "25 Okul", yearly: "₺4.470.000 / yıl" },
  { id: "v50", schools: "50 Okul", yearly: "₺8.940.000 / yıl", highlight: true },
  { id: "v100", schools: "100 Okul", yearly: "₺17.880.000 / yıl" },
];
