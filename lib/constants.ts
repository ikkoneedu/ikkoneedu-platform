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
  { id: "okullar", label: "Okullar", href: "/school-select", icon: School },
  { id: "ogrenciler", label: "Öğrenciler", href: "/student", icon: GraduationCap },
  { id: "veliler", label: "Veliler", href: "/parent", icon: Users },
  { id: "mesajlar", label: "Mesajlar", href: "/demo", icon: MessageSquare },
  { id: "yapay-zeka", label: "Yapay Zeka", href: "/features", icon: Sparkles },
  { id: "ayarlar", label: "Ayarlar", href: "/admin", icon: Settings },
  { id: "executive", label: "Executive", href: "/executive", icon: BarChart3 },
  { id: "kayit-danismani", label: "AI Kayıt Danışmanı", href: "/admissions-ai", icon: UserPlus },
  { id: "super-admin", label: "Super Admin", href: "/super-admin", icon: ShieldCheck },
];

/** Mobil alt navigasyonda gösterilecek öncelikli öğeler. */
export const mobileNavigationItems: NavigationItem[] = navigationItems.filter(
  (item) =>
    ["genel-bakis", "okullar", "executive", "super-admin"].includes(item.id),
);

/** Yönetim paneli (/admin) kenar çubuğu menüsü. */
export const adminNavigationItems: NavigationItem[] = [
  { id: "panel", label: "Panel", href: "#", icon: LayoutDashboard },
  { id: "akademik", label: "Akademik", href: "#", icon: BookOpen },
  { id: "ai-zekasi", label: "AI Zekası", href: "#", icon: Brain },
  { id: "takvim", label: "Takvim", href: "#", icon: CalendarDays },
  { id: "analizler", label: "Analizler", href: "#", icon: BarChart3 },
  { id: "yonetim", label: "Yönetim", href: "/admin", icon: Settings },
];

/** Yönetim paneli mobil alt navigasyonu. */
export const adminMobileNavItems: NavigationItem[] = [
  { id: "ana-sayfa", label: "Ana Sayfa", href: "#", icon: Home },
  { id: "ai-brain", label: "AI Brain", href: "#", icon: Bot },
  { id: "takvim", label: "Takvim", href: "/admin", icon: CalendarDays },
  { id: "mesajlar", label: "Mesajlar", href: "#", icon: MessageSquare },
  { id: "profil", label: "Profil", href: "#", icon: User },
];

/** Yönetim paneli üst çubuk orta bağlantıları. */
export const adminTopbarLinks = [
  { id: "kampus", label: "Kampüs Seçimi", href: "#" },
  { id: "duyurular", label: "Duyurular", href: "#" },
] as const;

/** Geriye dönük uyumluluk için site bilgisi. */
export const SITE = {
  name: productName,
  title: productName,
  tagline,
  description,
} as const;
