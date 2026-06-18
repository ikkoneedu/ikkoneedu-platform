/**
 * ikkoneedu — Message Center için mock veriler.
 * Yalnızca arayüz içindir; gerçek SMS / e-posta / WhatsApp / FCM yoktur.
 */

import {
  MessageSquare,
  Eye,
  Clock,
  BellRing,
  Smartphone,
  Send,
  MessagesSquare,
  Megaphone,
  Bell,
  Mail,
  MessageCircle,
  CalendarCheck,
  Sparkles,
  CreditCard,
  AlertTriangle,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Metrikler --------------------------------- */

export interface CommunicationMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const communicationMetrics: CommunicationMetric[] = [
  { id: "toplam", label: "Toplam Mesaj", value: "12.840", icon: MessageSquare },
  { id: "okunma", label: "Okunma Oranı", value: "%91", icon: Eye },
  { id: "bekleyen", label: "Bekleyen Yanıt", value: "48", icon: Clock },
  { id: "bildirim", label: "Gönderilen Bildirim", value: "3.260", icon: BellRing },
  { id: "sms", label: "SMS Kullanımı", value: "1.420", icon: Smartphone },
  { id: "push", label: "Push Bildirim", value: "5.880", icon: Send },
];

/* ------------------------------ Kanallar ---------------------------------- */

export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const channels: Channel[] = [
  { id: "mesaj", name: "Okul İçi Mesaj", description: "Veli, öğretmen ve öğrencilerle uygulama içi mesajlaşma.", icon: MessagesSquare },
  { id: "duyuru", name: "Duyuru", description: "Tüm okula veya gruba toplu bilgilendirme.", icon: Megaphone },
  { id: "push", name: "Push Bildirim", description: "Mobil uygulamaya anlık bildirim gönderimi.", icon: Bell },
  { id: "sms", name: "SMS", description: "Kısa mesajla hızlı ve garantili erişim.", icon: Smartphone },
  { id: "eposta", name: "E-posta", description: "Detaylı, resmi ve arşivlenebilir iletişim.", icon: Mail },
  { id: "whatsapp", name: "WhatsApp Taslağı", description: "Aday veli ve veli iletişimi için mesaj taslağı.", icon: MessageCircle },
];

/* ------------------------------ Mesaj oluşturucu seçenekleri -------------- */

export const composerOptions = {
  recipientGroups: ["Tüm Veliler", "Belirli Sınıf", "Öğretmenler", "Öğrenciler", "Kayıt Adayları"],
  classes: ["5A", "5B", "6A", "7A", "8B", "Tüm Kademeler"],
  channels: ["Okul İçi Mesaj", "Duyuru", "Push Bildirim", "SMS", "E-posta", "WhatsApp"],
  schedule: ["Hemen Gönder", "Zamanla"],
};

/* ------------------------------ AI komutları ------------------------------ */

export const aiPromptSuggestions: string[] = [
  "23 Nisan veli duyurusu hazırla",
  "Yaz okulu kayıt hatırlatması yaz",
  "Veli toplantısı SMS metni oluştur",
  "Devamsızlık bilgilendirme mesajı hazırla",
  "Kayıt adayına WhatsApp mesajı yaz",
];

/* ------------------------------ Gelen kutusu ------------------------------ */

export interface InboxMessage {
  id: string;
  sender: string;
  preview: string;
  channel: string;
  time: string;
  unread: boolean;
}

export const inboxMessages: InboxMessage[] = [
  { id: "i1", sender: "Ayşe Demir Velisi", preview: "Defne'nin İngilizce gelişimi hakkında konuşabilir miyiz?", channel: "Mesaj", time: "10 dk önce", unread: true },
  { id: "i2", sender: "5A Sınıf Grubu", preview: "Yarınki gezi için izin formları toplanıyor.", channel: "Duyuru", time: "1 saat önce", unread: true },
  { id: "i3", sender: "İngilizce Öğretmeni", preview: "Kelime testi sonuçları paylaşıldı.", channel: "Mesaj", time: "3 saat önce", unread: false },
  { id: "i4", sender: "Kayıt Adayı: Zeynep Arslan", preview: "Ortaokul kontenjanı hakkında bilgi almak istiyorum.", channel: "WhatsApp", time: "Dün", unread: true },
  { id: "i5", sender: "Rehberlik Birimi", preview: "Görüşme talebiniz onaylandı.", channel: "E-posta", time: "2 gün önce", unread: false },
];

/* ------------------------------ Gönderim geçmişi -------------------------- */

export interface SentMessage {
  id: string;
  title: string;
  channel: string;
  audience: string;
  date: string;
  readRate: string;
  status: "Gönderildi" | "Zamanlandı" | "Taslak";
}

export const sentMessages: SentMessage[] = [
  { id: "s1", title: "Veli Toplantısı Hatırlatması", channel: "Push", audience: "5A Velileri", date: "18 Haz", readRate: "%94", status: "Gönderildi" },
  { id: "s2", title: "Yaz Okulu Ön Kayıt", channel: "SMS", audience: "Aday Veliler", date: "16 Haz", readRate: "%72", status: "Gönderildi" },
  { id: "s3", title: "23 Nisan Programı", channel: "E-posta", audience: "Tüm Veliler", date: "15 Haz", readRate: "%88", status: "Gönderildi" },
  { id: "s4", title: "Dönem Sonu Bilgilendirmesi", channel: "Duyuru", audience: "Tüm Veliler", date: "22 Haz", readRate: "—", status: "Zamanlandı" },
];

/* ------------------------------ Şablonlar --------------------------------- */

export interface MessageTemplate {
  id: string;
  name: string;
  purpose: string;
  icon: LucideIcon;
}

export const messageTemplates: MessageTemplate[] = [
  { id: "toplanti", name: "Veli Toplantısı", purpose: "Toplantı tarih ve saat bilgilendirmesi.", icon: CalendarCheck },
  { id: "etkinlik", name: "Etkinlik Duyurusu", purpose: "Okul etkinliklerinin duyurulması.", icon: Megaphone },
  { id: "kayit", name: "Kayıt Hatırlatması", purpose: "Aday velilere kayıt süreci hatırlatma.", icon: UserPlus },
  { id: "devamsizlik", name: "Devamsızlık Bilgilendirmesi", purpose: "Veliye günlük devamsızlık bildirimi.", icon: AlertTriangle },
  { id: "odeme", name: "Ödeme Hatırlatması", purpose: "Yaklaşan ödeme tarihi hatırlatması.", icon: CreditCard },
  { id: "acil", name: "Acil Duyuru", purpose: "Hava/güvenlik gibi acil bilgilendirmeler.", icon: Bell },
];

/* ------------------------------ Bildirim hazırlığı ------------------------ */

export const notificationReadiness: string[] = [
  "Firebase Cloud Messaging hazır olacak.",
  "Mobil uygulama tokenları toplanacak.",
  "Kullanıcı rolüne göre bildirim gönderilecek.",
  "Okundu / okunmadı durumu takip edilecek.",
  "Toplu gönderimler Cloud Function ile yapılacak.",
];

/* ------------------------------ İletişim analitiği ------------------------ */

export interface ChannelReadRate {
  channel: string;
  rate: number;
}

export interface CommunicationAnalytics {
  channelReadRates: ChannelReadRate[];
  mostUsedChannel: string;
  fastestChannel: string;
  weeklyVolume: string;
}

export const communicationAnalytics: CommunicationAnalytics = {
  channelReadRates: [
    { channel: "Push", rate: 94 },
    { channel: "SMS", rate: 88 },
    { channel: "E-posta", rate: 76 },
    { channel: "WhatsApp", rate: 82 },
    { channel: "Duyuru", rate: 91 },
  ],
  mostUsedChannel: "Push Bildirim",
  fastestChannel: "WhatsApp",
  weeklyVolume: "1.860 gönderim",
};

/* AI asistan ikonu */
export const AiAssistantIcon: LucideIcon = Sparkles;
