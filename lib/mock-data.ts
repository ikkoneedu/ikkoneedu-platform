/**
 * ikkoneedu — Geliştirme aşaması için statik örnek veriler.
 * Backend bağlanana kadar arayüzü beslemek amacıyla kullanılır.
 */

import {
  GraduationCap,
  School,
  Users,
  Sparkles,
  UserCheck,
  MessageSquare,
  CalendarCheck,
  UserPlus,
  Brain,
  Landmark,
  Megaphone,
  Building2,
  FlaskConical,
  Plus,
  Globe,
  Network,
  ShieldCheck,
  Cpu,
  Crown,
  MonitorSmartphone,
  TrendingUp,
  BookOpen,
  LayoutDashboard,
  Bot,
  CalendarDays,
  FileText,
  ClipboardCheck,
  LifeBuoy,
  type LucideIcon,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Metrikler                                                                  */
/* -------------------------------------------------------------------------- */

export interface Metric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
}

export const metrics: Metric[] = [
  {
    id: "ogrenci",
    label: "Toplam Öğrenci",
    value: "12.480",
    delta: "+%8,2",
    trend: "up",
    icon: GraduationCap,
  },
  {
    id: "okul",
    label: "Aktif Okul",
    value: "36",
    delta: "+3",
    trend: "up",
    icon: School,
  },
  {
    id: "veli",
    label: "Bağlı Veli",
    value: "9.140",
    delta: "+%5,1",
    trend: "up",
    icon: Users,
  },
  {
    id: "ai",
    label: "Yapay Zeka Etkileşimi",
    value: "6.180",
    delta: "+%24,7",
    trend: "up",
    icon: Sparkles,
  },
];

/* -------------------------------------------------------------------------- */
/*  Aktiviteler                                                                */
/* -------------------------------------------------------------------------- */

export interface Activity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
}

export const activities: Activity[] = [
  {
    id: "a1",
    title: "Yeni okul eklendi",
    description: "İngiliz Kültür Koleji — Ataşehir kampüsü sisteme tanımlandı.",
    time: "5 dk önce",
    icon: School,
  },
  {
    id: "a2",
    title: "Veli toplantısı planlandı",
    description: "9-A sınıfı için dönem sonu görüşmeleri oluşturuldu.",
    time: "1 saat önce",
    icon: CalendarCheck,
  },
  {
    id: "a3",
    title: "Yapay zeka raporu hazır",
    description: "Haftalık öğrenci performans analizi tamamlandı.",
    time: "3 saat önce",
    icon: Sparkles,
  },
  {
    id: "a4",
    title: "Yeni mesaj akışı",
    description: "Rehberlik servisi 24 veliye duyuru gönderdi.",
    time: "Dün",
    icon: MessageSquare,
  },
];

/* -------------------------------------------------------------------------- */
/*  Okullar                                                                    */
/* -------------------------------------------------------------------------- */

export interface SchoolItem {
  id: string;
  name: string;
  city: string;
  students: number;
  status: "active" | "onboarding";
}

export const schools: SchoolItem[] = [
  { id: "s1", name: "İngiliz Kültür Koleji", city: "İstanbul", students: 1840, status: "active" },
  { id: "s2", name: "Anadolu Bilim Akademisi", city: "Ankara", students: 1260, status: "active" },
  { id: "s3", name: "Ege Final Okulları", city: "İzmir", students: 980, status: "active" },
  { id: "s4", name: "Karadeniz Eğitim Kampüsü", city: "Trabzon", students: 540, status: "onboarding" },
];

/* -------------------------------------------------------------------------- */
/*  Kullanıcı Rolleri                                                          */
/* -------------------------------------------------------------------------- */

export interface UserRole {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const userRoles: UserRole[] = [
  {
    id: "yonetici",
    name: "Yönetici",
    description: "Tüm okul ve sistem ayarlarına tam erişim.",
    icon: UserCheck,
  },
  {
    id: "ogretmen",
    name: "Öğretmen",
    description: "Sınıf, ders ve öğrenci süreçlerini yönetir.",
    icon: GraduationCap,
  },
  {
    id: "veli",
    name: "Veli",
    description: "Öğrenci gelişimini ve iletişimi takip eder.",
    icon: Users,
  },
  {
    id: "ogrenci",
    name: "Öğrenci",
    description: "Derslere, ödevlere ve yapay zeka asistanına erişir.",
    icon: Sparkles,
  },
];

/* -------------------------------------------------------------------------- */
/*  Yönetim Paneli — Metrik Kartları                                           */
/* -------------------------------------------------------------------------- */

export type AdminMetricVisual = "sparkline" | "sparkline-positive" | "capacity" | "rating";

export interface AdminMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  visual: AdminMetricVisual;
  /** Kapasite görseli için doluluk oranı (0-100). */
  capacity?: number;
  /** Puan görseli için 0-5 arası değer. */
  rating?: number;
}

export const adminMetrics: AdminMetric[] = [
  {
    id: "kayit",
    label: "Kayıt Analitiği",
    value: "1,248",
    delta: "+%12",
    trend: "up",
    icon: UserPlus,
    visual: "sparkline",
  },
  {
    id: "finans",
    label: "Finansal Durum",
    value: "₺4.2M",
    delta: "+%8",
    trend: "up",
    icon: Landmark,
    visual: "sparkline-positive",
  },
  {
    id: "ogrenci",
    label: "Öğrenci Sayısı",
    value: "8,542",
    delta: "%0",
    trend: "neutral",
    icon: GraduationCap,
    visual: "capacity",
    capacity: 85,
  },
  {
    id: "memnuniyet",
    label: "Veli Memnuniyeti",
    value: "4.8/5",
    delta: "+0.2",
    trend: "up",
    icon: Sparkles,
    visual: "rating",
    rating: 4.5,
  },
];

/* -------------------------------------------------------------------------- */
/*  Yönetim Paneli — Kampüs Performans Analizi                                 */
/* -------------------------------------------------------------------------- */

export interface CampusPerformance {
  id: string;
  /** Eksende gösterilen kısa etiket. */
  label: string;
  /** İpucu ve erişilebilirlik için tam ad. */
  fullName: string;
  /** Performans yüzdesi (0-100). */
  value: number;
  /** Öne çıkan (en yüksek) çubuğu vurgular. */
  highlight?: boolean;
}

export const campusPerformance: CampusPerformance[] = [
  { id: "a", label: "Kmp A", fullName: "Kampüs A", value: 60 },
  { id: "b", label: "Kmp B", fullName: "Kampüs B", value: 80 },
  { id: "merkez", label: "Merkez", fullName: "Merkez", value: 95, highlight: true },
  { id: "d", label: "Kmp D", fullName: "Kampüs D", value: 70 },
  { id: "e", label: "Kmp E", fullName: "Kampüs E", value: 40 },
  { id: "f", label: "Kmp F", fullName: "Kampüs F", value: 85 },
];

/* -------------------------------------------------------------------------- */
/*  Yönetim Paneli — Son Aktiviteler                                           */
/* -------------------------------------------------------------------------- */

export interface AdminActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  /** Yapay zeka kaynaklı aktiviteyi vurgular. */
  highlight?: boolean;
}

export const adminActivities: AdminActivity[] = [
  {
    id: "act-1",
    title: "Yeni Eğitmen Kaydı",
    description: "Ayşe Yılmaz (Matematik Zümresi) sisteme eklendi.",
    time: "10 dk önce",
    icon: UserPlus,
  },
  {
    id: "act-2",
    title: "AI Analiz Raporu Tamamlandı",
    description: "8. sınıflar deneme sınavı sonuçları yapay zeka tarafından analiz edildi.",
    time: "1 saat önce",
    icon: Brain,
    highlight: true,
  },
  {
    id: "act-3",
    title: "Finansal Onay Gerekli",
    description: "Q3 Laboratuvar bütçe talebi onayınızı bekliyor.",
    time: "3 saat önce",
    icon: Landmark,
  },
  {
    id: "act-4",
    title: "Sistem Güncellemesi",
    description: "V2.4 sürümü tüm kampüslerde aktif edildi.",
    time: "Dün, 14:30",
    icon: Megaphone,
  },
];

/* -------------------------------------------------------------------------- */
/*  Okul Seçimi (/school-select)                                               */
/* -------------------------------------------------------------------------- */

export interface SchoolOption {
  id: string;
  name: string;
  /** Kurum tipi (Kurucu Okul, Kampüs, Demo Ortamı, SaaS Yönetimi). */
  type: string;
  /** Aktif kullanıcı sayısı; yoksa "-" gösterilir. */
  activeUsers: string;
  icon: LucideIcon;
  actionLabel: string;
  /** Seçildiğinde yönlendirilecek rota. */
  href: string;
  /** "Yeni okul ekle" gibi vurgulu/çerçeveli kart. */
  isAddNew?: boolean;
}

export const schoolOptions: SchoolOption[] = [
  {
    id: "ikk",
    name: "İngiliz Kültür Kolejleri",
    type: "Kurucu Okul",
    activeUsers: "1,248",
    icon: GraduationCap,
    actionLabel: "Devam Et",
    href: "/admin",
  },
  {
    id: "atael",
    name: "Atael Koleji",
    type: "Kampüs",
    activeUsers: "842",
    icon: Building2,
    actionLabel: "Devam Et",
    href: "/admin",
  },
  {
    id: "demo",
    name: "Demo Okul",
    type: "Demo Ortamı",
    activeUsers: "120",
    icon: FlaskConical,
    actionLabel: "Devam Et",
    href: "/admin",
  },
  {
    id: "yeni",
    name: "Yeni Okul Ekle",
    type: "SaaS Yönetimi",
    activeUsers: "-",
    icon: Plus,
    actionLabel: "Okul Ekle",
    href: "/saas-admin",
    isAddNew: true,
  },
];

/** Tenant altyapısını anlatan açıklama kartları. */
export interface TenantFeature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const tenantFeatures: TenantFeature[] = [
  {
    id: "subdomain",
    title: "okuladi.ikkoneedu.com",
    description: "Her kuruma özel alt alan adı ile markalı erişim.",
    icon: Globe,
  },
  {
    id: "multi",
    title: "Çoklu Okul Altyapısı",
    description: "Birden fazla okul ve kampüsü tek çatı altında yönetin.",
    icon: Network,
  },
  {
    id: "tenant",
    title: "Güvenli Tenant Sistemi",
    description: "Kurumlar arası izole, güvenli veri mimarisi.",
    icon: ShieldCheck,
  },
  {
    id: "ai",
    title: "Merkezi AI Altyapısı",
    description: "Tüm kurumlar için ortak yapay zeka zekası.",
    icon: Cpu,
  },
];

/* -------------------------------------------------------------------------- */
/*  Pazarlama Sayfası (/)                                                       */
/* -------------------------------------------------------------------------- */

export interface LandingCard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Kurucu okul vurgusu kartları. */
export const founderHighlights: LandingCard[] = [
  {
    id: "avantaj",
    title: "Kurucu Okul Avantajı",
    description:
      "Platformun ilk geliştirme ortağı olarak özelliklere öncelikli erişim ve söz hakkı.",
    icon: Crown,
  },
  {
    id: "donusum",
    title: "Dijital Kampüs Dönüşümü",
    description:
      "Tüm okul süreçlerinin uçtan uca dijitalleşmesiyle modern bir kampüs deneyimi.",
    icon: MonitorSmartphone,
  },
  {
    id: "ai-yonetim",
    title: "Yapay Zeka Destekli Okul Yönetimi",
    description:
      "Karar süreçlerini hızlandıran, veri odaklı yapay zeka asistanlığı.",
    icon: Brain,
  },
  {
    id: "vizyon",
    title: "Gelecekte Gelir Üreten Platform Vizyonu",
    description:
      "Kurum içi verimliliğin ötesinde, ölçeklenebilir bir gelir modeline dönüşüm.",
    icon: TrendingUp,
  },
];

/** Tek platform, dört deneyim kartları. */
export const platformExperiences: LandingCard[] = [
  {
    id: "veli",
    title: "Veli Portalı",
    description:
      "Öğrenci gelişimi, iletişim ve ödemeler için tek dokunuşluk veli deneyimi.",
    icon: Users,
  },
  {
    id: "ogrenci",
    title: "Öğrenci Portalı",
    description:
      "Dersler, ödevler ve yapay zeka asistanıyla kişiselleştirilmiş öğrenme.",
    icon: GraduationCap,
  },
  {
    id: "ogretmen",
    title: "Öğretmen Portalı",
    description:
      "Sınıf, içerik ve değerlendirme süreçlerini kolaylaştıran akıllı araçlar.",
    icon: BookOpen,
  },
  {
    id: "yonetim",
    title: "Yönetim Paneli",
    description:
      "Tüm kampüsü tek ekrandan yöneten stratejik gösterge paneli.",
    icon: LayoutDashboard,
  },
];

/** Yapay zeka modülleri kartları. */
export const aiModules: LandingCard[] = [
  {
    id: "brain",
    title: "AI Brain",
    description: "Tüm modülleri besleyen merkezi yapay zeka zekası.",
    icon: Bot,
  },
  {
    id: "ders-programi",
    title: "AI Ders Programı",
    description: "Optimum ders ve öğretmen dağılımını saniyeler içinde oluşturur.",
    icon: CalendarDays,
  },
  {
    id: "sinav",
    title: "AI Sınav Oluşturucu",
    description: "Kazanımlara uygun sınavları otomatik hazırlar.",
    icon: FileText,
  },
  {
    id: "karne",
    title: "AI Karne Yorumu",
    description: "Öğrenciye özel, anlamlı karne değerlendirmeleri üretir.",
    icon: ClipboardCheck,
  },
  {
    id: "kayit",
    title: "AI Kayıt Danışmanı",
    description: "Yeni kayıt sürecini akıllı önerilerle yönlendirir.",
    icon: UserPlus,
  },
  {
    id: "rehberlik",
    title: "AI Rehberlik Asistanı",
    description: "Öğrenci rehberliğinde 7/24 yapay zeka desteği.",
    icon: LifeBuoy,
  },
];

/** SaaS gelir modeli kademeleri. */
export interface RevenueTier {
  id: string;
  schools: string;
  revenue: string;
  /** Öne çıkan kademe. */
  highlight?: boolean;
}

export const revenueTiers: RevenueTier[] = [
  { id: "t10", schools: "10 Okul", revenue: "1.2M TL / yıl" },
  { id: "t25", schools: "25 Okul", revenue: "3M TL / yıl" },
  { id: "t50", schools: "50 Okul", revenue: "6M TL / yıl", highlight: true },
  { id: "t100", schools: "100 Okul", revenue: "12M TL / yıl" },
];

/** Hero bölümü canlı metrik kartları. */
export const heroMetrics = [
  { id: "okul", label: "Aktif Okul", value: "36" },
  { id: "ogrenci", label: "Öğrenci", value: "12.480" },
  { id: "ai", label: "AI Etkileşimi", value: "6.180" },
] as const;

/* -------------------------------------------------------------------------- */
/*  Geriye dönük uyumluluk                                                     */
/* -------------------------------------------------------------------------- */

export interface Feature {
  id: string;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  { id: "okul-yonetimi", title: "Okul Yönetimi", description: "Sınıf, ders ve personel süreçlerini tek panelden yönetin." },
  { id: "veli-iletisimi", title: "Veli İletişimi", description: "Velilerle anlık, şeffaf ve düzenli iletişim kurun." },
  { id: "ogrenci-deneyimi", title: "Öğrenci Deneyimi", description: "Öğrencilere kişiselleştirilmiş bir öğrenme yolculuğu sunun." },
  { id: "yapay-zeka", title: "Yapay Zeka", description: "Eğitim süreçlerini yapay zeka ile akıllı hale getirin." },
];
