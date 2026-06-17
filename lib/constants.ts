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
  { id: "okullar", label: "Okullar", href: "/okullar", icon: School },
  { id: "ogrenciler", label: "Öğrenciler", href: "/ogrenciler", icon: GraduationCap },
  { id: "veliler", label: "Veliler", href: "/veliler", icon: Users },
  { id: "mesajlar", label: "Mesajlar", href: "/mesajlar", icon: MessageSquare },
  { id: "yapay-zeka", label: "Yapay Zeka", href: "/yapay-zeka", icon: Sparkles },
  { id: "ayarlar", label: "Ayarlar", href: "/ayarlar", icon: Settings },
];

/** Mobil alt navigasyonda gösterilecek öncelikli öğeler. */
export const mobileNavigationItems: NavigationItem[] = navigationItems.filter(
  (item) =>
    ["genel-bakis", "okullar", "mesajlar", "yapay-zeka", "ayarlar"].includes(
      item.id,
    ),
);

/** Geriye dönük uyumluluk için site bilgisi. */
export const SITE = {
  name: productName,
  title: productName,
  tagline,
  description,
} as const;
