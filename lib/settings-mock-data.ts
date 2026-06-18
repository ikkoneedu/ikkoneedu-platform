/**
 * ikkoneedu — Sistem Ayarları (/settings) için mock veriler.
 * Yalnızca arayüz içindir; gerçek API anahtarı, entegrasyon veya kalıcı
 * ayar durumu yoktur.
 */

import {
  Flame,
  Triangle,
  Briefcase,
  Apple,
  Play,
  MessageSquare,
  Calculator,
  Users,
  Bot,
  Cpu,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Platform ---------------------------------- */

export const platformSettings = {
  name: "ikkoneedu",
  fullName: "One Network Education Operating System",
  slogan: "Dünyanın Dili Seninle. Geleceğin Teknolojisi Bizimle.",
  defaultLanguage: "Türkçe",
  defaultTheme: "Dark Mode",
  status: "Aktif",
};

/* ------------------------------ Tenant / Okul ----------------------------- */

export interface SettingsTenant {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: "Aktif" | "Pasif";
}

export const settingsTenants: SettingsTenant[] = [
  { id: "ikk", name: "İngiliz Kültür Kolejleri", domain: "ingilizkultur.ikkoneedu.com", plan: "Professional", status: "Aktif" },
  { id: "atael", name: "Atael Koleji", domain: "atael.ikkoneedu.com", plan: "Professional", status: "Aktif" },
  { id: "demo", name: "Demo Okul", domain: "demookul.ikkoneedu.com", plan: "Starter", status: "Aktif" },
];

/* ------------------------------ Roller ------------------------------------ */

export interface SettingsRole {
  id: string;
  name: string;
  description: string;
  level: string;
  users: number;
}

export const settingsRoles: SettingsRole[] = [
  { id: "super", name: "Super Admin", description: "Tüm platform ve sistem ayarlarına tam erişim.", level: "Tam Yetki", users: 3 },
  { id: "okul-yonetici", name: "Okul Yöneticisi", description: "Kendi okulunun tüm süreçlerini yönetir.", level: "Yüksek", users: 24 },
  { id: "ogretmen", name: "Öğretmen", description: "Sınıf, ders ve değerlendirme süreçleri.", level: "Orta", users: 480 },
  { id: "veli", name: "Veli", description: "Öğrenci takibi ve okul iletişimi.", level: "Sınırlı", users: 9140 },
  { id: "ogrenci", name: "Öğrenci", description: "Ders, ödev ve AI asistanı erişimi.", level: "Sınırlı", users: 12480 },
  { id: "satis", name: "Satış Ekibi", description: "Demo talepleri ve okul kayıt süreçleri.", level: "Orta", users: 8 },
  { id: "destek", name: "Teknik Destek", description: "Sistem izleme ve kullanıcı destek araçları.", level: "Yüksek", users: 12 },
];

/* ------------------------------ Güvenlik ---------------------------------- */

export interface SecurityOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export const securityOptions: SecurityOption[] = [
  { id: "2fa", title: "İki Aşamalı Doğrulama", description: "Yöneticiler için zorunlu ek doğrulama katmanı.", enabled: true },
  { id: "session", title: "Oturum Süresi", description: "Hareketsiz oturumları otomatik sonlandırır.", enabled: true },
  { id: "password", title: "Şifre Politikası", description: "Güçlü şifre kuralları ve periyodik yenileme.", enabled: true },
  { id: "ip", title: "IP Kısıtlaması", description: "Belirli IP aralıklarından erişime izin verir.", enabled: false },
  { id: "logs", title: "Giriş Logları", description: "Tüm giriş denemeleri kayıt altına alınır.", enabled: true },
  { id: "rbac", title: "Rol Bazlı Erişim", description: "Yetki seviyesine göre erişim kontrolü.", enabled: true },
  { id: "kvkk", title: "KVKK Uyum Durumu", description: "Kişisel veri işleme süreçleri uyumlu.", enabled: true },
];

/* ------------------------------ Yapay Zeka -------------------------------- */

export interface AiProvider {
  id: string;
  name: string;
  status: "Hazır" | "Pasif" | "Test Modu";
  usage: string;
  cost: string;
  model: string;
  icon: LucideIcon;
}

export const aiProviders: AiProvider[] = [
  { id: "openai", name: "OpenAI API", status: "Hazır", usage: "42.300 / 100.000", cost: "₺3.200", model: "gpt-4o", icon: Bot },
  { id: "anthropic", name: "Anthropic Claude API", status: "Test Modu", usage: "12.800 / 50.000", cost: "₺1.100", model: "claude-opus-4-8", icon: Cpu },
  { id: "gemini", name: "Google Gemini API", status: "Pasif", usage: "0 / 0", cost: "₺0", model: "gemini-1.5-pro", icon: Sparkles },
];

export const aiConfig = {
  defaultModels: ["claude-opus-4-8", "gpt-4o", "gemini-1.5-pro"],
  dailyLimits: ["10.000 sorgu", "50.000 sorgu", "100.000 sorgu", "Sınırsız"],
  schoolLimits: ["500 sorgu", "1.000 sorgu", "2.500 sorgu", "Sınırsız"],
  safetyFilters: ["Standart", "Yüksek", "Maksimum"],
};

/* ------------------------------ Bildirimler ------------------------------- */

export interface NotificationChannel {
  id: string;
  name: string;
  enabled: boolean;
  limit: string;
  used: string;
}

export const notificationChannels: NotificationChannel[] = [
  { id: "push", name: "Push Notification", enabled: true, limit: "Sınırsız", used: "128.500" },
  { id: "email", name: "E-posta", enabled: true, limit: "50.000 / gün", used: "18.240" },
  { id: "sms", name: "SMS", enabled: true, limit: "10.000 / gün", used: "3.120" },
  { id: "whatsapp", name: "WhatsApp Entegrasyonu", enabled: false, limit: "5.000 / gün", used: "0" },
  { id: "inapp", name: "Sistem İçi Bildirim", enabled: true, limit: "Sınırsız", used: "96.400" },
];

/* ------------------------------ Entegrasyonlar ---------------------------- */

export interface Integration {
  id: string;
  name: string;
  status: "Bağlı" | "Bağlı Değil";
  lastCheck: string;
  icon: LucideIcon;
}

export const integrations: Integration[] = [
  { id: "firebase", name: "Firebase", status: "Bağlı Değil", lastCheck: "—", icon: Flame },
  { id: "vercel", name: "Vercel", status: "Bağlı", lastCheck: "Bugün", icon: Triangle },
  { id: "workspace", name: "Google Workspace", status: "Bağlı Değil", lastCheck: "—", icon: Briefcase },
  { id: "appstore", name: "App Store", status: "Bağlı Değil", lastCheck: "—", icon: Apple },
  { id: "googleplay", name: "Google Play", status: "Bağlı Değil", lastCheck: "—", icon: Play },
  { id: "sms", name: "SMS Servisi", status: "Bağlı", lastCheck: "2 gün önce", icon: MessageSquare },
  { id: "muhasebe", name: "Muhasebe Sistemi", status: "Bağlı Değil", lastCheck: "—", icon: Calculator },
  { id: "crm", name: "CRM", status: "Bağlı Değil", lastCheck: "—", icon: Users },
];

/* ------------------------------ Sistem sağlığı ---------------------------- */

export interface HealthRow {
  id: string;
  label: string;
  value: string;
  ok: boolean;
}

export const settingsSystemHealth: HealthRow[] = [
  { id: "uptime", label: "Uptime", value: "%99.98", ok: true },
  { id: "api", label: "API Durumu", value: "Aktif", ok: true },
  { id: "ai", label: "AI Servisleri", value: "Test Modu", ok: true },
  { id: "db", label: "Veritabanı", value: "Normal", ok: true },
  { id: "deploy", label: "Son Deploy", value: "Bugün", ok: true },
  { id: "build", label: "Build Durumu", value: "Başarılı", ok: true },
];

/* ------------------------------ Audit log --------------------------------- */

export interface AuditEntry {
  id: string;
  action: string;
  user: string;
  date: string;
  status: "Başarılı" | "Bilgi";
}

export const auditLogs: AuditEntry[] = [
  { id: "a1", action: "Okul ayarı güncellendi", user: "Super Admin", date: "Bugün, 14:32", status: "Başarılı" },
  { id: "a2", action: "AI limiti değiştirildi", user: "Super Admin", date: "Bugün, 11:08", status: "Başarılı" },
  { id: "a3", action: "Yeni okul eklendi", user: "Satış Ekibi", date: "Dün, 16:45", status: "Başarılı" },
  { id: "a4", action: "Kullanıcı rolü güncellendi", user: "Okul Yöneticisi", date: "Dün, 09:20", status: "Bilgi" },
  { id: "a5", action: "Sistem yedeği alındı", user: "Teknik Destek", date: "2 gün önce", status: "Başarılı" },
];
