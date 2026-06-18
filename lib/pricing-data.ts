/**
 * ikkoneedu — Fiyatlandırma sayfası için mock veriler.
 * Yalnızca tanıtım amaçlıdır; gerçek ödeme/abonelik sistemi yoktur.
 */

/* ------------------------------ Paketler ---------------------------------- */

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "₺9.900",
    period: "/ ay",
    description: "Anaokulları ve küçük eğitim kurumları için.",
    features: [
      "Kurumsal web arayüzü",
      "Veli portalı",
      "Duyurular",
      "Yemek listesi",
      "Etkinlik takvimi",
      "Temel bildirimler",
      "1 okul / kampüs",
      "500 kullanıcıya kadar",
    ],
    cta: "Starter ile Başla",
    ctaHref: "/demo",
  },
  {
    id: "professional",
    name: "Professional",
    price: "₺14.900",
    period: "/ ay",
    description: "Kolejler ve K-12 okulları için.",
    badge: "En Çok Tercih Edilen",
    highlight: true,
    features: [
      "Starter'daki tüm özellikler",
      "AI Brain",
      "Öğrenci portalı",
      "Öğretmen portalı",
      "AI sınav oluşturucu",
      "AI ders programı",
      "Servis takibi",
      "Mesajlaşma merkezi",
      "Gelişmiş raporlama",
      "2 okul / kampüs",
      "2.500 kullanıcıya kadar",
    ],
    cta: "Professional ile Başla",
    ctaHref: "/demo",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₺29.900",
    period: "/ ay",
    description: "Büyük kampüsler ve zincir okullar için.",
    features: [
      "Professional'daki tüm özellikler",
      "Çoklu okul yönetimi",
      "Tenant sistemi",
      "Özel alan adı",
      "Merkezi yönetim paneli",
      "Gelişmiş AI kullanım analitiği",
      "Kurumsal destek",
      "Sınırsız kullanıcı",
      "Özel entegrasyon desteği",
    ],
    cta: "Satış Ekibiyle Görüş",
    ctaHref: "/demo",
  },
];

/* ------------------------------ Gelir potansiyeli ------------------------- */

/** Ortalama paket geliri Professional (₺14.900/ay) üzerinden hesaplanır. */
export const averageMonthlyRevenuePerSchool = 14900;

export interface RevenuePotential {
  id: string;
  schools: string;
  monthly: string;
  yearly: string;
  highlight?: boolean;
}

export const revenuePotential: RevenuePotential[] = [
  { id: "r10", schools: "10 Okul", monthly: "₺149.000 / ay", yearly: "₺1.788.000 / yıl" },
  { id: "r25", schools: "25 Okul", monthly: "₺372.500 / ay", yearly: "₺4.470.000 / yıl" },
  { id: "r50", schools: "50 Okul", monthly: "₺745.000 / ay", yearly: "₺8.940.000 / yıl", highlight: true },
  { id: "r100", schools: "100 Okul", monthly: "₺1.490.000 / ay", yearly: "₺17.880.000 / yıl" },
];

/* ------------------------------ Gelir paylaşımı --------------------------- */

export interface RevenueShare {
  ownerPercent: number;
  partnerPercent: number;
  scenarioLabel: string;
  totalYearly: string;
  ownerShare: string;
  partnerShare: string;
}

export const revenueShareModel: RevenueShare = {
  ownerPercent: 70,
  partnerPercent: 30,
  scenarioLabel: "50 okul senaryosu",
  totalYearly: "₺8.940.000",
  ownerShare: "₺6.258.000",
  partnerShare: "₺2.682.000",
};

/* ------------------------------ Karşılaştırma tablosu --------------------- */

export type ComparisonValue = boolean | string;

export interface ComparisonRow {
  label: string;
  /** [Starter, Professional, Enterprise] */
  values: [ComparisonValue, ComparisonValue, ComparisonValue];
}

export const comparisonColumns = ["Starter", "Professional", "Enterprise"];

export const comparisonRows: ComparisonRow[] = [
  { label: "Aylık Fiyat", values: ["₺9.900", "₺14.900", "₺29.900"] },
  { label: "Okul / Kampüs", values: ["1", "2", "Sınırsız"] },
  { label: "Kullanıcı", values: ["500", "2.500", "Sınırsız"] },
  { label: "Veli Portalı", values: [true, true, true] },
  { label: "Duyurular & Yemek Listesi", values: [true, true, true] },
  { label: "Öğrenci Portalı", values: [false, true, true] },
  { label: "Öğretmen Portalı", values: [false, true, true] },
  { label: "AI Brain", values: [false, true, true] },
  { label: "AI Sınav Oluşturucu", values: [false, true, true] },
  { label: "AI Ders Programı", values: [false, true, true] },
  { label: "Servis Takibi", values: [false, true, true] },
  { label: "Mesajlaşma Merkezi", values: [false, true, true] },
  { label: "Gelişmiş Raporlama", values: [false, true, true] },
  { label: "Çoklu Okul Yönetimi", values: [false, false, true] },
  { label: "Tenant Sistemi & Özel Alan Adı", values: [false, false, true] },
  { label: "Gelişmiş AI Analitiği", values: [false, false, true] },
  { label: "Kurumsal Destek", values: [false, false, true] },
  { label: "Özel Entegrasyon Desteği", values: [false, false, true] },
];

/* ------------------------------ SSS -------------------------------------- */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const pricingFaq: FaqItem[] = [
  {
    id: "gecis",
    question: "Paketler arasında geçiş yapabilir miyim?",
    answer:
      "Evet. İhtiyacınız büyüdükçe dilediğiniz zaman üst pakete yükseltebilir, dönem sonunda paketinizi değiştirebilirsiniz.",
  },
  {
    id: "kurulum",
    question: "Kurulum ücreti var mı?",
    answer:
      "Standart kurulum ve onboarding süreci paket fiyatına dahildir. Kuruma özel ek geliştirmeler ayrıca değerlendirilir.",
  },
  {
    id: "sozlesme",
    question: "Sözleşme süresi nedir?",
    answer:
      "Aylık ve yıllık abonelik seçenekleri sunulur. Yıllık aboneliklerde avantajlı fiyatlandırma uygulanır.",
  },
  {
    id: "ai-maliyet",
    question: "AI kullanım maliyeti paketlere dahil mi?",
    answer:
      "Temel AI kullanımı paketlere dahildir. Yoğun kullanım, özel model entegrasyonu veya kuruma özel gelişmiş AI altyapısı gerektiğinde ayrıca kurumsal teklif hazırlanabilir.",
  },
  {
    id: "veri",
    question: "Verilerimiz nasıl korunuyor?",
    answer:
      "Tüm veriler KVKK uyumlu, rol bazlı yetkilendirme ve şifreleme ile korunur. Kurumlar arası veri izolasyonu tenant mimarisiyle sağlanır.",
  },
];
