/**
 * TR/EN sözlükleri ve çeviri fonksiyonu.
 *
 * Anahtarlar düz (nokta ayraçlı) tutulur: "nav.dashboard", "common.save".
 * `tr` kaynaktır; `en` eksik anahtarlarda TR'ye düşer (asla ham anahtar
 * gösterilmez). Yeni metinler eklendikçe her iki sözlük de büyütülür.
 *
 * Kullanım:
 *   - İstemci: const t = useT(); t("common.save")
 *   - Sunucu: const t = await getServerT(); t("common.save")
 */

import type { Locale } from "@/lib/i18n/config";
import * as pricing from "@/lib/i18n/dict/pricing";
import * as demo from "@/lib/i18n/dict/demo";
import * as features from "@/lib/i18n/dict/features";
import * as register from "@/lib/i18n/dict/register";
import * as codeLogin from "@/lib/i18n/dict/codeLogin";
import * as mobileApp from "@/lib/i18n/dict/mobileApp";
import * as founderSchool from "@/lib/i18n/dict/founderSchool";
import * as portal from "@/lib/i18n/dict/portal";
import * as schoolSelect from "@/lib/i18n/dict/schoolSelect";
import * as boardA from "@/lib/i18n/dict/boardA";
import * as boardB from "@/lib/i18n/dict/boardB";
import * as boardC from "@/lib/i18n/dict/boardC";
import * as boardD from "@/lib/i18n/dict/boardD";
import * as dashboard from "@/lib/i18n/dict/dashboard";
import * as dashStudent from "@/lib/i18n/dict/dashStudent";
import * as dashAdmin from "@/lib/i18n/dict/dashAdmin";
import * as dashExec from "@/lib/i18n/dict/dashExec";
import * as panelCrm from "@/lib/i18n/dict/panelCrm";
import * as panelSettings from "@/lib/i18n/dict/panelSettings";
import * as panelSaas from "@/lib/i18n/dict/panelSaas";
import * as panelFinance from "@/lib/i18n/dict/panelFinance";
import * as panelExec from "@/lib/i18n/dict/panelExec";

type Dict = Record<string, string>;

/** Sayfa-bazlı (namespace) sözlük parçaları — paralel geliştirme için ayrı dosyalar. */
const ZONE_TR: Dict[] = [
  pricing.tr, demo.tr, features.tr, register.tr, codeLogin.tr,
  mobileApp.tr, founderSchool.tr, portal.tr, schoolSelect.tr,
  boardA.tr, boardB.tr, boardC.tr, boardD.tr, dashboard.tr,
  dashStudent.tr, dashAdmin.tr, dashExec.tr,
  panelCrm.tr, panelSettings.tr, panelSaas.tr, panelFinance.tr, panelExec.tr,
];
const ZONE_EN: Dict[] = [
  pricing.en, demo.en, features.en, register.en, codeLogin.en,
  mobileApp.en, founderSchool.en, portal.en, schoolSelect.en,
  boardA.en, boardB.en, boardC.en, boardD.en, dashboard.en,
  dashStudent.en, dashAdmin.en, dashExec.en,
  panelCrm.en, panelSettings.en, panelSaas.en, panelFinance.en, panelExec.en,
];

const tr: Dict = {
  // Genel
  "common.save": "Kaydet",
  "common.cancel": "Vazgeç",
  "common.delete": "Sil",
  "common.edit": "Düzenle",
  "common.add": "Ekle",
  "common.send": "Gönder",
  "common.loading": "Yükleniyor…",
  "common.search": "Ara",
  "common.refresh": "Yenile",
  "common.back": "Geri",
  "common.close": "Kapat",
  "common.required": "zorunlu",
  "common.optional": "opsiyonel",
  "common.comingSoon": "Yakında",
  "common.all": "Tümü",
  "common.login": "Giriş Yap",
  "common.logout": "Çıkış Yap",
  "common.continue": "Devam Et",

  // Üst menü / navigasyon
  "nav.features": "Özellikler",
  "nav.pricing": "Fiyatlandırma",
  "nav.founderSchool": "Kurucu Okul",
  "nav.requestDemo": "Demo Talep Et",
  "nav.searchSoon": "Arama yakında",

  // Panel navigasyonu (sidebar / mobil / topbar)
  "nav.overview": "Genel Bakış",
  "nav.adminPanel": "Yönetim Paneli",
  "nav.staff": "Personel ve Kullanıcılar",
  "nav.records": "Öğrenci · Veli · Öğretmen",
  "nav.recordsShort": "Kayıtlar",
  "nav.timetable": "Ders Programı ve Sınıflar",
  "nav.timetableShort": "Ders Programı",
  "nav.executive": "Executive",
  "nav.schools": "Okullar",
  "nav.students": "Öğrenciler",
  "nav.parents": "Veliler",
  "nav.teachers": "Öğretmenler",
  "nav.myClasses": "Sınıflarım ve Kodlar",
  "nav.aiBrain": "AI Brain",
  "nav.aiAdmissions": "AI Kayıt Danışmanı",
  "nav.scholarship": "Bursluluk Sınavı",
  "nav.aiReportCard": "AI Karne Asistanı",
  "nav.counseling": "Rehberlik Merkezi",
  "nav.lessonPlans": "Ders Planları",
  "nav.events": "Etkinlikler",
  "nav.lunch": "Yemek Listesi",
  "nav.bus": "Servis Takibi",
  "nav.finance": "Finans Merkezi",
  "nav.crm": "CRM",
  "nav.messages": "Mesajlar",
  "nav.notifications": "Bildirim Merkezi",
  "nav.demo": "Demo Talep",
  "nav.settings": "Ayarlar",
  "nav.superAdmin": "Super Admin",
  "nav.panel": "Panel",
  "nav.academic": "Akademik",
  "nav.aiIntel": "AI Zekası",
  "nav.calendar": "Takvim",
  "nav.analytics": "Analizler",
  "nav.management": "Yönetim",
  "nav.home": "Ana Sayfa",
  "nav.profile": "Profil",
  "nav.campusSelect": "Kampüs Seçimi",
  "nav.announcements": "Duyurular",

  // Kullanıcı menüsü
  "userMenu.profile": "Profilim",
  "userMenu.user": "Kullanıcı",
  "userMenu.logout": "Çıkış yap",

  // Dil / tema
  "lang.switchToEnglish": "Switch to English",
  "lang.switchToTurkish": "Türkçeye geç",
  "theme.light": "Açık tema",
  "theme.dark": "Koyu tema",

  // Açılış (landing) — hero/header
  "landing.login": "Giriş Yap",
  "landing.requestDemo": "Demo Talep Et",

  // Yakında sayfası
  "comingSoon.heading": "Bu özellik yakında",
  "comingSoon.body":
    "Üzerinde çalışıyoruz. Bu bölüm çok yakında kullanıma açılacak. O zamana kadar mevcut panelinizden devam edebilirsiniz.",
  "comingSoon.backHome": "Ana Sayfaya Dön",

  // Sinematik hero
  "hero.initializing": "Eğitim Ağı Başlatılıyor",
  "hero.statusActive": "Sistem Aktif",
  "hero.modulesOnline": "12 modül çevrimiçi",
  "hero.tagline1": "Tek Ağ. Tek Platform. ",
  "hero.tagline2": "Tek Gelecek.",
  "hero.subtitle": "Modern Eğitimin İşletim Sistemi",
  "hero.description":
    "Kayıt kabul, CRM, bursluluk sınavları, öğretmenler, öğrenciler, veliler, finans, raporlar ve yönetim kararlarını tek bağlı SaaS platformundan yönetin.",
  "hero.explore": "Platformu Keşfet",
  "hero.trust1": "Çok Kiracılı SaaS",
  "hero.trust2": "Özel Okullar İçin",
  "hero.trust3": "Kurucu Okul: İngiliz Kültür Kolejleri",

  // Açılış — bölümler
  "landing.portalEyebrow": "Mevcut Kullanıcılar",
  "landing.portalTitle": "Okul Portalınıza Giriş Yapın",
  "landing.portalDesc":
    "Okul yöneticisi, öğretmen, veli ve öğrenciler tek giriş ekranından kendi panellerine yönlendirilir.",
  "landing.portal.admin": "Okul Yönetimi",
  "landing.portal.teacher": "Öğretmen Girişi",
  "landing.portal.parent": "Veli Girişi",
  "landing.portal.student": "Öğrenci Girişi",

  "landing.founderEyebrow": "Kurucu Okul",
  "landing.founderTitle": "İngiliz Kültür Kolejleri — Kurucu Okul",
  "landing.founderDesc":
    "İngiliz Kültür Kolejleri, ikkoneedu platformunun ilk uygulama ve geliştirme ortağı olarak dijital okul dönüşümüne öncülük eder.",
  "landing.card.avantaj.title": "Kurucu Okul Avantajı",
  "landing.card.avantaj.desc":
    "Platformun ilk geliştirme ortağı olarak özelliklere öncelikli erişim ve söz hakkı.",
  "landing.card.donusum.title": "Dijital Kampüs Dönüşümü",
  "landing.card.donusum.desc":
    "Tüm okul süreçlerinin uçtan uca dijitalleşmesiyle modern bir kampüs deneyimi.",
  "landing.card.ai-yonetim.title": "Yapay Zeka Destekli Okul Yönetimi",
  "landing.card.ai-yonetim.desc":
    "Karar süreçlerini hızlandıran, veri odaklı yapay zeka asistanlığı.",
  "landing.card.vizyon.title": "Gelecekte Gelir Üreten Platform Vizyonu",
  "landing.card.vizyon.desc":
    "Kurum içi verimliliğin ötesinde, ölçeklenebilir bir gelir modeline dönüşüm.",

  "landing.platformEyebrow": "Tek Platform",
  "landing.platformTitle": "Tek Platform, Dört Deneyim",
  "landing.platformDesc":
    "Veli, öğrenci, öğretmen ve yönetim için kusursuzca birbirine bağlı tek bir ekosistem.",
  "landing.card.veli.title": "Veli Portalı",
  "landing.card.veli.desc":
    "Öğrenci gelişimi, iletişim ve ödemeler için tek dokunuşluk veli deneyimi.",
  "landing.card.ogrenci.title": "Öğrenci Portalı",
  "landing.card.ogrenci.desc":
    "Dersler, ödevler ve yapay zeka asistanıyla kişiselleştirilmiş öğrenme.",
  "landing.card.ogretmen.title": "Öğretmen Portalı",
  "landing.card.ogretmen.desc":
    "Sınıf, içerik ve değerlendirme süreçlerini kolaylaştıran akıllı araçlar.",
  "landing.card.yonetim.title": "Yönetim Paneli",
  "landing.card.yonetim.desc":
    "Tüm kampüsü tek ekrandan yöneten stratejik gösterge paneli.",

  "landing.aiEyebrow": "Yapay Zeka",
  "landing.aiTitle": "AI Modülleri",
  "landing.aiDesc":
    "Eğitimin her aşamasını güçlendiren, birbirine bağlı yapay zeka modülleri.",
  "landing.card.brain.title": "AI Brain",
  "landing.card.brain.desc": "Tüm modülleri besleyen merkezi yapay zeka zekası.",
  "landing.card.ders-programi.title": "AI Ders Programı",
  "landing.card.ders-programi.desc":
    "Optimum ders ve öğretmen dağılımını saniyeler içinde oluşturur.",
  "landing.card.sinav.title": "AI Sınav Oluşturucu",
  "landing.card.sinav.desc": "Kazanımlara uygun sınavları otomatik hazırlar.",
  "landing.card.karne.title": "AI Karne Yorumu",
  "landing.card.karne.desc":
    "Öğrenciye özel, anlamlı karne değerlendirmeleri üretir.",
  "landing.card.kayit.title": "AI Kayıt Danışmanı",
  "landing.card.kayit.desc": "Yeni kayıt sürecini akıllı önerilerle yönlendirir.",
  "landing.card.rehberlik.title": "AI Rehberlik Asistanı",
  "landing.card.rehberlik.desc": "Öğrenci rehberliğinde 7/24 yapay zeka desteği.",

  "landing.revenueEyebrow": "SaaS Gelir Modeli",
  "landing.revenueTitle": "Bir Okuldan Türkiye Geneline",
  "landing.revenueDesc":
    "İngiliz Kültür Kolejleri'nde başlayan bu teknoloji, ilerleyen dönemde farklı okullara abonelik modeliyle sunulabilecek ölçeklenebilir bir EdTech platformuna dönüşür.",
  "landing.tier.schools": "{count} Okul",
  "landing.tier.revenue": "{amount}M TL / yıl",

  "landing.mobileBadge": "Mobil Uygulama",
  "landing.mobileTitle": "Okulunuz Cebinizde",
  "landing.mobileDesc":
    "Veli, öğrenci, öğretmen ve yöneticiler için tasarlanmış mobil deneyim ile okulunuzla ilgili tüm süreçlere her yerden erişin.",
  "landing.mobileButton": "Mobil Uygulamayı İncele",

  "landing.scholarBadge": "Bursluluk Sınavı",
  "landing.scholarTitle": "Bursluluk Sınavı Başvurusu Açık",
  "landing.scholarDesc":
    "Çocuğunuz için bursluluk ve kabul sınavı başvurusunu birkaç dakika içinde tamamlayın, burs fırsatını yakalayın.",
  "landing.scholarButton": "Bursluluk Sınavı Başvurusu",

  "landing.finalTitle": "Geleceğin Okul İşletim Sistemini Bugün Başlatalım",

  // Altbilgi (footer)
  "footer.tagline":
    "Okulun tüm süreçlerini tek bağlı işletim sisteminde birleştiren çok kiracılı eğitim SaaS platformu.",
  "footer.col.platform": "Platform",
  "footer.col.corporate": "Kurumsal",
  "footer.col.account": "Hesap",
  "footer.link.features": "Özellikler",
  "footer.link.pricing": "Fiyatlandırma",
  "footer.link.mobile": "Mobil Uygulama",
  "footer.link.demo": "Demo Talep Et",
  "footer.link.founder": "Kurucu Okul",
  "footer.link.scholarship": "Bursluluk Sınavı",
  "footer.link.portal": "Okul Portalı",
  "footer.link.login": "Giriş Yap",
  "footer.link.register": "Kayıt Ol",
  "footer.link.codeLogin": "Kod ile Giriş",
  "footer.link.profile": "Profil",
  "footer.rights": "Tüm hakları saklıdır.",
  "footer.badge": "Çok Kiracılı Eğitim SaaS",

  // Giriş (login)
  "login.benefit1": "Tek platformda okul yönetimi",
  "login.benefit2": "Yapay zeka destekli eğitim süreçleri",
  "login.benefit3": "Veli, öğrenci, öğretmen ve yönetim için tek deneyim",
  "login.heroLine": "Türkiye'nin Yapay Zeka Destekli Eğitim İşletim Sistemi",
  "login.cardTitle": "{product} Giriş",
  "login.subtitleDefault": "Hesabınıza giriş yapın.",
  "login.subtitleAdmin": "Okul yönetim panelinize giriş yapın.",
  "login.subtitleTeacher": "Öğretmen portalınıza giriş yapın.",
  "login.subtitleParent": "Veli portalınıza giriş yapın.",
  "login.subtitleStudent": "Öğrenci portalınıza giriş yapın.",
  "login.schoolPrefix": "Okul: {school}",
  "login.identifierLabel": "E-posta veya Telefon",
  "login.identifierPlaceholder": "ornek@okul.com veya 05xx...",
  "login.passwordLabel": "Şifre",
  "login.rememberMe": "Beni hatırla",
  "login.forgotPassword": "Şifremi unuttum",
  "login.submitting": "Giriş yapılıyor...",
  "login.submit": "Giriş Yap",
  "login.demoTitle": "Demo Girişleri (Firebase bağlı değil)",
  "login.demoSuper": "Super Admin Demo",
  "login.demoAdmin": "Okul Yönetimi Demo",
  "login.demoTeacher": "Öğretmen Demo",
  "login.demoParent": "Veli Demo",
  "login.demoStudent": "Öğrenci Demo",
  "login.codeQuestion": "Öğrenci veya veli misiniz?",
  "login.codeLink": "Kod ile giriş yapın",
  "login.registerQuestion": "Aday veli misiniz?",
  "login.registerLink": "Hesap oluşturun",
  "login.demoQuestion": "Okulunuzu sisteme taşımak için",
  "login.demoLink": "demo talep edin",
  "login.browseQuestion": "Üye olmadan",
  "login.browseLink": "okulları ve bursluluğu inceleyin",
  "login.errForgotEmail": "Şifre sıfırlama için önce e-posta adresinizi girin.",
  "login.msgResetSent": "Şifre sıfırlama bağlantısı e-postanıza gönderildi (varsa).",
  "login.errResetFailed": "Sıfırlama e-postası gönderilemedi.",
  "login.errFirebase":
    "Giriş sistemi şu anda bağlı değil (Firebase yapılandırması bulunamadı). Geliştirme yapıyorsanız .env.local içindeki NEXT_PUBLIC_FIREBASE_* değerlerini kontrol edip sunucuyu yeniden başlatın.",
  "login.errEmailOnly": "Lütfen e-posta adresinizle giriş yapın (örn. ad@okul.com).",
  "login.errNoProfile":
    "Yetki profiliniz bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin.",
};

const en: Dict = {
  // General
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.add": "Add",
  "common.send": "Send",
  "common.loading": "Loading…",
  "common.search": "Search",
  "common.refresh": "Refresh",
  "common.back": "Back",
  "common.close": "Close",
  "common.required": "required",
  "common.optional": "optional",
  "common.comingSoon": "Coming soon",
  "common.all": "All",
  "common.login": "Sign in",
  "common.logout": "Sign out",
  "common.continue": "Continue",

  // Top menu / navigation
  "nav.features": "Features",
  "nav.pricing": "Pricing",
  "nav.founderSchool": "Founding School",
  "nav.requestDemo": "Request a Demo",
  "nav.searchSoon": "Search coming soon",

  // Panel navigation (sidebar / mobile / topbar)
  "nav.overview": "Overview",
  "nav.adminPanel": "Management Panel",
  "nav.staff": "Staff & Users",
  "nav.records": "Student · Parent · Teacher",
  "nav.recordsShort": "Records",
  "nav.timetable": "Timetable & Classes",
  "nav.timetableShort": "Timetable",
  "nav.executive": "Executive",
  "nav.schools": "Schools",
  "nav.students": "Students",
  "nav.parents": "Parents",
  "nav.teachers": "Teachers",
  "nav.myClasses": "My Classes & Codes",
  "nav.aiBrain": "AI Brain",
  "nav.aiAdmissions": "AI Enrollment Advisor",
  "nav.scholarship": "Scholarship Exam",
  "nav.aiReportCard": "AI Report Card Assistant",
  "nav.counseling": "Counseling Center",
  "nav.lessonPlans": "Lesson Plans",
  "nav.events": "Events",
  "nav.lunch": "Lunch Menu",
  "nav.bus": "Bus Tracking",
  "nav.finance": "Finance Center",
  "nav.crm": "CRM",
  "nav.messages": "Messages",
  "nav.notifications": "Notification Center",
  "nav.demo": "Request Demo",
  "nav.settings": "Settings",
  "nav.superAdmin": "Super Admin",
  "nav.panel": "Panel",
  "nav.academic": "Academic",
  "nav.aiIntel": "AI Intelligence",
  "nav.calendar": "Calendar",
  "nav.analytics": "Analytics",
  "nav.management": "Management",
  "nav.home": "Home",
  "nav.profile": "Profile",
  "nav.campusSelect": "Campus Selection",
  "nav.announcements": "Announcements",

  // User menu
  "userMenu.profile": "My Profile",
  "userMenu.user": "User",
  "userMenu.logout": "Sign out",

  // Language / theme
  "lang.switchToEnglish": "Switch to English",
  "lang.switchToTurkish": "Türkçeye geç",
  "theme.light": "Light theme",
  "theme.dark": "Dark theme",

  // Landing — hero/header
  "landing.login": "Sign in",
  "landing.requestDemo": "Request a Demo",

  // Coming soon page
  "comingSoon.heading": "This feature is coming soon",
  "comingSoon.body":
    "We're working on it. This section will be available very soon. Until then, you can continue from your current dashboard.",
  "comingSoon.backHome": "Back to Home",

  // Cinematic hero
  "hero.initializing": "Initializing Education Network",
  "hero.statusActive": "System Active",
  "hero.modulesOnline": "12 modules online",
  "hero.tagline1": "One Network. One Platform. ",
  "hero.tagline2": "One Future.",
  "hero.subtitle": "The Operating System for Modern Education",
  "hero.description":
    "Manage admissions, CRM, scholarship exams, teachers, students, parents, finance, reports and management decisions from a single connected SaaS platform.",
  "hero.explore": "Explore the Platform",
  "hero.trust1": "Multi-Tenant SaaS",
  "hero.trust2": "For Private Schools",
  "hero.trust3": "Founding School: İngiliz Kültür Kolejleri",

  // Landing — sections
  "landing.portalEyebrow": "Existing Users",
  "landing.portalTitle": "Sign In to Your School Portal",
  "landing.portalDesc":
    "School administrators, teachers, parents and students are routed to their own dashboards from a single sign-in screen.",
  "landing.portal.admin": "School Management",
  "landing.portal.teacher": "Teacher Sign-in",
  "landing.portal.parent": "Parent Sign-in",
  "landing.portal.student": "Student Sign-in",

  "landing.founderEyebrow": "Founding School",
  "landing.founderTitle": "İngiliz Kültür Kolejleri — Founding School",
  "landing.founderDesc":
    "As the first implementation and development partner of the ikkoneedu platform, İngiliz Kültür Kolejleri leads the way in digital school transformation.",
  "landing.card.avantaj.title": "Founding School Advantage",
  "landing.card.avantaj.desc":
    "As the platform's first development partner, priority access to features and a say in the roadmap.",
  "landing.card.donusum.title": "Digital Campus Transformation",
  "landing.card.donusum.desc":
    "A modern campus experience through end-to-end digitalization of all school processes.",
  "landing.card.ai-yonetim.title": "AI-Powered School Management",
  "landing.card.ai-yonetim.desc":
    "Data-driven AI assistance that accelerates decision-making.",
  "landing.card.vizyon.title": "A Platform Vision That Generates Revenue",
  "landing.card.vizyon.desc":
    "Beyond internal efficiency, evolving into a scalable revenue model.",

  "landing.platformEyebrow": "One Platform",
  "landing.platformTitle": "One Platform, Four Experiences",
  "landing.platformDesc":
    "A single ecosystem seamlessly connected for parents, students, teachers and management.",
  "landing.card.veli.title": "Parent Portal",
  "landing.card.veli.desc":
    "A one-touch parent experience for student progress, communication and payments.",
  "landing.card.ogrenci.title": "Student Portal",
  "landing.card.ogrenci.desc":
    "Personalized learning with lessons, assignments and an AI assistant.",
  "landing.card.ogretmen.title": "Teacher Portal",
  "landing.card.ogretmen.desc":
    "Smart tools that streamline class, content and assessment workflows.",
  "landing.card.yonetim.title": "Management Dashboard",
  "landing.card.yonetim.desc":
    "A strategic dashboard that runs the entire campus from one screen.",

  "landing.aiEyebrow": "Artificial Intelligence",
  "landing.aiTitle": "AI Modules",
  "landing.aiDesc":
    "Connected AI modules that strengthen every stage of education.",
  "landing.card.brain.title": "AI Brain",
  "landing.card.brain.desc": "The central AI intelligence powering all modules.",
  "landing.card.ders-programi.title": "AI Timetable",
  "landing.card.ders-programi.desc":
    "Builds the optimal lesson and teacher distribution in seconds.",
  "landing.card.sinav.title": "AI Exam Builder",
  "landing.card.sinav.desc": "Automatically prepares exams aligned to objectives.",
  "landing.card.karne.title": "AI Report Card Comments",
  "landing.card.karne.desc":
    "Generates meaningful, student-specific report card assessments.",
  "landing.card.kayit.title": "AI Enrollment Advisor",
  "landing.card.kayit.desc": "Guides the new enrollment process with smart suggestions.",
  "landing.card.rehberlik.title": "AI Counseling Assistant",
  "landing.card.rehberlik.desc": "24/7 AI support for student counseling.",

  "landing.revenueEyebrow": "SaaS Revenue Model",
  "landing.revenueTitle": "From One School to All of Türkiye",
  "landing.revenueDesc":
    "Starting at İngiliz Kültür Kolejleri, this technology evolves into a scalable EdTech platform that can later be offered to other schools via a subscription model.",
  "landing.tier.schools": "{count} Schools",
  "landing.tier.revenue": "₺{amount}M / year",

  "landing.mobileBadge": "Mobile App",
  "landing.mobileTitle": "Your School in Your Pocket",
  "landing.mobileDesc":
    "Access every process related to your school from anywhere with a mobile experience designed for parents, students, teachers and administrators.",
  "landing.mobileButton": "Explore the Mobile App",

  "landing.scholarBadge": "Scholarship Exam",
  "landing.scholarTitle": "Scholarship Exam Applications Are Open",
  "landing.scholarDesc":
    "Complete the scholarship and admission exam application for your child in just a few minutes and seize the scholarship opportunity.",
  "landing.scholarButton": "Apply for the Scholarship Exam",

  "landing.finalTitle": "Let's Launch the School Operating System of the Future Today",

  // Footer
  "footer.tagline":
    "A multi-tenant education SaaS platform that unifies all school processes in a single connected operating system.",
  "footer.col.platform": "Platform",
  "footer.col.corporate": "Corporate",
  "footer.col.account": "Account",
  "footer.link.features": "Features",
  "footer.link.pricing": "Pricing",
  "footer.link.mobile": "Mobile App",
  "footer.link.demo": "Request a Demo",
  "footer.link.founder": "Founding School",
  "footer.link.scholarship": "Scholarship Exam",
  "footer.link.portal": "School Portal",
  "footer.link.login": "Sign in",
  "footer.link.register": "Sign up",
  "footer.link.codeLogin": "Sign in with Code",
  "footer.link.profile": "Profile",
  "footer.rights": "All rights reserved.",
  "footer.badge": "Multi-Tenant Education SaaS",

  // Login
  "login.benefit1": "School management on a single platform",
  "login.benefit2": "AI-powered education processes",
  "login.benefit3": "One experience for parents, students, teachers and management",
  "login.heroLine": "Türkiye's AI-Powered Education Operating System",
  "login.cardTitle": "{product} Sign In",
  "login.subtitleDefault": "Sign in to your account.",
  "login.subtitleAdmin": "Sign in to your school management dashboard.",
  "login.subtitleTeacher": "Sign in to your teacher portal.",
  "login.subtitleParent": "Sign in to your parent portal.",
  "login.subtitleStudent": "Sign in to your student portal.",
  "login.schoolPrefix": "School: {school}",
  "login.identifierLabel": "Email or Phone",
  "login.identifierPlaceholder": "example@school.com or 05xx...",
  "login.passwordLabel": "Password",
  "login.rememberMe": "Remember me",
  "login.forgotPassword": "Forgot password",
  "login.submitting": "Signing in...",
  "login.submit": "Sign in",
  "login.demoTitle": "Demo Logins (Firebase not connected)",
  "login.demoSuper": "Super Admin Demo",
  "login.demoAdmin": "School Management Demo",
  "login.demoTeacher": "Teacher Demo",
  "login.demoParent": "Parent Demo",
  "login.demoStudent": "Student Demo",
  "login.codeQuestion": "Are you a student or parent?",
  "login.codeLink": "Sign in with a code",
  "login.registerQuestion": "Are you a prospective parent?",
  "login.registerLink": "Create an account",
  "login.demoQuestion": "To bring your school onto the system,",
  "login.demoLink": "request a demo",
  "login.browseQuestion": "Without signing up,",
  "login.browseLink": "explore schools and scholarships",
  "login.errForgotEmail": "Please enter your email address first to reset your password.",
  "login.msgResetSent": "A password reset link has been sent to your email (if it exists).",
  "login.errResetFailed": "Could not send the reset email.",
  "login.errFirebase":
    "The sign-in system is currently not connected (Firebase configuration not found). If you are developing, check the NEXT_PUBLIC_FIREBASE_* values in .env.local and restart the server.",
  "login.errEmailOnly": "Please sign in with your email address (e.g. name@school.com).",
  "login.errNoProfile":
    "Your authorization profile was not found. Please contact your system administrator.",
};

export const dictionaries: Record<Locale, Dict> = {
  tr: Object.assign({}, ...ZONE_TR, tr),
  en: Object.assign({}, ...ZONE_EN, en),
};

/** Basit {değişken} enterpolasyonu uygular. */
function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

/**
 * Bir anahtarı verilen dile çevirir. EN'de yoksa TR'ye, o da yoksa anahtara düşer.
 */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const value = dictionaries[locale]?.[key] ?? dictionaries.tr[key] ?? key;
  return interpolate(value, vars);
}

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>,
) => string;
