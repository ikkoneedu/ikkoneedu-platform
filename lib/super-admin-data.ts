/**
 * ikkoneedu — Super Admin erişim merkezi için route kataloğu.
 * Yalnızca geliştirme/demo amaçlıdır; gerçek yetkilendirme yoktur.
 */

export type RouteStatus = "Hazır" | "Geliştiriliyor" | "Mock";

export interface RouteEntry {
  id: string;
  name: string;
  route: string;
  description: string;
  status: RouteStatus;
}

export const siteRoutes: RouteEntry[] = [
  { id: "home", name: "Ana Sayfa", route: "/", description: "Platform pazarlama ve tanıtım ana sayfası.", status: "Hazır" },
  { id: "login", name: "Login", route: "/login", description: "Kullanıcı giriş ekranı (mock kimlik doğrulama).", status: "Hazır" },
  { id: "school-select", name: "Okul Seçimi", route: "/school-select", description: "Bağlı olunan okul/kampüs seçim ekranı.", status: "Hazır" },
  { id: "admin", name: "Yönetim Paneli", route: "/admin", description: "Okul yönetimi gösterge paneli ve metrikler.", status: "Mock" },
  { id: "executive", name: "Executive Dashboard", route: "/executive", description: "Kurucu ve yönetim kurulu için üst düzey performans paneli.", status: "Mock" },
  { id: "parent", name: "Veli Portalı", route: "/parent", description: "Veli takip merkezi: duyuru, servis, mesaj.", status: "Mock" },
  { id: "student", name: "Öğrenci Portalı", route: "/student", description: "Öğrenci merkezi: program, görev, başarı.", status: "Mock" },
  { id: "teacher", name: "Öğretmen Portalı", route: "/teacher", description: "Sınıf, ödev ve AI içerik yönetimi.", status: "Mock" },
  { id: "ai-brain", name: "AI Brain", route: "/ai-brain", description: "Merkezi yapay zeka sohbet ve asistan merkezi.", status: "Geliştiriliyor" },
  { id: "scheduler-ai", name: "AI Ders Programı", route: "/scheduler-ai", description: "Yapay zeka destekli ders programı oluşturucu.", status: "Geliştiriliyor" },
  { id: "exam-ai", name: "AI Sınav Oluşturucu", route: "/exam-ai", description: "Sınav, quiz ve çalışma kağıdı üretici.", status: "Geliştiriliyor" },
  { id: "admissions-ai", name: "AI Kayıt Danışmanı", route: "/admissions-ai", description: "Aday veli iletişimi, kayıt funnel ve lead yönetimi.", status: "Geliştiriliyor" },
  { id: "crm", name: "CRM & Lead Yönetimi", route: "/crm", description: "Lead pipeline, randevu, görev merkezi ve kayıt tahmini.", status: "Mock" },
  { id: "messages", name: "Message Center", route: "/messages", description: "Mesaj, duyuru, SMS, e-posta ve push yönetimi.", status: "Mock" },
  { id: "saas-admin", name: "SaaS Yönetim Merkezi", route: "/saas-admin", description: "Çoklu okul, abonelik ve gelir yönetimi.", status: "Mock" },
  { id: "features", name: "Özellikler", route: "/features", description: "Platform modüllerinin tanıtım sayfası.", status: "Hazır" },
  { id: "pricing", name: "Fiyatlandırma", route: "/pricing", description: "Paketler ve SaaS gelir potansiyeli.", status: "Hazır" },
  { id: "demo", name: "Demo Talep", route: "/demo", description: "Demo talep formu ve satış sayfası.", status: "Hazır" },
  { id: "founder-school", name: "Kurucu Okul", route: "/founder-school", description: "Kurucu okul ve stratejik ortaklık vitrini.", status: "Hazır" },
  { id: "mobile-app", name: "Mobil Uygulama", route: "/mobile-app", description: "Mobil uygulama tanıtım ve önizleme sayfası.", status: "Hazır" },
  { id: "settings", name: "Sistem Ayarları", route: "/settings", description: "Süper admin ve sistem yapılandırma merkezi.", status: "Mock" },
];
