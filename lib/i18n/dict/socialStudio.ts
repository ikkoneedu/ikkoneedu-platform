/**
 * Sosyal Medya AI Stüdyo (Faz 4 — demo-safe) sözlüğü.
 * Üretim metinleri şablon anahtarlarıyla (social.tpl.*) tutulur; gerçek AI
 * sonraki fazda bağlanacaktır. {school}/{topic}/{date}/{detail} yer tutucuları.
 */

export const tr = {
  "social.meta.title": "Sosyal Medya AI Stüdyo",
  "social.meta.desc": "Okulunuz için sosyal medya gönderi taslakları oluşturun.",
  "social.shell.title": "Sosyal Medya AI Stüdyo",
  "social.header.eyebrow": "Tanıtım",
  "social.header.title": "Sosyal Medya AI Stüdyo",
  "social.header.desc": "Birkaç bilgiyle hazır gönderi taslakları üretin, kopyalayın ve paylaşın.",

  "social.demo.title": "Demo taslak · gerçek AI sonraki faz",
  "social.demo.body": "Bu taslaklar hazır şablonlardan üretilir (cihazınızda, anında). Gerçek yapay zekâ üretimi (özgün metin, görsel önerisi) sonraki fazda bağlanacaktır.",

  "social.field.platform": "Platform",
  "social.field.postType": "Gönderi türü",
  "social.field.school": "Okul adı",
  "social.field.topic": "Konu / başlık",
  "social.field.topicPlaceholder": "Örn. Bahar Şenliği",
  "social.field.date": "Tarih (opsiyonel)",
  "social.field.datePlaceholder": "Örn. 15 Mayıs Cumartesi",
  "social.field.detail": "Ek detay (opsiyonel)",
  "social.field.detailPlaceholder": "Örn. saat 10:00, ana kampüs bahçesi",
  "social.generate": "Taslak üret",
  "social.regenerate": "Yeni varyasyon",
  "social.copy": "Kopyala",
  "social.copied": "Kopyalandı",
  "social.result.empty": "Bilgileri doldurup “Taslak üret”e basın.",
  "social.result.caption": "Metin",
  "social.result.hashtags": "Etiketler",
  "social.err.topicRequired": "Lütfen bir konu/başlık girin.",

  "social.platform.instagram": "Instagram",
  "social.platform.facebook": "Facebook",
  "social.platform.x": "X (Twitter)",
  "social.platform.linkedin": "LinkedIn",

  "social.type.announcement": "Duyuru",
  "social.type.event": "Etkinlik",
  "social.type.achievement": "Başarı",
  "social.type.enrollment": "Kayıt / Tanıtım",

  // Şablonlar (yer tutuculu)
  "social.tpl.announcement.0": "📢 {school} duyurusu: {topic}. {detail} Tüm velilerimiz ve öğrencilerimiz davetlidir!",
  "social.tpl.announcement.1": "Önemli duyuru! {school} olarak {topic} hakkında sizleri bilgilendirmek isteriz. {detail}",
  "social.tpl.event.0": "🎉 {topic}, {school} ailesini bir araya getiriyor! {date} {detail} Sizi de aramızda görmek isteriz.",
  "social.tpl.event.1": "Takvime not düşün: {topic}! {school} olarak {date} buluşuyoruz. {detail}",
  "social.tpl.achievement.0": "🏆 Gurur tablosu! {school} öğrencilerimiz {topic} ile bizi gururlandırdı. {detail} Emeği geçen herkesi tebrik ederiz!",
  "social.tpl.achievement.1": "Başarı bizim işimiz! {topic} — {school} ailesi olarak bu gururu yaşıyoruz. {detail}",
  "social.tpl.enrollment.0": "🎓 {school} ailesine katılın! {topic} {detail} Geleceğe güçlü bir adım için kayıtlarımız başladı.",
  "social.tpl.enrollment.1": "Çocuğunuz için doğru tercih: {school}. {topic} {detail} Tanışmak için bizi ziyaret edin.",
} as const;

export const en = {
  "social.meta.title": "Social Media AI Studio",
  "social.meta.desc": "Create social media post drafts for your school.",
  "social.shell.title": "Social Media AI Studio",
  "social.header.eyebrow": "Marketing",
  "social.header.title": "Social Media AI Studio",
  "social.header.desc": "Generate ready-to-use post drafts from a few details, copy and share.",

  "social.demo.title": "Demo draft · real AI next phase",
  "social.demo.body": "These drafts are generated from ready templates (on your device, instantly). Real AI generation (original copy, image suggestions) will be connected in the next phase.",

  "social.field.platform": "Platform",
  "social.field.postType": "Post type",
  "social.field.school": "School name",
  "social.field.topic": "Topic / title",
  "social.field.topicPlaceholder": "e.g. Spring Festival",
  "social.field.date": "Date (optional)",
  "social.field.datePlaceholder": "e.g. Saturday, May 15",
  "social.field.detail": "Extra detail (optional)",
  "social.field.detailPlaceholder": "e.g. 10:00, main campus garden",
  "social.generate": "Generate draft",
  "social.regenerate": "New variation",
  "social.copy": "Copy",
  "social.copied": "Copied",
  "social.result.empty": "Fill in the details and press “Generate draft”.",
  "social.result.caption": "Caption",
  "social.result.hashtags": "Hashtags",
  "social.err.topicRequired": "Please enter a topic/title.",

  "social.platform.instagram": "Instagram",
  "social.platform.facebook": "Facebook",
  "social.platform.x": "X (Twitter)",
  "social.platform.linkedin": "LinkedIn",

  "social.type.announcement": "Announcement",
  "social.type.event": "Event",
  "social.type.achievement": "Achievement",
  "social.type.enrollment": "Enrollment / Promo",

  "social.tpl.announcement.0": "📢 {school} announcement: {topic}. {detail} All our parents and students are invited!",
  "social.tpl.announcement.1": "Important notice! At {school} we'd like to update you about {topic}. {detail}",
  "social.tpl.event.0": "🎉 {topic} brings the {school} family together! {date} {detail} We'd love to see you there.",
  "social.tpl.event.1": "Mark your calendar: {topic}! At {school} we meet on {date}. {detail}",
  "social.tpl.achievement.0": "🏆 Proud moment! Our {school} students made us proud with {topic}. {detail} Congratulations to everyone involved!",
  "social.tpl.achievement.1": "Success is what we do! {topic} — as the {school} family we celebrate this pride. {detail}",
  "social.tpl.enrollment.0": "🎓 Join the {school} family! {topic} {detail} Enrolment is open for a strong step into the future.",
  "social.tpl.enrollment.1": "The right choice for your child: {school}. {topic} {detail} Visit us to get to know each other.",
} as const;
