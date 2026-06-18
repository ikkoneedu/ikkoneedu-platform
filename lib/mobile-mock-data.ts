/**
 * ikkoneedu — Mobil Uygulama tanıtım sayfası için mock veriler.
 * Yalnızca tanıtım amaçlıdır; gerçek App Store / push bildirimi bağlantısı yoktur.
 */

import {
  Megaphone,
  UtensilsCrossed,
  Bus,
  MessageSquare,
  CalendarDays,
  Sparkles,
  BookOpen,
  ClipboardList,
  Award,
  Bot,
  CalendarClock,
  LineChart,
  ClipboardCheck,
  FilePlus,
  Wand2,
  FileText,
  PenLine,
  AlertTriangle,
  GraduationCap,
  Fingerprint,
  ShieldCheck,
  UserCog,
  Lock,
  Users,
  Bell,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Uygulama özellikleri ---------------------- */

export interface AppFeature {
  id: string;
  title: string;
  icon: LucideIcon;
}

export const parentAppFeatures: AppFeature[] = [
  { id: "duyuru", title: "Duyurular", icon: Megaphone },
  { id: "yemek", title: "Yemek Listesi", icon: UtensilsCrossed },
  { id: "servis", title: "Servis Takibi", icon: Bus },
  { id: "mesaj", title: "Öğretmen Mesajları", icon: MessageSquare },
  { id: "etkinlik", title: "Etkinlik Takvimi", icon: CalendarDays },
  { id: "asistan", title: "AI Veli Asistanı", icon: Sparkles },
];

export const studentAppFeatures: AppFeature[] = [
  { id: "program", title: "Günlük Program", icon: BookOpen },
  { id: "odev", title: "Ödev Takibi", icon: ClipboardList },
  { id: "rozet", title: "Başarı Rozetleri", icon: Award },
  { id: "koc", title: "AI Ders Koçu", icon: Bot },
  { id: "sinav", title: "Sınav Takvimi", icon: CalendarClock },
  { id: "performans", title: "Akademik Performans", icon: LineChart },
];

export const teacherAppFeatures: AppFeature[] = [
  { id: "yoklama", title: "Yoklama", icon: ClipboardCheck },
  { id: "odev", title: "Ödev Yönetimi", icon: FilePlus },
  { id: "icerik", title: "AI İçerik Üretimi", icon: Wand2 },
  { id: "plan", title: "Ders Planı", icon: CalendarDays },
  { id: "sinav", title: "Sınav Hazırlama", icon: FileText },
  { id: "karne", title: "Karne Yorumu", icon: PenLine },
];

/* ------------------------------ Önizleme ekranları ------------------------ */

export interface MobileScreen {
  id: string;
  role: string;
  title: string;
  description: string;
  /** Telefon mockup'ında gösterilecek örnek satırlar. */
  rows: string[];
}

export const mobileScreens: MobileScreen[] = [
  {
    id: "veli",
    role: "Veli",
    title: "Veli Ana Ekranı",
    description: "Duyurular, servis, yemek ve mesajlar tek dokunuşla.",
    rows: ["Bugünün Menüsü", "Servis yolda — 12 dk", "Yeni duyuru: Bahar Şenliği", "Öğretmenden mesaj"],
  },
  {
    id: "ogrenci",
    role: "Öğrenci",
    title: "Öğrenci Ana Ekranı",
    description: "Program, ödevler ve AI ders koçu cebinizde.",
    rows: ["09:00 Matematik", "Bekleyen ödev: 3", "Yeni rozet: Düzenli Öğrenci", "AI Koç: Bugün ne çalışmalıyım?"],
  },
  {
    id: "ogretmen",
    role: "Öğretmen",
    title: "Öğretmen Ana Ekranı",
    description: "Yoklama, ödev ve AI içerik üretimi elinizin altında.",
    rows: ["Bugünkü ders: 4", "Bekleyen değerlendirme: 18", "Yoklama al — 5A", "AI ile sınav oluştur"],
  },
  {
    id: "ai",
    role: "AI Brain",
    title: "AI Brain Mobil",
    description: "Okulunuzun yapay zeka beyni her an yanınızda.",
    rows: ["Yarınki etkinlikler neler?", "6. sınıf İngilizce sınavı hazırla", "Bugünkü yemek listesi nedir?", "Kaç öğrenci devamsız?"],
  },
];

/* ------------------------------ AI Brain örnekleri ------------------------ */

export const aiBrainExamples: string[] = [
  "Yarınki etkinlikler neler?",
  "6. sınıf İngilizce sınavı hazırla.",
  "Bugünkü yemek listesi nedir?",
  "Bu hafta kaç öğrenci devamsız?",
];

/* ------------------------------ Bildirimler ------------------------------- */

export interface NotificationItem {
  id: string;
  category: string;
  title: string;
  message: string;
  time: string;
  icon: LucideIcon;
  urgent?: boolean;
}

export const mobileNotifications: NotificationItem[] = [
  { id: "acil", category: "Acil Duyurular", title: "Acil Duyuru", message: "Hava koşulları nedeniyle yarın okul tatil edilmiştir.", time: "şimdi", icon: AlertTriangle, urgent: true },
  { id: "veli", category: "Veli Mesajları", title: "Yeni Mesaj", message: "Sınıf öğretmeninizden yeni bir mesajınız var.", time: "2 dk önce", icon: MessageSquare },
  { id: "etkinlik", category: "Etkinlik Hatırlatmaları", title: "Etkinlik Hatırlatması", message: "Bilim Fuarı yarın saat 10:00'da başlıyor.", time: "1 saat önce", icon: CalendarDays },
  { id: "servis", category: "Servis Bildirimleri", title: "Servis Bildirimi", message: "Servis 12 dakika sonra varış noktasında olacak.", time: "5 dk önce", icon: Bus },
  { id: "akademik", category: "Akademik Bildirimler", title: "Akademik Bildirim", message: "Matematik sınavı sonucunuz yayınlandı.", time: "3 saat önce", icon: GraduationCap },
];

/* ------------------------------ Güvenlik ---------------------------------- */

export interface SecurityItem {
  id: string;
  title: string;
  icon: LucideIcon;
}

export const mobileSecurity: SecurityItem[] = [
  { id: "biyometrik", title: "Biyometrik Giriş", icon: Fingerprint },
  { id: "kimlik", title: "Güvenli Kimlik Doğrulama", icon: ShieldCheck },
  { id: "rol", title: "Rol Bazlı Yetkilendirme", icon: UserCog },
  { id: "sifreli", title: "Şifreli Veri İletimi", icon: Lock },
];

/* ------------------------------ İstatistikler ----------------------------- */

export interface MobileMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const mobileMetrics: MobileMetric[] = [
  { id: "dau", label: "Günlük Aktif Kullanıcı", value: "9.840", icon: Users },
  { id: "bildirim", label: "Gönderilen Bildirim", value: "128.500", icon: Bell },
  { id: "ai", label: "AI Kullanımı", value: "42.300", icon: Sparkles },
  { id: "giris", label: "Mobil Giriş Sayısı", value: "21.600", icon: Smartphone },
];
