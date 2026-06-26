/** panelCrm paneli çeviri anahtarları. tr kaynak; en eşleşir. */
export const tr: Record<string, string> = {
  // Sayfa / metadata
  "panelCrm.meta.title": "CRM & Lead Yönetimi — {product}",
  "panelCrm.meta.description":
    "Aday velileri, görüşmeleri ve kayıt süreçlerini tek merkezden yönetin.",
  "panelCrm.page.title": "CRM & Lead Yönetimi",
  "panelCrm.header.eyebrow": "Satış & Kayıt",
  "panelCrm.header.title": "CRM & Lead Yönetimi",
  "panelCrm.header.description":
    "Aday velileri, görüşmeleri ve kayıt süreçlerini tek merkezden yönetin.",
  "panelCrm.quickActions.title": "Hızlı İşlemler",

  // Metrikler
  "panelCrm.metrics.totalLead": "Toplam Lead",
  "panelCrm.metrics.newLead": "Yeni Lead",
  "panelCrm.metrics.totalAppointment": "Toplam Randevu",
  "panelCrm.metrics.scheduledAppointment": "Planlı Randevu",
  "panelCrm.metrics.won": "Kazanılan",
  "panelCrm.metrics.lost": "Kaybedilen",

  // Lead durumları
  "panelCrm.leadStatus.new": "Yeni",
  "panelCrm.leadStatus.contacted": "İletişime geçildi",
  "panelCrm.leadStatus.meeting_scheduled": "Toplantı planlandı",
  "panelCrm.leadStatus.proposal_sent": "Teklif gönderildi",
  "panelCrm.leadStatus.won": "Kazanıldı",
  "panelCrm.leadStatus.lost": "Kaybedildi",

  // Pipeline
  "panelCrm.pipeline.title": "Lead Pipeline",
  "panelCrm.pipeline.refresh": "Yenile",
  "panelCrm.pipeline.loading": "Yükleniyor…",
  "panelCrm.pipeline.empty": "Henüz lead yok. Yukarıdaki formdan ekleyebilirsiniz.",

  // Lead kaynakları
  "panelCrm.sources.title": "Lead Kaynakları",
  "panelCrm.sources.other": "Diğer",
  "panelCrm.sources.loading": "Yükleniyor…",
  "panelCrm.sources.empty": "Henüz lead yok; kaynak dağılımı görüntülenemiyor.",
  "panelCrm.sources.count": "{count} lead · ",

  // Yeni lead formu
  "panelCrm.newLead.title": "Yeni Lead Ekle",
  "panelCrm.newLead.fullName": "Ad Soyad",
  "panelCrm.newLead.fullNamePlaceholder": "Aday veli",
  "panelCrm.newLead.phone": "Telefon",
  "panelCrm.newLead.phonePlaceholder": "0 5xx xxx xx xx",
  "panelCrm.newLead.email": "E-posta",
  "panelCrm.newLead.emailPlaceholder": "ornek@eposta.com",
  "panelCrm.newLead.source": "Kaynak",
  "panelCrm.newLead.note": "Not",
  "panelCrm.newLead.notePlaceholder": "Görüşme notu, ilgi alanı vb.",
  "panelCrm.newLead.success": "Lead başarıyla eklendi.",
  "panelCrm.newLead.error": "Lead kaydedilemedi. Lütfen tekrar deneyin.",
  "panelCrm.newLead.submit": "Lead Ekle",
  "panelCrm.newLead.submitting": "Kaydediliyor...",
  "panelCrm.newLead.sourceWebsite": "Web Sitesi",
  "panelCrm.newLead.sourcePhone": "Telefon",
  "panelCrm.newLead.sourceWhatsApp": "WhatsApp",
  "panelCrm.newLead.sourceReferral": "Referans",
  "panelCrm.newLead.sourceSocialMedia": "Sosyal Medya",
  "panelCrm.newLead.sourceEvent": "Etkinlik",

  // Gelen kutusu
  "panelCrm.inbox.scholarshipTitle": "Bursluluk Başvuruları",
  "panelCrm.inbox.scholarshipEmpty": "Henüz başvuru yok.",
  "panelCrm.inbox.parent": "Veli: {name} · {contact}",
  "panelCrm.inbox.leadsTitle": "Lead'ler",
  "panelCrm.inbox.leadsEmpty": "Henüz lead yok.",
  "panelCrm.inbox.inquiriesTitle": "Aday Bilgi Talepleri",
  "panelCrm.inbox.inquiriesEmpty": "Portaldan gelen aday talebi yok.",
  "panelCrm.inbox.newBadge": "{count} yeni",
  "panelCrm.inbox.dash": "—",

  // CRM durum seçici
  "panelCrm.crmStatus.new": "Yeni",
  "panelCrm.crmStatus.contacted": "İletişime geçildi",
  "panelCrm.crmStatus.qualified": "Nitelikli",
  "panelCrm.crmStatus.converted": "Kayıt oldu",
  "panelCrm.crmStatus.lost": "Kaybedildi",
  "panelCrm.crmStatus.ariaLabel": "Durum değiştir",

  // Kayda dönüştür
  "panelCrm.convert.studentCode": "Öğrenci kodu",
  "panelCrm.convert.parentCode": "Veli kodu",
  "panelCrm.convert.action": "Kayda Dönüştür",
  "panelCrm.convert.busy": "Dönüştürülüyor…",
  "panelCrm.convert.close": "Kapat",
  "panelCrm.convert.copy": "{label} kopyala",

  // Randevu yönetimi
  "panelCrm.appointments.title": "Randevular (canlı)",
  "panelCrm.appointments.refresh": "Yenile",
  "panelCrm.appointments.exportFilename": "randevular",
  "panelCrm.appointments.exportTitle": "Randevular",
  "panelCrm.appointments.colDate": "Tarih",
  "panelCrm.appointments.colTime": "Saat",
  "panelCrm.appointments.colParent": "Veli",
  "panelCrm.appointments.colStudent": "Öğrenci",
  "panelCrm.appointments.colPhone": "Telefon",
  "panelCrm.appointments.colStatus": "Durum",
  "panelCrm.appointments.requiredError": "Veli adı ve tarih zorunludur.",
  "panelCrm.appointments.parent": "Veli",
  "panelCrm.appointments.parentPlaceholder": "Ad Soyad",
  "panelCrm.appointments.student": "Öğrenci",
  "panelCrm.appointments.studentPlaceholder": "Ad Soyad",
  "panelCrm.appointments.phone": "Telefon",
  "panelCrm.appointments.phonePlaceholder": "0 5xx…",
  "panelCrm.appointments.date": "Tarih",
  "panelCrm.appointments.time": "Saat",
  "panelCrm.appointments.add": "Ekle",
  "panelCrm.appointments.adding": "…",
  "panelCrm.appointments.loading": "Yükleniyor…",
  "panelCrm.appointments.empty": "Henüz randevu yok.",
  "panelCrm.appointments.statusAriaLabel": "Durum değiştir",
  "panelCrm.appointmentStatus.SCHEDULED": "Planlandı",
  "panelCrm.appointmentStatus.VISITED": "Geldi",
  "panelCrm.appointmentStatus.CANCELLED": "İptal",
};

export const en: Record<string, string> = {
  // Page / metadata
  "panelCrm.meta.title": "CRM & Lead Management — {product}",
  "panelCrm.meta.description":
    "Manage prospective parents, meetings and enrollment processes from a single hub.",
  "panelCrm.page.title": "CRM & Lead Management",
  "panelCrm.header.eyebrow": "Sales & Enrollment",
  "panelCrm.header.title": "CRM & Lead Management",
  "panelCrm.header.description":
    "Manage prospective parents, meetings and enrollment processes from a single hub.",
  "panelCrm.quickActions.title": "Quick Actions",

  // Metrics
  "panelCrm.metrics.totalLead": "Total Leads",
  "panelCrm.metrics.newLead": "New Leads",
  "panelCrm.metrics.totalAppointment": "Total Appointments",
  "panelCrm.metrics.scheduledAppointment": "Scheduled Appointments",
  "panelCrm.metrics.won": "Won",
  "panelCrm.metrics.lost": "Lost",

  // Lead statuses
  "panelCrm.leadStatus.new": "New",
  "panelCrm.leadStatus.contacted": "Contacted",
  "panelCrm.leadStatus.meeting_scheduled": "Meeting scheduled",
  "panelCrm.leadStatus.proposal_sent": "Proposal sent",
  "panelCrm.leadStatus.won": "Won",
  "panelCrm.leadStatus.lost": "Lost",

  // Pipeline
  "panelCrm.pipeline.title": "Lead Pipeline",
  "panelCrm.pipeline.refresh": "Refresh",
  "panelCrm.pipeline.loading": "Loading…",
  "panelCrm.pipeline.empty": "No leads yet. You can add one using the form above.",

  // Lead sources
  "panelCrm.sources.title": "Lead Sources",
  "panelCrm.sources.other": "Other",
  "panelCrm.sources.loading": "Loading…",
  "panelCrm.sources.empty": "No leads yet; source breakdown unavailable.",
  "panelCrm.sources.count": "{count} leads · ",

  // New lead form
  "panelCrm.newLead.title": "Add New Lead",
  "panelCrm.newLead.fullName": "Full Name",
  "panelCrm.newLead.fullNamePlaceholder": "Prospective parent",
  "panelCrm.newLead.phone": "Phone",
  "panelCrm.newLead.phonePlaceholder": "0 5xx xxx xx xx",
  "panelCrm.newLead.email": "Email",
  "panelCrm.newLead.emailPlaceholder": "example@email.com",
  "panelCrm.newLead.source": "Source",
  "panelCrm.newLead.note": "Note",
  "panelCrm.newLead.notePlaceholder": "Meeting note, area of interest, etc.",
  "panelCrm.newLead.success": "Lead added successfully.",
  "panelCrm.newLead.error": "Could not save the lead. Please try again.",
  "panelCrm.newLead.submit": "Add Lead",
  "panelCrm.newLead.submitting": "Saving...",
  "panelCrm.newLead.sourceWebsite": "Website",
  "panelCrm.newLead.sourcePhone": "Phone",
  "panelCrm.newLead.sourceWhatsApp": "WhatsApp",
  "panelCrm.newLead.sourceReferral": "Referral",
  "panelCrm.newLead.sourceSocialMedia": "Social Media",
  "panelCrm.newLead.sourceEvent": "Event",

  // Inbox
  "panelCrm.inbox.scholarshipTitle": "Scholarship Applications",
  "panelCrm.inbox.scholarshipEmpty": "No applications yet.",
  "panelCrm.inbox.parent": "Parent: {name} · {contact}",
  "panelCrm.inbox.leadsTitle": "Leads",
  "panelCrm.inbox.leadsEmpty": "No leads yet.",
  "panelCrm.inbox.inquiriesTitle": "Prospect Information Requests",
  "panelCrm.inbox.inquiriesEmpty": "No prospect requests from the portal.",
  "panelCrm.inbox.newBadge": "{count} new",
  "panelCrm.inbox.dash": "—",

  // CRM status select
  "panelCrm.crmStatus.new": "New",
  "panelCrm.crmStatus.contacted": "Contacted",
  "panelCrm.crmStatus.qualified": "Qualified",
  "panelCrm.crmStatus.converted": "Enrolled",
  "panelCrm.crmStatus.lost": "Lost",
  "panelCrm.crmStatus.ariaLabel": "Change status",

  // Convert to student
  "panelCrm.convert.studentCode": "Student code",
  "panelCrm.convert.parentCode": "Parent code",
  "panelCrm.convert.action": "Convert to Enrollment",
  "panelCrm.convert.busy": "Converting…",
  "panelCrm.convert.close": "Close",
  "panelCrm.convert.copy": "Copy {label}",

  // Appointment manager
  "panelCrm.appointments.title": "Appointments (live)",
  "panelCrm.appointments.refresh": "Refresh",
  "panelCrm.appointments.exportFilename": "appointments",
  "panelCrm.appointments.exportTitle": "Appointments",
  "panelCrm.appointments.colDate": "Date",
  "panelCrm.appointments.colTime": "Time",
  "panelCrm.appointments.colParent": "Parent",
  "panelCrm.appointments.colStudent": "Student",
  "panelCrm.appointments.colPhone": "Phone",
  "panelCrm.appointments.colStatus": "Status",
  "panelCrm.appointments.requiredError": "Parent name and date are required.",
  "panelCrm.appointments.parent": "Parent",
  "panelCrm.appointments.parentPlaceholder": "Full Name",
  "panelCrm.appointments.student": "Student",
  "panelCrm.appointments.studentPlaceholder": "Full Name",
  "panelCrm.appointments.phone": "Phone",
  "panelCrm.appointments.phonePlaceholder": "0 5xx…",
  "panelCrm.appointments.date": "Date",
  "panelCrm.appointments.time": "Time",
  "panelCrm.appointments.add": "Add",
  "panelCrm.appointments.adding": "…",
  "panelCrm.appointments.loading": "Loading…",
  "panelCrm.appointments.empty": "No appointments yet.",
  "panelCrm.appointments.statusAriaLabel": "Change status",
  "panelCrm.appointmentStatus.SCHEDULED": "Scheduled",
  "panelCrm.appointmentStatus.VISITED": "Visited",
  "panelCrm.appointmentStatus.CANCELLED": "Cancelled",
};
