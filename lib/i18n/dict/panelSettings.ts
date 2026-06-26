/** panelSettings paneli çeviri anahtarları. tr kaynak; en eşleşir. */
export const tr: Record<string, string> = {
  // Sayfa / metadata
  "panelSettings.meta.title": "Sistem Ayarları — {product}",
  "panelSettings.meta.description":
    "Okul yapılandırması, bağlantı durumu ve veri yedekleme tek merkezden.",
  "panelSettings.page.title": "Sistem Ayarları",
  "panelSettings.header.eyebrow": "Yönetim",
  "panelSettings.header.title": "Sistem Ayarları",
  "panelSettings.header.description":
    "Okul yapılandırmasını, Firebase bağlantı durumunu ve veri yedeklemeyi yönetin. (Rol/güvenlik/AI ayar panelleri ilgili fazlarda eklenecek.)",

  // Kategori navigasyonu
  "panelSettings.category.school": "Okul Ayarları",
  "panelSettings.category.brand": "Marka Kimliği",
  "panelSettings.category.connection": "Bağlantı",
  "panelSettings.category.data": "Veri",

  // LiveSettings — bölüm başlıkları
  "panelSettings.live.section.school": "Okul Bilgileri",
  "panelSettings.live.section.academic": "Akademik Ayarlar",
  "panelSettings.live.section.scholarship": "Bursluluk Ayarları",
  "panelSettings.live.section.timetable": "Ders Programı Ayarları",

  // LiveSettings — okul alanları
  "panelSettings.live.field.name": "Okul Adı",
  "panelSettings.live.field.logoUrl": "Logo URL",
  "panelSettings.live.field.primaryColor": "Kurumsal Renk",
  "panelSettings.live.field.accentColor": "Vurgu Rengi",
  "panelSettings.live.field.phone": "Telefon",
  "panelSettings.live.field.email": "E-posta",
  "panelSettings.live.field.address": "Adres",
  "panelSettings.live.field.website": "Web Sitesi",

  // LiveSettings — akademik alanları
  "panelSettings.live.field.academicYear": "Eğitim Yılı",
  "panelSettings.live.field.term": "Dönem",
  "panelSettings.live.field.gradeLevels": "Sınıf Seviyeleri (ör. 1-12)",

  // LiveSettings — bursluluk alanları
  "panelSettings.live.field.examDate": "Sınav Tarihi",
  "panelSettings.live.field.applicationDeadline": "Son Başvuru",
  "panelSettings.live.field.quota": "Kontenjan",
  "panelSettings.live.field.applicationPrefix": "Başvuru No Ön Eki (ör. IKK)",

  // LiveSettings — ders programı alanları
  "panelSettings.live.field.lessonStart": "İlk Ders Saati",
  "panelSettings.live.field.lessonDuration": "Ders Süresi (dk)",
  "panelSettings.live.field.breakDuration": "Teneffüs (dk)",
  "panelSettings.live.field.days": "Gün Yapısı",

  // LiveSettings — durum / aksiyon
  "panelSettings.live.unavailable.title": "Canlı ayarlar kullanılamıyor",
  "panelSettings.live.unavailable.body":
    "Ayarların Firestore’a kaydedilebilmesi için giriş yapmış bir okul hesabı ve aktif Firebase yapılandırması gerekir.",
  "panelSettings.live.saved": "Kaydedildi",
  "panelSettings.live.save": "Kaydet",
  "panelSettings.live.saving": "Kaydediliyor…",

  // FirebaseStatusCard
  "panelSettings.firebase.title": "Firebase Bağlantısı",
  "panelSettings.firebase.ready.title": "Bağlantıya Hazır",
  "panelSettings.firebase.mock.title": "Mock Mod",
  "panelSettings.firebase.ready.body":
    "Firebase ortam değişkenleri tanımlı. Auth ve Firestore bağlantısı kurulabilir; formlar Firestore'a yazmaya hazırdır.",
  "panelSettings.firebase.mock.body":
    "Firebase ortam değişkenleri tanımlı değil. Formlar mock modda çalışır: kullanıcıya başarı mesajı gösterilir, Firestore'a yazılmaz.",
  "panelSettings.firebase.badge.ready": "Hazır",
  "panelSettings.firebase.badge.mock": "Mock",

  // DataBackupSettings
  "panelSettings.backup.title": "Veri Yönetimi",
  "panelSettings.backup.item.daily": "Günlük Yedekleme",
  "panelSettings.backup.item.weekly": "Haftalık Yedekleme",
  "panelSettings.backup.item.export": "Veri Dışa Aktarma",
  "panelSettings.backup.item.logArchive": "Log Arşivi",
  "panelSettings.backup.item.isolation": "Okul Bazlı Veri İzolasyonu",
  "panelSettings.backup.item.recovery": "Silinen Veri Kurtarma",
  "panelSettings.backup.backup.idle": "Yedek Al (JSON)",
  "panelSettings.backup.backup.busy": "Hazırlanıyor…",
  "panelSettings.backup.export.idle": "Verileri Dışa Aktar",
  "panelSettings.backup.export.busy": "Hazırlanıyor…",
  "panelSettings.backup.inspectLogs": "Logları İncele",
  "panelSettings.backup.success":
    "İndirildi: {schools} okul, {users} kullanıcı{logs}.",
  "panelSettings.backup.success.logs": ", {count} log",
  "panelSettings.backup.error": "Dışa aktarma başarısız. Yetki/erişim kontrol edin.",
  "panelSettings.backup.restricted":
    "Canlı yedek/dışa aktarma yalnızca giriş yapmış bir süper admin hesabıyla ve Firebase aktifken kullanılabilir.",

  // SchoolBrandingEditor
  "panelSettings.brand.title": "Okul Marka Kimliği",
  "panelSettings.brand.subtitle":
    "Logo, slogan, marka rengi ve tanıtım metni — public okul sayfanızda görünür.",
  "panelSettings.brand.viewPage": "Sayfayı gör",
  "panelSettings.brand.loading": "Yükleniyor…",
  "panelSettings.brand.logo.label": "Logo Bağlantısı (URL)",
  "panelSettings.brand.logo.placeholder": "https://…/logo.png",
  "panelSettings.brand.slogan.label": "Slogan",
  "panelSettings.brand.slogan.placeholder": "Geleceğe açılan kapı",
  "panelSettings.brand.color.label": "Marka Rengi",
  "panelSettings.brand.about.label": "Tanıtım Metni",
  "panelSettings.brand.about.placeholder": "Okulunuzu kısaca tanıtın…",
  "panelSettings.brand.logoError":
    "Logo bağlantısı http(s) ile başlamalı (veya boş bırakın).",
  "panelSettings.brand.saved": "Marka kimliği kaydedildi.",
  "panelSettings.brand.save": "Kaydet",
  "panelSettings.brand.saving": "Kaydediliyor…",
  "panelSettings.brand.preview.schoolName": "Okul Adı",
  "panelSettings.brand.preview.cta": "Okul Portalına Giriş",
  "panelSettings.brand.preview.label": "Önizleme",
};

export const en: Record<string, string> = {
  // Page / metadata
  "panelSettings.meta.title": "System Settings — {product}",
  "panelSettings.meta.description":
    "School configuration, connection status, and data backup in one place.",
  "panelSettings.page.title": "System Settings",
  "panelSettings.header.eyebrow": "Administration",
  "panelSettings.header.title": "System Settings",
  "panelSettings.header.description":
    "Manage school configuration, Firebase connection status, and data backup. (Role/security/AI settings panels will be added in their respective phases.)",

  // Category navigation
  "panelSettings.category.school": "School Settings",
  "panelSettings.category.brand": "Brand Identity",
  "panelSettings.category.connection": "Connection",
  "panelSettings.category.data": "Data",

  // LiveSettings — section titles
  "panelSettings.live.section.school": "School Information",
  "panelSettings.live.section.academic": "Academic Settings",
  "panelSettings.live.section.scholarship": "Scholarship Settings",
  "panelSettings.live.section.timetable": "Class Schedule Settings",

  // LiveSettings — school fields
  "panelSettings.live.field.name": "School Name",
  "panelSettings.live.field.logoUrl": "Logo URL",
  "panelSettings.live.field.primaryColor": "Corporate Color",
  "panelSettings.live.field.accentColor": "Accent Color",
  "panelSettings.live.field.phone": "Phone",
  "panelSettings.live.field.email": "Email",
  "panelSettings.live.field.address": "Address",
  "panelSettings.live.field.website": "Website",

  // LiveSettings — academic fields
  "panelSettings.live.field.academicYear": "Academic Year",
  "panelSettings.live.field.term": "Term",
  "panelSettings.live.field.gradeLevels": "Grade Levels (e.g. 1-12)",

  // LiveSettings — scholarship fields
  "panelSettings.live.field.examDate": "Exam Date",
  "panelSettings.live.field.applicationDeadline": "Application Deadline",
  "panelSettings.live.field.quota": "Quota",
  "panelSettings.live.field.applicationPrefix": "Application No. Prefix (e.g. IKK)",

  // LiveSettings — timetable fields
  "panelSettings.live.field.lessonStart": "First Lesson Time",
  "panelSettings.live.field.lessonDuration": "Lesson Duration (min)",
  "panelSettings.live.field.breakDuration": "Break (min)",
  "panelSettings.live.field.days": "Day Structure",

  // LiveSettings — status / action
  "panelSettings.live.unavailable.title": "Live settings unavailable",
  "panelSettings.live.unavailable.body":
    "Saving settings to Firestore requires a signed-in school account and an active Firebase configuration.",
  "panelSettings.live.saved": "Saved",
  "panelSettings.live.save": "Save",
  "panelSettings.live.saving": "Saving…",

  // FirebaseStatusCard
  "panelSettings.firebase.title": "Firebase Connection",
  "panelSettings.firebase.ready.title": "Ready to Connect",
  "panelSettings.firebase.mock.title": "Mock Mode",
  "panelSettings.firebase.ready.body":
    "Firebase environment variables are defined. Auth and Firestore connections can be established; forms are ready to write to Firestore.",
  "panelSettings.firebase.mock.body":
    "Firebase environment variables are not defined. Forms run in mock mode: a success message is shown to the user, but nothing is written to Firestore.",
  "panelSettings.firebase.badge.ready": "Ready",
  "panelSettings.firebase.badge.mock": "Mock",

  // DataBackupSettings
  "panelSettings.backup.title": "Data Management",
  "panelSettings.backup.item.daily": "Daily Backup",
  "panelSettings.backup.item.weekly": "Weekly Backup",
  "panelSettings.backup.item.export": "Data Export",
  "panelSettings.backup.item.logArchive": "Log Archive",
  "panelSettings.backup.item.isolation": "School-Based Data Isolation",
  "panelSettings.backup.item.recovery": "Deleted Data Recovery",
  "panelSettings.backup.backup.idle": "Create Backup (JSON)",
  "panelSettings.backup.backup.busy": "Preparing…",
  "panelSettings.backup.export.idle": "Export Data",
  "panelSettings.backup.export.busy": "Preparing…",
  "panelSettings.backup.inspectLogs": "Inspect Logs",
  "panelSettings.backup.success":
    "Downloaded: {schools} schools, {users} users{logs}.",
  "panelSettings.backup.success.logs": ", {count} logs",
  "panelSettings.backup.error": "Export failed. Check permissions/access.",
  "panelSettings.backup.restricted":
    "Live backup/export is only available with a signed-in super admin account and Firebase active.",

  // SchoolBrandingEditor
  "panelSettings.brand.title": "School Brand Identity",
  "panelSettings.brand.subtitle":
    "Logo, slogan, brand color, and intro text — shown on your public school page.",
  "panelSettings.brand.viewPage": "View page",
  "panelSettings.brand.loading": "Loading…",
  "panelSettings.brand.logo.label": "Logo Link (URL)",
  "panelSettings.brand.logo.placeholder": "https://…/logo.png",
  "panelSettings.brand.slogan.label": "Slogan",
  "panelSettings.brand.slogan.placeholder": "The gateway to the future",
  "panelSettings.brand.color.label": "Brand Color",
  "panelSettings.brand.about.label": "Intro Text",
  "panelSettings.brand.about.placeholder": "Briefly introduce your school…",
  "panelSettings.brand.logoError":
    "Logo link must start with http(s) (or leave it empty).",
  "panelSettings.brand.saved": "Brand identity saved.",
  "panelSettings.brand.save": "Save",
  "panelSettings.brand.saving": "Saving…",
  "panelSettings.brand.preview.schoolName": "School Name",
  "panelSettings.brand.preview.cta": "Enter School Portal",
  "panelSettings.brand.preview.label": "Preview",
};
