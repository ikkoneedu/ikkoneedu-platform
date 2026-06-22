/**
 * ikkoneedu — Uygulama genelinde kullanılan sabitler.
 * Ürün bilgisi, tasarım sistemi renkleri ve navigasyon tek kaynaktan yönetilir.
 */

import {
  LayoutDashboard,
  School,
  GraduationCap,
  Users,
  MessageSquare,
  Sparkles,
  Settings,
  BookOpen,
  Brain,
  CalendarDays,
  BarChart3,
  Home,
  Bot,
  User,
  ShieldCheck,
  UserPlus,
  Contact,
  Bell,
  Rocket,
  ClipboardPen,
  HeartHandshake,
  Wallet,
  Award,
  type LucideIcon,
} from "lucide-react";

export const productName = "ikkoneedu";
export const productFullName = "One Network Education Operating System";
export const tagline =
  "Dünyanın Dili Seninle. Geleceğin Teknolojisi Bizimle.";
export const description =
  "Okul yönetimi, veli iletişimi, öğrenci deneyimi ve yapay zekayı tek platformda birleştiren yeni nesil eğitim teknolojileri ekosistemi.";

/** Ürün kimliği — geniş kullanım için toplu nesne. */
export const PRODUCT = {
  name: productName,
  fullName: productFullName,
  tagline,
  description,
} as const;

/**
 * Tasarım sistemi renk paleti.
 * Tailwind config ile senkron tutulur (tek doğruluk kaynağı).
 */
export const colors = {
  background: "#050C16",
  surface: "#121316",
  navy: "#0A2342",
  brand: "#D62839",
  accent: "#B2C7EF",
  text: "#E3E2E5",
  mutedText: "#C4C6CF",
  border: "rgba(255, 255, 255, 0.1)",
} as const;

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

/** Ana navigasyon öğeleri — sidebar, topbar ve mobil menüde ortak kullanılır. */
export const navigationItems: NavigationItem[] = [
  { id: "genel-bakis", label: "Genel Bakış", href: "/", icon: LayoutDashboard },
  { id: "admin", label: "Yönetim Paneli", href: "/admin", icon: LayoutDashboard },
  { id: "personel", label: "Personel ve Kullanıcılar", href: "/admin/users", icon: UserPlus },
  { id: "okul-kayitlari", label: "Öğrenci · Veli · Öğretmen", href: "/admin/records", icon: GraduationCap },
  { id: "ders-programi", label: "Ders Programı ve Sınıflar", href: "/admin/timetable", icon: CalendarDays },
  { id: "executive", label: "Executive", href: "/executive", icon: BarChart3 },
  { id: "okullar", label: "Okullar", href: "/school-select", icon: School },
  { id: "ogrenciler", label: "Öğrenciler", href: "/student", icon: GraduationCap },
  { id: "veliler", label: "Veliler", href: "/parent", icon: Users },
  { id: "ogretmenler", label: "Öğretmenler", href: "/teacher", icon: BookOpen },
  { id: "siniflarim", label: "Sınıflarım ve Kodlar", href: "/teacher/classes", icon: School },
  { id: "yapay-zeka", label: "AI Brain", href: "/ai-brain", icon: Sparkles },
  { id: "kayit-danismani", label: "AI Kayıt Danışmanı", href: "/admissions-ai", icon: UserPlus },
  { id: "bursluluk", label: "Bursluluk Sınavı", href: "/scholarship-exam", icon: Award },
  { id: "karne-asistani", label: "AI Karne Asistanı", href: "/report-card-ai", icon: ClipboardPen },
  { id: "rehberlik", label: "Rehberlik Merkezi", href: "/counseling", icon: HeartHandshake },
  { id: "finans", label: "Finans Merkezi", href: "/finance", icon: Wallet },
  { id: "crm", label: "CRM", href: "/crm", icon: Contact },
  { id: "messages", label: "Mesajlar", href: "/messages", icon: MessageSquare },
  { id: "bildirimler", label: "Bildirim Merkezi", href: "/notifications", icon: Bell },
  { id: "demo", label: "Demo Talep", href: "/demo", icon: Rocket },
  { id: "settings", label: "Ayarlar", href: "/settings", icon: Settings },
  { id: "super-admin", label: "Super Admin", href: "/super-admin", icon: ShieldCheck },
];

/** Mobil alt navigasyonda gösterilecek öncelikli öğeler. */
export const mobileNavigationItems: NavigationItem[] = navigationItems.filter(
  (item) =>
    ["genel-bakis", "okullar", "executive", "super-admin"].includes(item.id),
);

/** Yönetim paneli (/admin) kenar çubuğu menüsü. */
export const adminNavigationItems: NavigationItem[] = [
  { id: "panel", label: "Panel", href: "/admin", icon: LayoutDashboard },
  { id: "akademik", label: "Akademik", href: "/teacher", icon: BookOpen },
  { id: "okul-kayitlari", label: "Kayıtlar", href: "/admin/records", icon: GraduationCap },
  { id: "ders-programi", label: "Ders Programı", href: "/admin/timetable", icon: CalendarDays },
  { id: "ai-zekasi", label: "AI Zekası", href: "/ai-brain", icon: Brain },
  { id: "takvim", label: "Takvim", href: "/scheduler-ai", icon: CalendarDays },
  { id: "analizler", label: "Analizler", href: "/executive", icon: BarChart3 },
  { id: "yonetim", label: "Yönetim", href: "/settings", icon: Settings },
];

/** Yönetim paneli mobil alt navigasyonu. */
export const adminMobileNavItems: NavigationItem[] = [
  { id: "ana-sayfa", label: "Ana Sayfa", href: "/admin", icon: Home },
  { id: "ai-brain", label: "AI Brain", href: "/ai-brain", icon: Bot },
  { id: "takvim", label: "Takvim", href: "/scheduler-ai", icon: CalendarDays },
  { id: "mesajlar", label: "Mesajlar", href: "/messages", icon: MessageSquare },
  { id: "profil", label: "Profil", href: "/settings", icon: User },
];

/** Yönetim paneli üst çubuk orta bağlantıları. */
export const adminTopbarLinks = [
  { id: "kampus", label: "Kampüs Seçimi", href: "/school-select" },
  { id: "duyurular", label: "Duyurular", href: "/notifications" },
] as const;

/** Geriye dönük uyumluluk için site bilgisi. */
export const SITE = {
  name: productName,
  title: productName,
  tagline,
  description,
} as const;
