/**
 * ikkoneedu — Bildirim Merkezi için mock veriler.
 * Yalnızca arayüz içindir; gerçek FCM / push / SMS yoktur.
 */

import {
  Bell,
  Eye,
  CheckCircle2,
  BellOff,
  Smartphone,
  KeyRound,
  Megaphone,
  Award,
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Bus,
  UserPlus,
  UtensilsCrossed,
  FileText,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Metrikler --------------------------------- */

export interface NotificationMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const notificationMetrics: NotificationMetric[] = [
  { id: "toplam", label: "Toplam Bildirim", value: "18.420", icon: Bell },
  { id: "okunma", label: "Okunma Oranı", value: "%89", icon: Eye },
  { id: "push", label: "Push Başarı Oranı", value: "%96", icon: CheckCircle2 },
  { id: "okunmamis", label: "Okunmamış Bildirim", value: "342", icon: BellOff },
  { id: "cihaz", label: "Aktif Cihaz", value: "4.280", icon: Smartphone },
  { id: "token", label: "FCM Token", value: "3.960", icon: KeyRound },
];

/* ------------------------------ Oluşturucu seçenekleri -------------------- */

export const composerOptions = {
  recipientGroups: ["Tüm Veliler", "Öğrenciler", "Öğretmenler", "Yönetim", "Belirli Sınıf", "Belirli Okul"],
  types: ["Duyuru", "Acil", "Etkinlik", "Ödev", "Ödeme", "Servis", "Kayıt"],
  channels: ["Uygulama İçi", "Push Notification", "E-posta", "SMS"],
  schedule: ["Hemen Gönder", "Zamanla"],
};

/* ------------------------------ Bildirim türleri -------------------------- */

export interface NotificationType {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const notificationTypes: NotificationType[] = [
  { id: "duyuru", name: "Duyuru", icon: Megaphone },
  { id: "acil", name: "Acil", icon: AlertTriangle },
  { id: "etkinlik", name: "Etkinlik", icon: CalendarDays },
  { id: "odev", name: "Ödev", icon: ClipboardList },
  { id: "odeme", name: "Ödeme", icon: CreditCard },
  { id: "servis", name: "Servis", icon: Bus },
  { id: "kayit", name: "Kayıt", icon: UserPlus },
  { id: "bursluluk", name: "Bursluluk Sınavı", icon: Award },
];

/* ------------------------------ Bildirim listesi -------------------------- */

export type NotificationStatus = "Gönderildi" | "Zamanlandı" | "Taslak";

export interface NotificationRecord {
  id: string;
  title: string;
  type: string;
  audience: string;
  channel: string;
  readRate: string;
  date: string;
  status: NotificationStatus;
}

export const notificationList: NotificationRecord[] = [
  { id: "n1", title: "Veli Toplantısı Hatırlatması", type: "Duyuru", audience: "5A Velileri", channel: "Push", readRate: "%94", date: "18 Haz", status: "Gönderildi" },
  { id: "n2", title: "Servis Gecikme Bilgisi", type: "Acil", audience: "Servis Velileri", channel: "Push + SMS", readRate: "%98", date: "18 Haz", status: "Gönderildi" },
  { id: "n3", title: "Ödev Hatırlatması", type: "Ödev", audience: "7A Öğrencileri", channel: "Uygulama İçi", readRate: "%87", date: "17 Haz", status: "Gönderildi" },
  { id: "n4", title: "Yaz Okulu Kayıt Duyurusu", type: "Kayıt", audience: "Tüm Veliler", channel: "Push + E-posta", readRate: "—", date: "22 Haz", status: "Zamanlandı" },
];

/* ------------------------------ Kullanıcı tercihleri ---------------------- */

export interface UserPreference {
  id: string;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
}

export const userPreferences: UserPreference[] = [
  { id: "duyuru", label: "Duyurular", icon: Megaphone, enabled: true },
  { id: "etkinlik", label: "Etkinlikler", icon: CalendarDays, enabled: true },
  { id: "odev", label: "Ödevler", icon: ClipboardList, enabled: true },
  { id: "sinav", label: "Sınavlar", icon: FileText, enabled: true },
  { id: "servis", label: "Servis", icon: Bus, enabled: true },
  { id: "yemek", label: "Yemek Listesi", icon: UtensilsCrossed, enabled: false },
  { id: "odeme", label: "Ödeme", icon: CreditCard, enabled: true },
  { id: "acil", label: "Acil Bildirimler", icon: AlertTriangle, enabled: true },
];

/* ------------------------------ FCM mimarisi ------------------------------ */

export const fcmCollections: string[] = [
  "users/{userId}/devices/{deviceId}",
  "tenants/{tenantId}/notifications/{notificationId}",
  "tenants/{tenantId}/notificationLogs/{logId}",
  "tenants/{tenantId}/notificationPreferences/{userId}",
];

export const fcmFlow: string[] = [
  "Kullanıcı giriş yapar.",
  "Mobil veya web cihaz FCM token üretir.",
  "Token Firestore'a kaydedilir.",
  "Yönetici bildirim oluşturur.",
  "Cloud Function hedef kullanıcıları bulur.",
  "FCM ile push gönderilir.",
  "Okundu / okunmadı durumu Firestore'da tutulur.",
];

/* ------------------------------ Analitik ---------------------------------- */

export interface ChannelSuccess {
  channel: string;
  rate: number;
}

export interface DailyVolume {
  label: string;
  value: number;
}

export interface NotificationAnalytics {
  channelSuccess: ChannelSuccess[];
  dailyVolume: DailyVolume[];
  mostRead: string;
  lowestEngagement: string;
  deviceSplit: { mobile: number; web: number };
}

export const notificationAnalytics: NotificationAnalytics = {
  channelSuccess: [
    { channel: "Push", rate: 96 },
    { channel: "SMS", rate: 92 },
    { channel: "E-posta", rate: 74 },
    { channel: "Uygulama İçi", rate: 88 },
  ],
  dailyVolume: [
    { label: "Pzt", value: 320 },
    { label: "Sal", value: 410 },
    { label: "Çar", value: 380 },
    { label: "Per", value: 460 },
    { label: "Cum", value: 520 },
    { label: "Cmt", value: 180 },
    { label: "Paz", value: 140 },
  ],
  mostRead: "Acil Bildirimler",
  lowestEngagement: "Yemek Listesi",
  deviceSplit: { mobile: 72, web: 28 },
};
