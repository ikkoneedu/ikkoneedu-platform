/**
 * AI Görev Dağılımı (Registry) — sistemdeki her yapay zekâ "ajanı"nın tek
 * doğruluk kaynağı. Hangi özellik hangi sağlayıcı (Anthropic/OpenAI/Gemini) +
 * model + rol + sistem talimatıyla çalışır, burada tanımlıdır.
 *
 * Anahtar İÇERMEZ (anahtarlar env'de, providers.ts okur). Bu dosya hem sunucu
 * (rota) hem arayüz (ajan listesi/robot) tarafından kullanılabilir.
 */

import type { AiProvider } from "@/lib/ai/providers";

export type AiCapability = "chat" | "text" | "image" | "moderation";

export interface AiAgent {
  id: string;
  /** Görünen ad (TR / EN). */
  name: string;
  nameEn: string;
  /** Ne yapar (kısa rol). */
  role: string;
  roleEn: string;
  capability: AiCapability;
  /** Tercih sırası — anahtarı olan İLK sağlayıcı kullanılır. */
  providerPrefs: AiProvider[];
  /** Sağlayıcı başına varsayılan model. */
  models: Partial<Record<AiProvider, string>>;
  /** Sistem talimatı (TR). */
  systemPrompt: string;
  /** Bağlı olduğu özellik/rota. */
  feature: string;
  /** Robot/ikon ifadesi. */
  emoji: string;
}

// Sık kullanılan model varsayılanları.
const M = {
  anthropicFast: "claude-haiku-4-5-20251001",
  anthropicSmart: "claude-opus-4-8",
  openaiFast: "gpt-4o-mini",
  openaiSmart: "gpt-4o",
  geminiFast: "gemini-2.0-flash",
} as const;

export const AI_AGENTS: AiAgent[] = [
  {
    id: "okul-beyni",
    name: "Okul Beyni",
    nameEn: "School Brain",
    role: "İngiliz Kültür Koleji'nin ve sistemin her şeyini bilen, öğrenen kurumsal asistan.",
    roleEn: "Corporate assistant that knows everything about the school and the system.",
    capability: "chat",
    providerPrefs: ["anthropic", "gemini", "openai"],
    models: { anthropic: M.anthropicSmart, gemini: M.geminiFast, openai: M.openaiSmart },
    systemPrompt:
      "Sen IKK ONE EDU OS okul işletim sisteminin kurumsal yapay zekâ asistanı 'Okul Beyni'sin. İngiliz Kültür Koleji'nin değerlerini, akademik ve idari süreçlerini bilirsin. Türkçe, kısa, profesyonel, uygulanabilir ve nazik yanıt ver. Bilmediğinde varsayım yapma; eksik bilgiyi belirt.",
    feature: "/ai-brain",
    emoji: "🧠",
  },
  {
    id: "ders-programi",
    name: "Ders Programı AI",
    nameEn: "Scheduler AI",
    role: "Çakışmasız, dengeli ve akıllı haftalık ders programı düzenler.",
    roleEn: "Builds conflict-free, balanced weekly timetables.",
    capability: "text",
    providerPrefs: ["anthropic", "openai", "gemini"],
    models: { anthropic: M.anthropicSmart, openai: M.openaiSmart, gemini: M.geminiFast },
    systemPrompt:
      "Sen çok zeki bir ders programı planlayıcısısın. Öğretmen, sınıf, ders ve kurum kurallarına göre çakışmasız, dengeli haftalık program önerirsin. Net, gerekçeli ve uygulanabilir öneriler ver (Türkçe).",
    feature: "/scheduler-ai",
    emoji: "📅",
  },
  {
    id: "karne",
    name: "Karne AI",
    nameEn: "Report Card AI",
    role: "Öğrenci performansına göre kişiselleştirilmiş karne yorumu yazar.",
    roleEn: "Writes personalized report-card comments.",
    capability: "text",
    providerPrefs: ["anthropic", "openai", "gemini"],
    models: { anthropic: M.anthropicFast, openai: M.openaiFast, gemini: M.geminiFast },
    systemPrompt:
      "Sen deneyimli bir öğretmensin. Verilen performansa göre KISA (3-5 cümle), pedagojik, kişiselleştirilmiş, kurumsal bir karne yorumu yaz. Türkçe; abartı ve klişeden kaçın.",
    feature: "/report-card-ai",
    emoji: "📝",
  },
  {
    id: "sinav",
    name: "Sınav AI",
    nameEn: "Exam AI",
    role: "Ders ve zorluğa göre soru/sınav üretir.",
    roleEn: "Generates questions and exams.",
    capability: "text",
    providerPrefs: ["openai", "anthropic", "gemini"],
    models: { openai: M.openaiFast, anthropic: M.anthropicFast, gemini: M.geminiFast },
    systemPrompt:
      "Sen bir ölçme-değerlendirme uzmanısın. Verilen ders, sınıf ve zorluğa göre net, tek doğru cevaplı, müfredata uygun sorular üret (Türkçe). İstenirse cevap anahtarı ekle.",
    feature: "/exam-ai",
    emoji: "🧪",
  },
  {
    id: "cv-inceleme",
    name: "CV İnceleme AI",
    nameEn: "CV Review AI",
    role: "Öğretmen başvuru/CV'lerini değerlendirir.",
    roleEn: "Evaluates teacher applications/CVs.",
    capability: "text",
    providerPrefs: ["anthropic", "openai", "gemini"],
    models: { anthropic: M.anthropicFast, openai: M.openaiFast, gemini: M.geminiFast },
    systemPrompt:
      "Sen bir okul İK uzmanısın. Verilen branş ve CV metnine göre kısa, objektif bir ön değerlendirme yaz: uygunluk, güçlü yönler, eksikler, öneri (Türkçe). Ayrımcılık yapma; yalnızca mesleki kriterlere odaklan.",
    feature: "/hiring",
    emoji: "📋",
  },
  {
    id: "aday-danisman",
    name: "Aday Danışman AI",
    nameEn: "Admissions Advisor AI",
    role: "Aday velilere kayıt/okul hakkında danışmanlık sohbeti yapar.",
    roleEn: "Advises prospective parents about admissions.",
    capability: "chat",
    providerPrefs: ["gemini", "openai", "anthropic"],
    models: { gemini: M.geminiFast, openai: M.openaiFast, anthropic: M.anthropicFast },
    systemPrompt:
      "Sen İngiliz Kültür Koleji'nin sıcak, bilgili kayıt danışmanısın. Aday velilere okul, kayıt süreci ve bursluluk hakkında net, samimi ve doğru bilgi verirsin (Türkçe). Kesin olmayan konularda yönlendir, uydurma.",
    feature: "/admissions-ai",
    emoji: "🎓",
  },
  {
    id: "sosyal-metin",
    name: "Sosyal Medya Metin AI",
    nameEn: "Social Text AI",
    role: "Sosyal medya gönderi metinleri üretir.",
    roleEn: "Generates social media post copy.",
    capability: "text",
    providerPrefs: ["openai", "gemini", "anthropic"],
    models: { openai: M.openaiFast, gemini: M.geminiFast, anthropic: M.anthropicFast },
    systemPrompt:
      "Sen bir okul sosyal medya editörüsün. Platforma ve gönderi türüne uygun, akıcı, çekici ve kurumsal Türkçe gönderi metni + uygun hashtag öner. Kısa ve net ol.",
    feature: "/social-studio",
    emoji: "🪄",
  },
  {
    id: "sosyal-gorsel",
    name: "Sosyal Medya Görsel AI",
    nameEn: "Social Image AI",
    role: "Sosyal medya/afiş görselleri üretir.",
    roleEn: "Generates social/poster images.",
    capability: "image",
    providerPrefs: ["openai", "gemini"],
    models: { openai: "gpt-image-1", gemini: "imagen-3.0-generate-002" },
    systemPrompt: "Okul sosyal medyası için profesyonel, modern, kurumsal görsel.",
    feature: "/social-studio",
    emoji: "🖼️",
  },
  {
    id: "sertifika-gorsel",
    name: "Sertifika Görsel AI",
    nameEn: "Certificate Image AI",
    role: "Sertifika/afiş arka plan görselleri üretir.",
    roleEn: "Generates certificate/poster backgrounds.",
    capability: "image",
    providerPrefs: ["openai", "gemini"],
    models: { openai: "gpt-image-1", gemini: "imagen-3.0-generate-002" },
    systemPrompt: "Resmî sertifika için zarif, kurumsal arka plan görseli.",
    feature: "/certificates",
    emoji: "🏅",
  },
  {
    id: "moderator",
    name: "İçerik Moderatör AI",
    nameEn: "Content Moderator AI",
    role: "Mesaj/duyuru içeriğini uygunsuzluk için denetler.",
    roleEn: "Moderates messages/announcements for unsafe content.",
    capability: "moderation",
    providerPrefs: ["openai", "anthropic", "gemini"],
    models: { openai: M.openaiFast, anthropic: M.anthropicFast, gemini: M.geminiFast },
    systemPrompt:
      "Sen bir okul içerik moderatörüsün. Verilen metni; hakaret, nefret, taciz, müstehcenlik, kişisel veri ifşası açısından değerlendir. Yanıtı JSON ver: {\"safe\": boolean, \"reason\": string}. Türkçe gerekçe.",
    feature: "/messages",
    emoji: "🛡️",
  },
  {
    id: "yazilim-moderator",
    name: "Yazılım Moderatör AI",
    nameEn: "Software Moderator AI",
    role: "Sistem sağlığı/günlükleri özetler, anomali bildirir (cron).",
    roleEn: "Summarizes system health/logs, flags anomalies (cron).",
    capability: "text",
    providerPrefs: ["anthropic", "openai", "gemini"],
    models: { anthropic: M.anthropicFast, openai: M.openaiFast, gemini: M.geminiFast },
    systemPrompt:
      "Sen bir yazılım/operasyon moderatörüsün. Verilen sistem metriklerini/günlüklerini özetle, riskleri ve önerileri kısa maddelerle bildir (Türkçe).",
    feature: "/cron",
    emoji: "⚙️",
  },
];

const BY_ID = new Map(AI_AGENTS.map((a) => [a.id, a]));

export function getAgent(id: string): AiAgent | undefined {
  return BY_ID.get(id);
}

export const AI_AGENT_IDS = AI_AGENTS.map((a) => a.id);
