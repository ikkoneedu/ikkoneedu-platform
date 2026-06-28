/**
 * ikkoneedu — Uygulama genelinde kullanılan sabitler.
 * Ürün bilgisi, tasarım sistemi renkleri ve navigasyon tek kaynaktan yönetilir.
 */

import type { ModuleId } from "@/lib/modules/module-catalog";
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
  CalendarCheck,
  UtensilsCrossed,
  Bus,
  NotebookPen,
  ClipboardCheck,
  QrCode,
  ScanLine,
  ClipboardList,
  IdCard,
  CalendarClock,
  History,
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
  /** Çeviri anahtarı (nav.*) — Sidebar/MobileBottomNav t() ile çözer. */
  labelKey: string;
  href: string;
  icon: LucideIcon;
  /**
   * Opsiyonel modül bağı (lib/modules/module-catalog.ts ModuleId).
   * Sidebar modül farkındalığı için kullanılır: tanımlıysa ve modül tenant'ta
   * kilitliyse öğe "Yakında/Kilitli" rozetiyle gösterilebilir. Tanımsız öğeler
   * (genel-bakış, ayarlar, süper admin gibi) her zaman görünür.
   */
  moduleId?: ModuleId;
}

/** Ana navigasyon öğeleri — sidebar, topbar ve mobil menüde ortak kullanılır. */
export const navigationItems: NavigationItem[] = [
  { id: "genel-bakis", labelKey: "nav.overview", href: "/", icon: LayoutDashboard },
  { id: "admin", labelKey: "nav.adminPanel", href: "/admin", icon: LayoutDashboard },
  { id: "personel", labelKey: "nav.staff", href: "/admin/users", icon: UserPlus },
  { id: "okul-kayitlari", labelKey: "nav.records", href: "/admin/records", icon: GraduationCap },
  { id: "ders-programi", labelKey: "nav.timetable", href: "/admin/timetable", icon: CalendarDays },
  { id: "executive", labelKey: "nav.executive", href: "/executive", icon: BarChart3, moduleId: "reports" },
  { id: "okullar", labelKey: "nav.schools", href: "/school-select", icon: School },
  { id: "ogrenciler", labelKey: "nav.students", href: "/student", icon: GraduationCap },
  { id: "veliler", labelKey: "nav.parents", href: "/parent", icon: Users },
  { id: "ogretmenler", labelKey: "nav.teachers", href: "/teacher", icon: BookOpen },
  { id: "siniflarim", labelKey: "nav.myClasses", href: "/teacher/classes", icon: School },
  { id: "yapay-zeka", labelKey: "nav.aiBrain", href: "/ai-brain", icon: Sparkles, moduleId: "aiBrain" },
  { id: "kayit-danismani", labelKey: "nav.aiAdmissions", href: "/admissions-ai", icon: UserPlus, moduleId: "admissions" },
  { id: "bursluluk", labelKey: "nav.scholarship", href: "/scholarship-exam", icon: Award, moduleId: "exams" },
  { id: "karne-asistani", labelKey: "nav.aiReportCard", href: "/report-card-ai", icon: ClipboardPen, moduleId: "reportCardAi" },
  { id: "rehberlik", labelKey: "nav.counseling", href: "/counseling", icon: HeartHandshake, moduleId: "counseling" },
  { id: "ders-planlari", labelKey: "nav.lessonPlans", href: "/lesson-plans", icon: NotebookPen },
  { id: "etkinlikler", labelKey: "nav.events", href: "/events", icon: CalendarCheck, moduleId: "events" },
  { id: "yemek", labelKey: "nav.lunch", href: "/lunch-menu", icon: UtensilsCrossed },
  { id: "servis", labelKey: "nav.bus", href: "/bus-routes", icon: Bus },
  { id: "finans", labelKey: "nav.finance", href: "/finance", icon: Wallet, moduleId: "finance" },
  { id: "crm", labelKey: "nav.crm", href: "/crm", icon: Contact, moduleId: "admissions" },
  { id: "sosyal-studyo", labelKey: "nav.socialStudio", href: "/social-studio", icon: Sparkles, moduleId: "socialStudio" },
  { id: "ik-cv", labelKey: "nav.hiring", href: "/hiring", icon: ClipboardCheck, moduleId: "hiring" },
  { id: "sertifikalar", labelKey: "nav.certificates", href: "/certificates", icon: Award, moduleId: "certificates" },
  { id: "kimlik-kartim", labelKey: "nav.staffCard", href: "/staff-card", icon: IdCard },
  { id: "qr-kartim", labelKey: "nav.attMyQr", href: "/attendance/my-qr", icon: QrCode },
  { id: "giris-cikis-okuyucu", labelKey: "nav.attScanner", href: "/attendance/scanner", icon: ScanLine },
  { id: "giris-cikis-gecmisim", labelKey: "nav.myHistory", href: "/attendance/my-history", icon: History },
  { id: "mesai-izin", labelKey: "nav.staffSchedule", href: "/staff-schedule", icon: CalendarClock },
  { id: "giris-cikis-kayit", labelKey: "nav.attLogs", href: "/attendance/logs", icon: ClipboardList },
  { id: "messages", labelKey: "nav.messages", href: "/messages", icon: MessageSquare, moduleId: "messages" },
  { id: "bildirimler", labelKey: "nav.notifications", href: "/notifications", icon: Bell, moduleId: "notifications" },
  { id: "demo", labelKey: "nav.demo", href: "/demo", icon: Rocket },
  { id: "settings", labelKey: "nav.settings", href: "/settings", icon: Settings },
  { id: "super-admin", labelKey: "nav.superAdmin", href: "/super-admin", icon: ShieldCheck },
];

/** Mobil alt navigasyonda gösterilecek öncelikli öğeler. */
export const mobileNavigationItems: NavigationItem[] = navigationItems.filter(
  (item) =>
    ["genel-bakis", "okullar", "executive", "super-admin"].includes(item.id),
);

/** Yönetim paneli (/admin) kenar çubuğu menüsü. */
export const adminNavigationItems: NavigationItem[] = [
  { id: "panel", labelKey: "nav.panel", href: "/admin", icon: LayoutDashboard },
  { id: "akademik", labelKey: "nav.academic", href: "/teacher", icon: BookOpen },
  { id: "okul-kayitlari", labelKey: "nav.recordsShort", href: "/admin/records", icon: GraduationCap },
  { id: "ders-programi", labelKey: "nav.timetableShort", href: "/admin/timetable", icon: CalendarDays },
  { id: "ai-zekasi", labelKey: "nav.aiIntel", href: "/ai-brain", icon: Brain },
  { id: "takvim", labelKey: "nav.calendar", href: "/scheduler-ai", icon: CalendarDays },
  { id: "analizler", labelKey: "nav.analytics", href: "/executive", icon: BarChart3 },
  { id: "yonetim", labelKey: "nav.management", href: "/settings", icon: Settings },
];

/** Yönetim paneli mobil alt navigasyonu. */
export const adminMobileNavItems: NavigationItem[] = [
  { id: "ana-sayfa", labelKey: "nav.home", href: "/admin", icon: Home },
  { id: "ai-brain", labelKey: "nav.aiBrain", href: "/ai-brain", icon: Bot },
  { id: "takvim", labelKey: "nav.calendar", href: "/scheduler-ai", icon: CalendarDays },
  { id: "mesajlar", labelKey: "nav.messages", href: "/messages", icon: MessageSquare },
  { id: "profil", labelKey: "nav.profile", href: "/settings", icon: User },
];

/** Yönetim paneli üst çubuk orta bağlantıları. */
export const adminTopbarLinks = [
  { id: "kampus", labelKey: "nav.campusSelect", href: "/school-select" },
  { id: "duyurular", labelKey: "nav.announcements", href: "/notifications" },
] as const;

/** Geriye dönük uyumluluk için site bilgisi. */
export const SITE = {
  name: productName,
  title: productName,
  tagline,
  description,
} as const;
