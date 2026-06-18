/**
 * ikkoneedu — Platform Özellikleri sayfası için mock içerik.
 * Yalnızca tanıtım amaçlıdır; backend/API bağlantısı yoktur.
 */

import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Heart,
  Building2,
  GraduationCap,
  TrendingUp,
  Award,
  LineChart,
  Bot,
  Megaphone,
  UtensilsCrossed,
  Bus,
  MessageSquare,
  Sparkles,
  ClipboardCheck,
  FilePlus,
  CalendarDays,
  PenLine,
  Wand2,
  FileText,
  CalendarRange,
  UserPlus,
  LifeBuoy,
  Network,
  Boxes,
  Globe,
  Cpu,
  FileCheck,
  ShieldCheck,
  Lock,
  KeyRound,
  History,
  type LucideIcon,
} from "lucide-react";

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/* ------------------------------ Yönetim ----------------------------------- */
export const managementFeatures: FeatureItem[] = [
  { id: "panel", title: "Yönetim Paneli", description: "Tüm kampüsü tek ekrandan yöneten stratejik gösterge paneli.", icon: LayoutDashboard },
  { id: "kayit", title: "Kayıt Analitiği", description: "Kayıt trendlerini ve doluluk oranlarını gerçek zamanlı izleyin.", icon: BarChart3 },
  { id: "finans", title: "Finans Takibi", description: "Gelir, tahsilat ve bütçe süreçlerini şeffaf şekilde yönetin.", icon: Wallet },
  { id: "memnuniyet", title: "Veli Memnuniyeti", description: "Memnuniyet ölçümleri ve geri bildirim analizleri.", icon: Heart },
  { id: "kampus", title: "Kampüs Yönetimi", description: "Çok kampüslü yapıları merkezi olarak organize edin.", icon: Building2 },
];

/* ------------------------------ Öğrenci ----------------------------------- */
export const studentFeatures: FeatureItem[] = [
  { id: "portal", title: "Öğrenci Portalı", description: "Ders, ödev ve duyurulara tek noktadan erişim.", icon: GraduationCap },
  { id: "basari", title: "Başarı Takibi", description: "Akademik ilerlemeyi görsel ve anlaşılır şekilde izleyin.", icon: TrendingUp },
  { id: "rozet", title: "Rozet Sistemi", description: "Motivasyonu artıran oyunlaştırılmış başarı rozetleri.", icon: Award },
  { id: "performans", title: "Akademik Performans", description: "Ders bazlı performans grafikleri ve gelişim trendi.", icon: LineChart },
  { id: "koc", title: "AI Ders Koçu", description: "Kişiselleştirilmiş çalışma önerileri sunan yapay zeka koçu.", icon: Bot },
];

/* ------------------------------ Veli -------------------------------------- */
export const parentFeatures: FeatureItem[] = [
  { id: "duyuru", title: "Duyurular", description: "Okuldan gelen tüm bilgilendirmeler anlık olarak elinizde.", icon: Megaphone },
  { id: "yemek", title: "Yemek Listesi", description: "Günlük menü ve alerjen bilgilerine kolay erişim.", icon: UtensilsCrossed },
  { id: "servis", title: "Servis Takibi", description: "Servis konumu ve tahmini varış süresini canlı izleyin.", icon: Bus },
  { id: "mesaj", title: "Mesajlaşma", description: "Öğretmen ve rehberlikle güvenli, hızlı iletişim.", icon: MessageSquare },
  { id: "asistan", title: "AI Veli Asistanı", description: "Okul süreçleri hakkında 7/24 yapay zeka desteği.", icon: Sparkles },
];

/* ------------------------------ Öğretmen ---------------------------------- */
export const teacherFeatures: FeatureItem[] = [
  { id: "yoklama", title: "Yoklama", description: "Dijital yoklama ile hızlı ve hatasız devam takibi.", icon: ClipboardCheck },
  { id: "odev", title: "Ödev Yönetimi", description: "Ödev verme, takip ve değerlendirmeyi tek yerden yapın.", icon: FilePlus },
  { id: "ders-plani", title: "AI Ders Planı", description: "Kazanımlara uygun haftalık ders planları saniyeler içinde.", icon: CalendarDays },
  { id: "karne", title: "AI Karne Yorumu", description: "Öğrenciye özel, gelişim odaklı karne yorumları.", icon: PenLine },
  { id: "icerik", title: "AI İçerik Üretimi", description: "Çalışma kağıdı, sınav ve etkinlik içerikleri üretin.", icon: Wand2 },
];

/* ------------------------------ Yapay Zeka -------------------------------- */
export const aiFeatures: FeatureItem[] = [
  { id: "brain", title: "AI Brain", description: "Okulun kurumsal hafızasını yöneten merkezi yapay zeka beyni.", icon: Bot },
  { id: "sinav", title: "AI Sınav Oluşturucu", description: "Kazanımlara uygun sınav, quiz ve çalışma kağıtları üretir.", icon: FileText },
  { id: "program", title: "AI Ders Programı", description: "Çakışmasız, optimize haftalık ders programları oluşturur.", icon: CalendarRange },
  { id: "karne", title: "AI Karne Asistanı", description: "Profesyonel ve pozitif karne yorumları hazırlar.", icon: ClipboardCheck },
  { id: "kayit", title: "AI Kayıt Danışmanı", description: "Yeni kayıt sürecini akıllı önerilerle yönlendirir.", icon: UserPlus },
  { id: "rehberlik", title: "AI Rehberlik Asistanı", description: "Öğrenci rehberliğinde 7/24 yapay zeka desteği.", icon: LifeBuoy },
];

/* ------------------------------ SaaS -------------------------------------- */
export const saasFeatures: FeatureItem[] = [
  { id: "coklu", title: "Çoklu Okul Yönetimi", description: "Yüzlerce okulu tek platformdan merkezi olarak yönetin.", icon: Network },
  { id: "tenant", title: "Tenant Sistemi", description: "Kurumlar arası izole, güvenli çoklu kiracı mimarisi.", icon: Boxes },
  { id: "domain", title: "Özel Alan Adı", description: "Her kuruma özel okuladi.ikkoneedu.com alan adı.", icon: Globe },
  { id: "merkezi", title: "Merkezi Yönetim", description: "Abonelik, lisans ve kullanıcıları tek panelden yönetin.", icon: LayoutDashboard },
  { id: "ai-altyapi", title: "Merkezi AI Altyapısı", description: "Tüm kurumlar için ortak, ölçeklenebilir yapay zeka altyapısı.", icon: Cpu },
];

/* ------------------------------ Güvenlik ---------------------------------- */
export const securityFeatures: FeatureItem[] = [
  { id: "kvkk", title: "KVKK Uyumu", description: "Kişisel verilerin korunmasına tam uyumlu mimari.", icon: FileCheck },
  { id: "rol", title: "Rol Bazlı Yetkilendirme", description: "Veli, öğrenci, öğretmen ve yönetici için ayrı erişim seviyeleri.", icon: ShieldCheck },
  { id: "veri", title: "Veri Güvenliği", description: "Kurumsal düzeyde izole ve korumalı veri yönetimi.", icon: Lock },
  { id: "sifreleme", title: "Şifreleme", description: "Aktarımda ve depolamada uçtan uca şifreleme.", icon: KeyRound },
  { id: "loglama", title: "Loglama", description: "Tüm kritik işlemlerin denetlenebilir kayıt altına alınması.", icon: History },
];
