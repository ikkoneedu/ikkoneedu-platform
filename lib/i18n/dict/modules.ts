/**
 * Modül kataloğu sözlüğü (TR/EN) — `lib/modules/module-catalog.ts` ile eşleşir.
 * Anahtar deseni: modules.<moduleId>.{name,short,sales}, modules.cat.<category>.
 */

export const tr = {
  // Kategori etiketleri
  "modules.cat.growth": "Büyüme & Tanıtım",
  "modules.cat.schoolLife": "Okul Yaşamı",
  "modules.cat.academic": "Akademik",
  "modules.cat.operations": "Operasyon & Yönetim",
  "modules.cat.communication": "İletişim",
  "modules.cat.ai": "Yapay Zekâ",

  // Durum etiketleri
  "modules.status.live": "Aktif",
  "modules.status.pilot": "Pilot",
  "modules.status.comingSoon": "Yakında",
  "modules.status.aiReady": "AI Hazır",
  "modules.status.locked": "Kilitli",

  // ModuleGuard (kilitli durum kartı)
  "modules.guard.lockedTitle": "Bu modül paketinize dahil değil",
  "modules.guard.lockedBody": "Bu özelliği etkinleştirmek için okul yöneticinizle veya satış ekibiyle görüşün.",
  "modules.guard.comingSoonTitle": "Bu modül yakında",
  "modules.guard.comingSoonBody": "Bu özellik hazırlanıyor; çok yakında kullanımınıza açılacak.",
  "modules.guard.contactSales": "Satış ile görüş",

  // Modül yetki önizleme (SaaS Admin — salt okunur)
  "modules.preview.title": "Modül Yetkileri (Önizleme)",
  "modules.preview.desc": "Seçilen okulun paketine ve override'larına göre hangi modüllerin açık olduğunu salt okunur gösterir.",
  "modules.preview.selectTenant": "Okul seç",
  "modules.preview.package": "Paket",
  "modules.preview.colModule": "Modül",
  "modules.preview.colStatus": "Durum",
  "modules.preview.colSource": "Kaynak",
  "modules.preview.enabledCount": "{count} / {total} modül açık",
  "modules.preview.empty": "Önizlemek için bir okul seçin.",
  "modules.preview.loading": "Yükleniyor…",
  "modules.preview.source.core": "Temel (daima açık)",
  "modules.preview.source.package": "Pakete dahil",
  "modules.preview.source.package-excluded": "Paket dışı",
  "modules.preview.source.override-on": "Override: açık",
  "modules.preview.source.override-off": "Override: kapalı",

  // Modüller
  "modules.admissions.name": "Kayıt & Aday Hunisi",
  "modules.admissions.short": "Aday velileri CRM hunisinde topla, takip et ve kayda çevir.",
  "modules.admissions.sales": "Daha fazla kayıt, daha az kayıp aday.",

  "modules.socialStudio.name": "Sosyal Medya AI Stüdyo",
  "modules.socialStudio.short": "Okulun için sosyal medya gönderi taslakları üret.",
  "modules.socialStudio.sales": "Tanıtım ekibin gibi çalışan AI içerik stüdyosu.",

  "modules.events.name": "Etkinlik & Takvim",
  "modules.events.short": "Okul etkinliklerini planla, duyur ve takvimde paylaş.",
  "modules.events.sales": "Tüm okul tek takvimde.",

  "modules.certificates.name": "Sertifika & Belge",
  "modules.certificates.short": "Başarı sertifikası ve katılım belgesi üret, QR ile doğrula.",
  "modules.certificates.sales": "Tek tıkla profesyonel belge.",

  "modules.exams.name": "Sınav & Burs Sistemi",
  "modules.exams.short": "Burs/kayıt sınavlarını başvuru, gözetim ve sonuçla yönet.",
  "modules.exams.sales": "Burs sınavından kayda uçtan uca süreç.",

  "modules.hiring.name": "İK & İşe Alım",
  "modules.hiring.short": "Öğretmen ve personel ilanlarını, başvuruları yönet.",
  "modules.hiring.sales": "Doğru öğretmeni daha hızlı bul.",

  "modules.parentCommunication.name": "Veli İletişimi",
  "modules.parentCommunication.short": "Veli görüşme talepleri, duyuru ve mesajlaşma.",
  "modules.parentCommunication.sales": "Velilerle güçlü, kayıtlı iletişim.",

  "modules.website.name": "Okul Web Sitesi",
  "modules.website.short": "Okula özel logo, slogan ve marka renkli halka açık sayfa.",
  "modules.website.sales": "Her okul kendi markasıyla.",

  "modules.reports.name": "Raporlar & Analitik",
  "modules.reports.short": "Yönetim için özet gösterge ve raporlar.",
  "modules.reports.sales": "Karar verirken net veri.",

  "modules.finance.name": "Finans & Ödemeler",
  "modules.finance.short": "Öğrenci bazlı ödeme/tahakkuk takibi.",
  "modules.finance.sales": "Tahsilatı tek ekrandan takip et.",

  "modules.counseling.name": "Rehberlik (PDR)",
  "modules.counseling.short": "Öğrenci görüşme notları — yalnız yetkili personel.",
  "modules.counseling.sales": "Hassas PDR verisi güvende.",

  "modules.messages.name": "Mesaj Merkezi",
  "modules.messages.short": "Uygulama içi mesajlaşma ve gelen kutusu.",
  "modules.messages.sales": "Tüm iletişim tek merkezde.",

  "modules.notifications.name": "Bildirimler",
  "modules.notifications.short": "Duyuru ve sistem bildirimleri.",
  "modules.notifications.sales": "Hiçbir şeyi kaçırma.",

  "modules.aiBrain.name": "AI Beyin",
  "modules.aiBrain.short": "Okul verisi üzerinde yapay zekâ asistanı.",
  "modules.aiBrain.sales": "Okulunun dijital beyni.",

  "modules.schedulerAi.name": "Ders Programı AI",
  "modules.schedulerAi.short": "Ders programını yapay zekâ ile oluştur.",
  "modules.schedulerAi.sales": "Çakışmasız program, saniyeler içinde.",

  "modules.examAi.name": "Sınav AI",
  "modules.examAi.short": "Yapay zekâ ile soru ve sınav üretimi.",
  "modules.examAi.sales": "Sınav hazırlığı dakikalara insin.",

  "modules.reportCardAi.name": "Karne AI",
  "modules.reportCardAi.short": "Yapay zekâ destekli karne yorumları.",
  "modules.reportCardAi.sales": "Kişiselleştirilmiş karne yorumu.",
} as const;

export const en = {
  "modules.cat.growth": "Growth & Marketing",
  "modules.cat.schoolLife": "School Life",
  "modules.cat.academic": "Academic",
  "modules.cat.operations": "Operations & Management",
  "modules.cat.communication": "Communication",
  "modules.cat.ai": "Artificial Intelligence",

  "modules.status.live": "Active",
  "modules.status.pilot": "Pilot",
  "modules.status.comingSoon": "Coming soon",
  "modules.status.aiReady": "AI ready",
  "modules.status.locked": "Locked",

  "modules.guard.lockedTitle": "This module is not in your plan",
  "modules.guard.lockedBody": "Talk to your school administrator or the sales team to enable this feature.",
  "modules.guard.comingSoonTitle": "This module is coming soon",
  "modules.guard.comingSoonBody": "This feature is being prepared and will be available very soon.",
  "modules.guard.contactSales": "Contact sales",

  "modules.preview.title": "Module Entitlements (Preview)",
  "modules.preview.desc": "A read-only view of which modules are enabled for the selected school based on its plan and overrides.",
  "modules.preview.selectTenant": "Select school",
  "modules.preview.package": "Plan",
  "modules.preview.colModule": "Module",
  "modules.preview.colStatus": "Status",
  "modules.preview.colSource": "Source",
  "modules.preview.enabledCount": "{count} / {total} modules enabled",
  "modules.preview.empty": "Select a school to preview.",
  "modules.preview.loading": "Loading…",
  "modules.preview.source.core": "Core (always on)",
  "modules.preview.source.package": "Included in plan",
  "modules.preview.source.package-excluded": "Not in plan",
  "modules.preview.source.override-on": "Override: on",
  "modules.preview.source.override-off": "Override: off",

  "modules.admissions.name": "Admissions & Lead Funnel",
  "modules.admissions.short": "Capture prospective parents in a CRM funnel and convert them to enrolments.",
  "modules.admissions.sales": "More enrolments, fewer lost leads.",

  "modules.socialStudio.name": "Social Media AI Studio",
  "modules.socialStudio.short": "Generate social media post drafts for your school.",
  "modules.socialStudio.sales": "An AI content studio that works like your marketing team.",

  "modules.events.name": "Events & Calendar",
  "modules.events.short": "Plan, announce and share school events on a shared calendar.",
  "modules.events.sales": "The whole school on one calendar.",

  "modules.certificates.name": "Certificates & Documents",
  "modules.certificates.short": "Produce achievement and attendance certificates, verify by QR.",
  "modules.certificates.sales": "Professional documents in one click.",

  "modules.exams.name": "Exam & Scholarship System",
  "modules.exams.short": "Run scholarship/admission exams from application to proctoring and results.",
  "modules.exams.sales": "End-to-end from scholarship exam to enrolment.",

  "modules.hiring.name": "HR & Hiring",
  "modules.hiring.short": "Manage teacher and staff postings and applications.",
  "modules.hiring.sales": "Find the right teacher faster.",

  "modules.parentCommunication.name": "Parent Communication",
  "modules.parentCommunication.short": "Parent meeting requests, announcements and messaging.",
  "modules.parentCommunication.sales": "Strong, logged communication with parents.",

  "modules.website.name": "School Website",
  "modules.website.short": "A public page with the school's own logo, slogan and brand colour.",
  "modules.website.sales": "Every school under its own brand.",

  "modules.reports.name": "Reports & Analytics",
  "modules.reports.short": "Summary dashboards and reports for management.",
  "modules.reports.sales": "Clear data when you decide.",

  "modules.finance.name": "Finance & Payments",
  "modules.finance.short": "Per-student payment and accrual tracking.",
  "modules.finance.sales": "Track collections from one screen.",

  "modules.counseling.name": "Counseling (Guidance)",
  "modules.counseling.short": "Student counseling notes — authorised staff only.",
  "modules.counseling.sales": "Sensitive counseling data kept safe.",

  "modules.messages.name": "Message Center",
  "modules.messages.short": "In-app messaging and inbox.",
  "modules.messages.sales": "All communication in one place.",

  "modules.notifications.name": "Notifications",
  "modules.notifications.short": "Announcements and system notifications.",
  "modules.notifications.sales": "Never miss a thing.",

  "modules.aiBrain.name": "AI Brain",
  "modules.aiBrain.short": "An AI assistant over your school's data.",
  "modules.aiBrain.sales": "Your school's digital brain.",

  "modules.schedulerAi.name": "Scheduler AI",
  "modules.schedulerAi.short": "Build the timetable with AI.",
  "modules.schedulerAi.sales": "Conflict-free timetable in seconds.",

  "modules.examAi.name": "Exam AI",
  "modules.examAi.short": "AI question and exam generation.",
  "modules.examAi.sales": "Cut exam prep down to minutes.",

  "modules.reportCardAi.name": "Report Card AI",
  "modules.reportCardAi.short": "AI-assisted report-card comments.",
  "modules.reportCardAi.sales": "Personalised report-card comments.",
} as const;
