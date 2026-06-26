/** panelFinance paneli çeviri anahtarları. tr kaynak; en eşleşir. */
export const tr: Record<string, string> = {
  // Finance page (meta + section)
  "panelFinance.meta.title": "Finans Merkezi — {product}",
  "panelFinance.meta.description":
    "Tahsilat, gelir, ödeme ve kayıt gelirlerini tek ekrandan takip edin.",
  "panelFinance.page.title": "Finans Merkezi",
  "panelFinance.section.eyebrow": "Finans",
  "panelFinance.section.title": "Finans Merkezi",
  "panelFinance.section.description":
    "Öğrenci bazlı tahsilatı, bakiyeyi ve ödeme durumlarını tek ekrandan yönetin.",

  // PaymentManager — unavailable
  "panelFinance.pay.unavailable.title": "Ödeme yönetimi kullanılamıyor",
  "panelFinance.pay.unavailable.body":
    "Bu bölüm yalnızca giriş yapmış bir okul yöneticisi/kurucu hesabıyla ve Firebase aktifken çalışır.",

  // PaymentManager — summary stats
  "panelFinance.pay.stat.total": "Toplam Tahakkuk",
  "panelFinance.pay.stat.collected": "Tahsil Edilen",
  "panelFinance.pay.stat.outstanding": "Bakiye",
  "panelFinance.pay.stat.overdue": "Gecikmiş",

  // PaymentManager — add form
  "panelFinance.pay.add.heading": "Tahakkuk / Ödeme Ekle",
  "panelFinance.pay.add.student": "Öğrenci",
  "panelFinance.pay.add.studentPlaceholder": "Ad Soyad",
  "panelFinance.pay.add.grade": "Sınıf",
  "panelFinance.pay.add.gradePlaceholder": "5-A",
  "panelFinance.pay.add.amount": "Tutar (₺)",
  "panelFinance.pay.add.amountPlaceholder": "25000",
  "panelFinance.pay.add.due": "Vade",
  "panelFinance.pay.add.submit": "Ekle",
  "panelFinance.pay.add.submitBusy": "Ekleniyor…",

  // PaymentManager — list
  "panelFinance.pay.list.heading": "Öğrenci Ödemeleri (canlı)",
  "panelFinance.pay.list.count": "{count} kayıt",
  "panelFinance.pay.list.refresh": "Yenile",
  "panelFinance.pay.list.exportTitle": "Öğrenci Ödemeleri",
  "panelFinance.pay.list.loading": "Yükleniyor…",
  "panelFinance.pay.list.empty": "Henüz ödeme kaydı yok. Yukarıdan ekleyin.",

  // PaymentManager — table headers
  "panelFinance.pay.col.student": "Öğrenci",
  "panelFinance.pay.col.amount": "Tutar",
  "panelFinance.pay.col.due": "Vade",
  "panelFinance.pay.col.status": "Durum",
  "panelFinance.pay.col.paid": "Ödenen",
  "panelFinance.pay.col.note": "Not",
  "panelFinance.pay.col.action": "Ödenen / İşlem",

  // PaymentManager — status labels
  "panelFinance.status.PENDING": "Bekliyor",
  "panelFinance.status.PARTIAL": "Kısmi Ödeme",
  "panelFinance.status.PAID": "Ödendi",
  "panelFinance.status.OVERDUE": "Gecikmiş",

  // PaymentManager — collect / remind
  "panelFinance.pay.collect": "Tahsil",
  "panelFinance.pay.collectBusy": "…",
  "panelFinance.pay.remind.title": "Veliye ödeme hatırlatması gönder",
  "panelFinance.pay.remind.idle": "Hatırlat",
  "panelFinance.pay.remind.busy": "…",
  "panelFinance.pay.remind.sent": "Gönderildi",

  // PaymentManager — errors
  "panelFinance.pay.error.invalidAdd": "Öğrenci adı ve geçerli bir tutar girin.",
  "panelFinance.pay.error.invalidPaid": "Geçerli bir ödenen tutar girin.",
  "panelFinance.pay.error.noParent": "Bu öğrencinin bağlı veli hesabı bulunamadı.",

  // Counseling page (meta + section + privacy)
  "panelFinance.counseling.meta.title": "Rehberlik Merkezi — {product}",
  "panelFinance.counseling.meta.description":
    "Öğrenci gelişimini, görüşme süreçlerini ve rehberlik notlarını güvenli şekilde takip edin.",
  "panelFinance.counseling.page.title": "Rehberlik Merkezi",
  "panelFinance.counseling.section.eyebrow": "Öğrenci Gelişimi",
  "panelFinance.counseling.section.title": "Rehberlik Merkezi",
  "panelFinance.counseling.section.description":
    "Öğrenci görüşme notlarını ve rehberlik kayıtlarını güvenli şekilde takip edin.",
  "panelFinance.counseling.privacy.title": "Gizlilik ve Yetki Uyarısı",
  "panelFinance.counseling.privacy.body":
    "Rehberlik kayıtları KVKK kapsamında hassas veri olarak işlenir. Bu ekrandaki öğrenci görüşme notlarına yalnızca yetkili rehberlik personeli rol bazlı erişim ile ulaşabilir. Bilgiler üçüncü kişilerle paylaşılmamalı ve gizlilik ilkelerine uygun saklanmalıdır.",

  // CounselingNotesManager — unavailable
  "panelFinance.notes.unavailable.title": "Rehberlik notları kullanılamıyor",
  "panelFinance.notes.unavailable.body":
    "Bu bölüm yalnızca giriş yapmış bir okul personeli hesabıyla ve Firebase aktifken çalışır.",

  // CounselingNotesManager — add form
  "panelFinance.notes.add.heading": "Görüşme Notu Ekle",
  "panelFinance.notes.add.student": "Öğrenci",
  "panelFinance.notes.add.studentPlaceholder": "Ad Soyad",
  "panelFinance.notes.add.tag": "Etiket",
  "panelFinance.notes.add.note": "Görüşme Notu",
  "panelFinance.notes.add.notePlaceholder": "Görüşme özetini yazın…",
  "panelFinance.notes.add.submit": "Ekle",
  "panelFinance.notes.add.submitBusy": "Ekleniyor…",

  // CounselingNotesManager — list
  "panelFinance.notes.list.heading": "Görüşme Notları (canlı)",
  "panelFinance.notes.list.refresh": "Yenile",
  "panelFinance.notes.list.exportTitle": "Rehberlik Görüşme Notları",
  "panelFinance.notes.col.student": "Öğrenci",
  "panelFinance.notes.col.tag": "Etiket",
  "panelFinance.notes.col.note": "Not",
  "panelFinance.notes.col.counselor": "Rehber",
  "panelFinance.notes.list.loading": "Yükleniyor…",
  "panelFinance.notes.list.empty": "Henüz görüşme notu yok.",

  // CounselingNotesManager — errors
  "panelFinance.notes.error.required": "Öğrenci adı ve görüşme notu zorunludur.",

  // Profile page
  "panelFinance.profile.quick.teacherClasses": "Sınıflarım ve Kodlar",
  "panelFinance.profile.quick.teacherPanel": "Öğretmen Paneli",
  "panelFinance.profile.quick.studentPanel": "Öğrenci Panelim",
  "panelFinance.profile.quick.parentPanel": "Veli Panelim",
  "panelFinance.profile.quick.superAdmin": "Süper Admin Konsolu",
  "panelFinance.profile.quick.schoolAdmin": "Okul Yönetim Paneli",
  "panelFinance.profile.loading": "Yükleniyor…",
  "panelFinance.profile.generalUser": "Genel Kullanıcı",
  "panelFinance.profile.platform": "Platform",
  "panelFinance.profile.detail.email": "E-posta",
  "panelFinance.profile.detail.school": "Okul",
  "panelFinance.profile.detail.role": "Rol",
  "panelFinance.profile.detail.class": "Sınıf",
  "panelFinance.profile.back": "Panele dön",
  "panelFinance.profile.fallbackName": "Kullanıcı",
  "panelFinance.profile.status.suspended": "Askıda",
  "panelFinance.profile.status.active": "Aktif",
  "panelFinance.profile.edit.heading": "Profili Düzenle",
  "panelFinance.profile.edit.description":
    "Ad ve telefon bilgilerinizi güncelleyebilirsiniz. Rol, okul ve hesap durumu yöneticiniz tarafından belirlenir.",
  "panelFinance.profile.edit.name": "Ad Soyad",
  "panelFinance.profile.edit.phone": "Telefon",
  "panelFinance.profile.edit.phonePlaceholder": "0 5xx xxx xx xx",
  "panelFinance.profile.edit.success": "Profiliniz güncellendi.",
  "panelFinance.profile.edit.save": "Kaydet",
  "panelFinance.profile.edit.saveBusy": "Kaydediliyor…",
  "panelFinance.profile.error.invalidName": "Lütfen geçerli bir ad girin.",
};

export const en: Record<string, string> = {
  // Finance page (meta + section)
  "panelFinance.meta.title": "Finance Center — {product}",
  "panelFinance.meta.description":
    "Track collections, revenue, payments and enrollment income from a single screen.",
  "panelFinance.page.title": "Finance Center",
  "panelFinance.section.eyebrow": "Finance",
  "panelFinance.section.title": "Finance Center",
  "panelFinance.section.description":
    "Manage student-based collections, balances and payment statuses from one screen.",

  // PaymentManager — unavailable
  "panelFinance.pay.unavailable.title": "Payment management unavailable",
  "panelFinance.pay.unavailable.body":
    "This section only works with a signed-in school manager/founder account and while Firebase is active.",

  // PaymentManager — summary stats
  "panelFinance.pay.stat.total": "Total Accrued",
  "panelFinance.pay.stat.collected": "Collected",
  "panelFinance.pay.stat.outstanding": "Balance",
  "panelFinance.pay.stat.overdue": "Overdue",

  // PaymentManager — add form
  "panelFinance.pay.add.heading": "Add Accrual / Payment",
  "panelFinance.pay.add.student": "Student",
  "panelFinance.pay.add.studentPlaceholder": "Full Name",
  "panelFinance.pay.add.grade": "Grade",
  "panelFinance.pay.add.gradePlaceholder": "5-A",
  "panelFinance.pay.add.amount": "Amount (₺)",
  "panelFinance.pay.add.amountPlaceholder": "25000",
  "panelFinance.pay.add.due": "Due Date",
  "panelFinance.pay.add.submit": "Add",
  "panelFinance.pay.add.submitBusy": "Adding…",

  // PaymentManager — list
  "panelFinance.pay.list.heading": "Student Payments (live)",
  "panelFinance.pay.list.count": "{count} records",
  "panelFinance.pay.list.refresh": "Refresh",
  "panelFinance.pay.list.exportTitle": "Student Payments",
  "panelFinance.pay.list.loading": "Loading…",
  "panelFinance.pay.list.empty": "No payment records yet. Add one above.",

  // PaymentManager — table headers
  "panelFinance.pay.col.student": "Student",
  "panelFinance.pay.col.amount": "Amount",
  "panelFinance.pay.col.due": "Due Date",
  "panelFinance.pay.col.status": "Status",
  "panelFinance.pay.col.paid": "Paid",
  "panelFinance.pay.col.note": "Note",
  "panelFinance.pay.col.action": "Paid / Action",

  // PaymentManager — status labels
  "panelFinance.status.PENDING": "Pending",
  "panelFinance.status.PARTIAL": "Partial Payment",
  "panelFinance.status.PAID": "Paid",
  "panelFinance.status.OVERDUE": "Overdue",

  // PaymentManager — collect / remind
  "panelFinance.pay.collect": "Collect",
  "panelFinance.pay.collectBusy": "…",
  "panelFinance.pay.remind.title": "Send a payment reminder to the parent",
  "panelFinance.pay.remind.idle": "Remind",
  "panelFinance.pay.remind.busy": "…",
  "panelFinance.pay.remind.sent": "Sent",

  // PaymentManager — errors
  "panelFinance.pay.error.invalidAdd": "Enter a student name and a valid amount.",
  "panelFinance.pay.error.invalidPaid": "Enter a valid paid amount.",
  "panelFinance.pay.error.noParent": "No linked parent account found for this student.",

  // Counseling page (meta + section + privacy)
  "panelFinance.counseling.meta.title": "Counseling Center — {product}",
  "panelFinance.counseling.meta.description":
    "Securely track student development, counseling processes and counseling notes.",
  "panelFinance.counseling.page.title": "Counseling Center",
  "panelFinance.counseling.section.eyebrow": "Student Development",
  "panelFinance.counseling.section.title": "Counseling Center",
  "panelFinance.counseling.section.description":
    "Securely track student counseling notes and counseling records.",
  "panelFinance.counseling.privacy.title": "Privacy and Authorization Notice",
  "panelFinance.counseling.privacy.body":
    "Counseling records are processed as sensitive data under KVKK. Only authorized counseling staff can access the student counseling notes on this screen via role-based access. The information must not be shared with third parties and must be stored in line with privacy principles.",

  // CounselingNotesManager — unavailable
  "panelFinance.notes.unavailable.title": "Counseling notes unavailable",
  "panelFinance.notes.unavailable.body":
    "This section only works with a signed-in school staff account and while Firebase is active.",

  // CounselingNotesManager — add form
  "panelFinance.notes.add.heading": "Add Counseling Note",
  "panelFinance.notes.add.student": "Student",
  "panelFinance.notes.add.studentPlaceholder": "Full Name",
  "panelFinance.notes.add.tag": "Tag",
  "panelFinance.notes.add.note": "Counseling Note",
  "panelFinance.notes.add.notePlaceholder": "Write the session summary…",
  "panelFinance.notes.add.submit": "Add",
  "panelFinance.notes.add.submitBusy": "Adding…",

  // CounselingNotesManager — list
  "panelFinance.notes.list.heading": "Counseling Notes (live)",
  "panelFinance.notes.list.refresh": "Refresh",
  "panelFinance.notes.list.exportTitle": "Counseling Session Notes",
  "panelFinance.notes.col.student": "Student",
  "panelFinance.notes.col.tag": "Tag",
  "panelFinance.notes.col.note": "Note",
  "panelFinance.notes.col.counselor": "Counselor",
  "panelFinance.notes.list.loading": "Loading…",
  "panelFinance.notes.list.empty": "No counseling notes yet.",

  // CounselingNotesManager — errors
  "panelFinance.notes.error.required": "Student name and counseling note are required.",

  // Profile page
  "panelFinance.profile.quick.teacherClasses": "My Classes and Codes",
  "panelFinance.profile.quick.teacherPanel": "Teacher Panel",
  "panelFinance.profile.quick.studentPanel": "My Student Panel",
  "panelFinance.profile.quick.parentPanel": "My Parent Panel",
  "panelFinance.profile.quick.superAdmin": "Super Admin Console",
  "panelFinance.profile.quick.schoolAdmin": "School Management Panel",
  "panelFinance.profile.loading": "Loading…",
  "panelFinance.profile.generalUser": "General User",
  "panelFinance.profile.platform": "Platform",
  "panelFinance.profile.detail.email": "Email",
  "panelFinance.profile.detail.school": "School",
  "panelFinance.profile.detail.role": "Role",
  "panelFinance.profile.detail.class": "Class",
  "panelFinance.profile.back": "Back to panel",
  "panelFinance.profile.fallbackName": "User",
  "panelFinance.profile.status.suspended": "Suspended",
  "panelFinance.profile.status.active": "Active",
  "panelFinance.profile.edit.heading": "Edit Profile",
  "panelFinance.profile.edit.description":
    "You can update your name and phone details. Your role, school and account status are set by your administrator.",
  "panelFinance.profile.edit.name": "Full Name",
  "panelFinance.profile.edit.phone": "Phone",
  "panelFinance.profile.edit.phonePlaceholder": "0 5xx xxx xx xx",
  "panelFinance.profile.edit.success": "Your profile has been updated.",
  "panelFinance.profile.edit.save": "Save",
  "panelFinance.profile.edit.saveBusy": "Saving…",
  "panelFinance.profile.error.invalidName": "Please enter a valid name.",
};
