/**
 * ikkoneedu — AI Kayıt Danışmanı için mock veriler.
 * Yalnızca arayüz içindir; gerçek AI / CRM / randevu sistemi yoktur.
 */

import {
  CalendarPlus,
  UserPlus,
  MessageCircle,
  Mail,
  FileText,
  Clock,
  Building2,
  UserCheck,
  Bell,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Chat ------------------------------------- */

export interface AdmissionsMessage {
  id: number;
  role: "candidate" | "advisor";
  text: string;
}

export const admissionsChat: AdmissionsMessage[] = [
  { id: 0, role: "candidate", text: "Anaokulu için bilgi almak istiyorum." },
  { id: 1, role: "advisor", text: "Memnuniyetle yardımcı olurum. Çocuğunuzun yaşı kaç ve hangi lokasyonda okul arıyorsunuz?" },
  { id: 2, role: "candidate", text: "5 yaşında, Batıkent civarı." },
  { id: 3, role: "advisor", text: "İngiliz Kültür Kolejleri anaokulu programı 5 yaş grubu için uygundur. İsterseniz size uygun bir tanıtım randevusu oluşturabiliriz." },
];

export const admissionsChatActions = [
  "Randevu Oluştur",
  "Eğitim Programını Gör",
  "Okulu Ara",
];

/* ------------------------------ Funnel ------------------------------------ */

export interface AdmissionsFunnelStage {
  id: string;
  label: string;
  value: number;
}

export const admissionsFunnel: AdmissionsFunnelStage[] = [
  { id: "ziyaretci", label: "Web Ziyaretçisi", value: 8420 },
  { id: "ai", label: "AI ile Görüşen", value: 1260 },
  { id: "randevu", label: "Randevu Alan", value: 386 },
  { id: "ziyaret", label: "Okulu Ziyaret Eden", value: 124 },
  { id: "kayit", label: "Kayıta Dönüşen", value: 82 },
];

/* ------------------------------ Aday veliler ------------------------------ */

export type LeadPriority = "Sıcak Lead" | "Randevu Bekliyor" | "Bilgi Talebi";

export interface CandidateParent {
  id: string;
  name: string;
  childAge: string;
  level: string;
  location: string;
  budget: string;
  appointment: string;
  priority: LeadPriority;
}

export const candidateParents: CandidateParent[] = [
  { id: "elif", name: "Elif Demir", childAge: "5 yaş", level: "Anaokulu", location: "Batıkent", budget: "Orta-Üst", appointment: "Onaylandı", priority: "Sıcak Lead" },
  { id: "murat", name: "Murat Kaya", childAge: "6 yaş", level: "1. Sınıf", location: "Çayyolu", budget: "Üst", appointment: "Bekliyor", priority: "Randevu Bekliyor" },
  { id: "zeynep", name: "Zeynep Arslan", childAge: "11 yaş", level: "Ortaokul", location: "Merkez", budget: "Orta", appointment: "—", priority: "Bilgi Talebi" },
];

/* ------------------------------ Randevu asistanı -------------------------- */

export interface AppointmentField {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const appointmentFields: AppointmentField[] = [
  { id: "gun", label: "Uygun Gün", value: "Çarşamba, 24 Haziran", icon: CalendarPlus },
  { id: "saat", label: "Uygun Saat", value: "14:00 önerildi", icon: Clock },
  { id: "kampus", label: "Kampüs", value: "Batıkent Kampüs", icon: Building2 },
  { id: "danisman", label: "Danışman Atama", value: "Ayşe Yılmaz", icon: UserCheck },
  { id: "hatirlatma", label: "Hatırlatma Bildirimi", value: "SMS + E-posta", icon: Bell },
];

/* ------------------------------ SSS -------------------------------------- */

export const admissionsFaq: string[] = [
  "Anaokulu kaç yaştan itibaren?",
  "Yemekler alerjiye uygun mu?",
  "İngilizce eğitim nasıl ilerliyor?",
  "Servis var mı?",
  "Yaz okulu var mı?",
  "Kontenjan durumu nedir?",
  "Randevu nasıl alabilirim?",
];

/* ------------------------------ AI içgörüleri ----------------------------- */

export const admissionsInsights: string[] = [
  "Anaokulu talepleri bu hafta %18 arttı.",
  "Batıkent lokasyonundan gelen aday veliler daha yüksek dönüşüm sağlıyor.",
  "Randevu alan velilerin %64'ü 48 saat içinde okul ziyareti gerçekleştiriyor.",
  "\"İngilizce eğitim\" sorusu en çok sorulan kayıt sorusu oldu.",
];

/* ------------------------------ Lead alanları ----------------------------- */

export interface LeadField {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "textarea";
  options?: string[];
}

export const leadFields: LeadField[] = [
  { id: "kaynak", label: "Lead Kaynağı", type: "select", options: ["Web Sitesi", "AI Danışman", "Sosyal Medya", "Tavsiye", "Reklam"] },
  { id: "kademe", label: "İlgilendiği Kademe", type: "select", options: ["Anaokulu", "İlkokul", "Ortaokul", "Lise"] },
  { id: "randevu", label: "Randevu Tarihi", type: "date" },
  { id: "durum", label: "Kayıt Durumu", type: "select", options: ["Yeni", "Görüşüldü", "Randevu", "Kayıt", "Kaybedildi"] },
  { id: "sorumlu", label: "Takip Sorumlusu", type: "select", options: ["Ayşe Yılmaz", "Mehmet Demir", "Satış Ekibi"] },
  { id: "notlar", label: "Görüşme Notları", type: "textarea" },
];

/* ------------------------------ Hızlı aksiyonlar -------------------------- */

export interface AdmissionsAction {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const admissionsActions: AdmissionsAction[] = [
  { id: "lead", label: "Yeni Lead Ekle", icon: UserPlus },
  { id: "randevu", label: "Randevu Oluştur", icon: CalendarPlus },
  { id: "whatsapp", label: "WhatsApp Mesajı Hazırla", icon: MessageCircle },
  { id: "eposta", label: "Veliye E-posta Taslağı Oluştur", icon: Mail },
  { id: "rapor", label: "Kayıt Raporu Al", icon: FileText },
];
