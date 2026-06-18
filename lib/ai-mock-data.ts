/**
 * ikkoneedu — AI Brain için statik mock veriler ve gelecekteki API hazırlığı.
 *
 * ÖNEMLİ: Bu dosya yalnızca mock UI içindir. Gerçek bir AI çağrısı yapmaz,
 * API anahtarı veya ortam değişkeni içermez.
 *
 * ----------------------------------------------------------------------------
 * GELECEKTEKİ ENTEGRASYON İÇİN ÖNERİLEN SERVİS YAPISI
 * ----------------------------------------------------------------------------
 * AI Brain ileride çift sağlayıcılı (OpenAI + Anthropic Claude) bir mimariye
 * geçebilir. Aşağıdaki arayüz, UI'ı sağlayıcıdan bağımsız tutmak için önerilir:
 *
 *   // lib/ai/types.ts
 *   export type AiProvider = "openai" | "anthropic";
 *   export interface AiChatRequest {
 *     provider: AiProvider;
 *     role: "veli" | "ogrenci" | "ogretmen" | "yonetim"; // rol bazlı yetki
 *     messages: AiMessage[];
 *   }
 *   export interface AiChatResponse {
 *     message: AiMessage;
 *     usage?: { inputTokens: number; outputTokens: number };
 *   }
 *
 *   // lib/ai/service.ts  (yalnızca sunucu tarafında çalışmalı)
 *   export async function sendChat(req: AiChatRequest): Promise<AiChatResponse> {
 *     // if (req.provider === "anthropic") -> @anthropic-ai/sdk (Claude)
 *     // if (req.provider === "openai")    -> openai SDK
 *     // API anahtarları yalnızca server ortam değişkenlerinden okunmalı.
 *     // Rol bazlı erişim ve KVKK için istek/yanıtlar loglanmalı.
 *   }
 *
 * UI bileşenleri yalnızca bu sözleşmeye bağlanır; aşağıdaki getMockAiReply
 * ileride sendChat ile değiştirilebilir.
 * ----------------------------------------------------------------------------
 */

import {
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Megaphone,
  CalendarDays,
  FileText,
  PenLine,
  FileBarChart,
  ClipboardList,
  MessageSquare,
  Sparkles,
  Clock,
  ShieldCheck,
  Lock,
  FileCheck,
  History,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Chat mesajları ---------------------------- */

export interface AiMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
}

/** Sohbet panelinde başlangıçta gösterilen örnek konuşma. */
export const aiInitialMessages: AiMessage[] = [
  {
    id: 0,
    role: "user",
    text: "Bu hafta 5. sınıflar için hangi etkinlikler var?",
  },
  {
    id: 1,
    role: "assistant",
    text: "Bu hafta 5. sınıflar için Bilim Fuarı hazırlığı, İngilizce speaking çalışması ve rehberlik etkinliği planlanmıştır.",
  },
  {
    id: 2,
    role: "user",
    text: "Velilere gönderilecek 23 Nisan duyurusu hazırla.",
  },
  {
    id: 3,
    role: "assistant",
    text: "Elbette. Kurumsal ve sıcak bir dille veli bilgilendirme metni hazırlayabilirim.",
  },
];

/**
 * Mock AI yanıtı üretir (gerçek AI yoktur).
 * İleride lib/ai/service.ts içindeki sendChat ile değiştirilecektir.
 */
export function getMockAiReply(_prompt: string): string {
  return "Bu bir demo yanıtıdır. AI Brain yakında OpenAI ve Anthropic Claude entegrasyonuyla okulunuzun gerçek verilerine göre yanıt verecek.";
}

/* ------------------------------ Rol bazlı modlar -------------------------- */

export interface AiMode {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const aiModes: AiMode[] = [
  {
    id: "veli",
    title: "Veli Asistanı",
    description: "Duyurular, yemek listesi, etkinlikler ve öğrenci takibi.",
    icon: Users,
  },
  {
    id: "ogrenci",
    title: "Öğrenci Koçu",
    description: "Ödev, sınav, İngilizce pratik ve kişisel gelişim desteği.",
    icon: GraduationCap,
  },
  {
    id: "ogretmen",
    title: "Öğretmen Asistanı",
    description: "Ders planı, sınav, çalışma kağıdı ve karne yorumu desteği.",
    icon: BookOpen,
  },
  {
    id: "yonetim",
    title: "Yönetim Asistanı",
    description: "Raporlama, kayıt analitiği, veli memnuniyeti ve stratejik karar desteği.",
    icon: BarChart3,
  },
];

/* ------------------------------ Hızlı komutlar ---------------------------- */

export interface AiQuickPrompt {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const aiQuickPrompts: AiQuickPrompt[] = [
  { id: "duyuru", label: "Veli duyurusu hazırla", icon: Megaphone },
  { id: "ders-programi", label: "Ders programı oluştur", icon: CalendarDays },
  { id: "sinav", label: "Sınav sorusu üret", icon: FileText },
  { id: "karne", label: "Karne yorumu yaz", icon: PenLine },
  { id: "rapor", label: "Haftalık rapor çıkar", icon: FileBarChart },
  { id: "kayit", label: "Kayıt görüşmesi özeti hazırla", icon: ClipboardList },
];

/* ------------------------------ Kullanım metrikleri ----------------------- */

export interface AiUsageMetric {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

export const aiUsageMetrics: AiUsageMetric[] = [
  { id: "sorgu", label: "Bugünkü AI Sorgusu", value: "248", icon: MessageSquare },
  { id: "kullanici", label: "Aktif Kullanıcı", value: "86", icon: Users },
  { id: "icerik", label: "Oluşturulan İçerik", value: "42", icon: Sparkles },
  { id: "tasarruf", label: "Zaman Tasarrufu", value: "18 saat", icon: Clock },
];

/* ------------------------------ Kurumsal hafıza --------------------------- */

export const aiKnowledgeBaseItems: string[] = [
  "Duyurular",
  "Yemek listeleri",
  "Yıllık planlar",
  "Sınav takvimleri",
  "Rehberlik notları",
  "Kurum politikaları",
  "Servis bilgileri",
];

/* ------------------------------ Güvenlik özellikleri ---------------------- */

export interface SecurityFeature {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const aiSecurityFeatures: SecurityFeature[] = [
  { id: "rol", label: "Rol bazlı erişim", icon: ShieldCheck },
  { id: "veri", label: "Kurumsal veri güvenliği", icon: Lock },
  { id: "kvkk", label: "KVKK uyumlu mimari", icon: FileCheck },
  { id: "kayit", label: "Kayıt altına alınan AI işlemleri", icon: History },
];
