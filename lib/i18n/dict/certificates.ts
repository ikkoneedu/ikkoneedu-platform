/**
 * Sertifika & Belge üretici (demo-safe) sözlüğü TR/EN.
 */

export const tr = {
  "cert.meta.title": "Sertifika & Belge Üretici",
  "cert.meta.desc": "Başarı, katılım ve takdir belgelerini QR doğrulamalı olarak üretin.",
  "cert.shell.title": "Sertifika & Belge Üretici",
  "cert.header.eyebrow": "Belgeler",
  "cert.header.title": "Sertifika & Belge Üretici",
  "cert.header.desc": "Belge türünü ve bilgileri girin; QR doğrulamalı belgeyi anında önizleyin ve yazdırın.",

  "cert.demo.title": "Demo · QR doğrulama sonraki faz",
  "cert.demo.body": "Belge ve seri numarası içerikten anında üretilir. QR yalnızca demo doğrulama yükü taşır; resmi/dijital imza doğrulaması sonraki fazda bağlanacaktır.",

  "cert.field.type": "Belge türü",
  "cert.field.recipient": "Alan kişi",
  "cert.field.recipientPlaceholder": "Örn. Ayşe Yılmaz",
  "cert.field.title": "Başlık / başarı / etkinlik",
  "cert.field.titlePlaceholder": "Örn. Yıl Sonu Başarı Ödülü",
  "cert.field.date": "Tarih",
  "cert.field.datePlaceholder": "Örn. 15 Haziran 2026",
  "cert.field.issuer": "Veren kurum / okul",
  "cert.field.issuerPlaceholder": "Örn. İngiliz Kültür Koleji",
  "cert.field.note": "Ek açıklama (opsiyonel)",
  "cert.field.notePlaceholder": "Örn. üstün gayreti ve başarısı için.",
  "cert.generate": "Belgeyi oluştur",
  "cert.print": "Yazdır / PDF",
  "cert.err.required": "Lütfen alan kişi ve başlık alanlarını doldurun.",
  "cert.result.empty": "Bilgileri girip “Belgeyi oluştur”a basın.",

  "cert.type.achievement": "Başarı Belgesi",
  "cert.type.participation": "Katılım Belgesi",
  "cert.type.appreciation": "Takdir Belgesi",
  "cert.type.completion": "Tamamlama Belgesi",

  // Belge metni (önizleme)
  "cert.doc.awardedTo": "Bu belge",
  "cert.doc.presentedFor": "aşağıdaki başarı için takdim edilmiştir:",
  "cert.doc.serial": "Seri No",
  "cert.doc.verify": "QR ile doğrulanabilir",
  "cert.doc.issuedBy": "Veren",
  "cert.doc.date": "Tarih",
} as const;

export const en = {
  "cert.meta.title": "Certificate & Document Maker",
  "cert.meta.desc": "Produce achievement, participation and appreciation certificates with QR verification.",
  "cert.shell.title": "Certificate & Document Maker",
  "cert.header.eyebrow": "Documents",
  "cert.header.title": "Certificate & Document Maker",
  "cert.header.desc": "Enter the document type and details; preview the QR-verified certificate instantly and print it.",

  "cert.demo.title": "Demo · QR verification next phase",
  "cert.demo.body": "The document and serial number are generated instantly from the content. The QR carries a demo verification payload only; official/digital signature verification will be connected in the next phase.",

  "cert.field.type": "Document type",
  "cert.field.recipient": "Recipient",
  "cert.field.recipientPlaceholder": "e.g. Jane Doe",
  "cert.field.title": "Title / achievement / event",
  "cert.field.titlePlaceholder": "e.g. End-of-Year Achievement Award",
  "cert.field.date": "Date",
  "cert.field.datePlaceholder": "e.g. June 15, 2026",
  "cert.field.issuer": "Issuing institution / school",
  "cert.field.issuerPlaceholder": "e.g. British Culture College",
  "cert.field.note": "Extra note (optional)",
  "cert.field.notePlaceholder": "e.g. for outstanding effort and success.",
  "cert.generate": "Generate document",
  "cert.print": "Print / PDF",
  "cert.err.required": "Please fill in the recipient and title fields.",
  "cert.result.empty": "Enter the details and press “Generate document”.",

  "cert.type.achievement": "Certificate of Achievement",
  "cert.type.participation": "Certificate of Participation",
  "cert.type.appreciation": "Certificate of Appreciation",
  "cert.type.completion": "Certificate of Completion",

  "cert.doc.awardedTo": "This certificate is awarded to",
  "cert.doc.presentedFor": "presented for the following achievement:",
  "cert.doc.serial": "Serial No",
  "cert.doc.verify": "Verifiable by QR",
  "cert.doc.issuedBy": "Issued by",
  "cert.doc.date": "Date",
} as const;
