# Bursluluk Sınavı Modülü

> Durum: **Mock / Hazırlık.** Gerçek backend, QR, PDF, SMS, e-posta yoktur.
> Mimari çoklu okul (tenant) yapısına hazırdır.

## Modül Amacı

Özel okulların en önemli kayıt ve lead toplama süreci olan bursluluk sınavını
uçtan uca yönetmek: sınav oluşturma → başvuru → oturum/salon planlama → giriş
belgesi → sonuç/burs hesaplama → CRM dönüşümü → kayıt randevusu.

## Route Yapısı

| Route | Açıklama | Erişim |
|-------|----------|--------|
| `/scholarship-exam` | Yönetim ekranı (okul yöneticisi) | İç (PageShell) |
| `/scholarship-exam/apply` | Başvuru formu (aday veli) | Halka açık |
| `/scholarship-exam/admission-card` | Sınav giriş belgesi sorgulama | Halka açık |
| `/scholarship-exam/results` | Sonuç sorgulama | Halka açık |

### Tenant/domain hazırlığı

İleride her okul kendi alt alan adından erişecek:

```
ingilizkultur.ikkoneedu.com/bursluluk
atael.ikkoneedu.com/bursluluk
okuladi.ikkoneedu.com/bursluluk
```

Çözümleme `lib/tenant/tenant-resolver.ts` ile yapılacak; `/scholarship-exam`
rotaları tenant bağlamına bağlanacaktır. Şimdilik mock (`scholarshipSchools`).

## Firestore Koleksiyon Önerisi

```
tenants/{tenantId}/scholarshipExams/{examId}
tenants/{tenantId}/scholarshipApplications/{applicationId}
tenants/{tenantId}/scholarshipSessions/{sessionId}
tenants/{tenantId}/examRooms/{roomId}
tenants/{tenantId}/admissionCards/{cardId}
tenants/{tenantId}/scholarshipResults/{resultId}
```

İlgili tipler: `src/types/scholarship-exam.ts` (ScholarshipExam,
ScholarshipApplication, ScholarshipSession, ExamRoom, SeatAssignment, Proctor,
AdmissionCard, ScholarshipResult, ScholarshipAward, ScholarshipRule,
ScholarshipCRMStatus).

## CRM Entegrasyonu

- Her onaylı başvuru bir **lead** üretir; CRM'de `Lead Source: Bursluluk Sınavı`.
- Funnel: Başvuru → Sınava Katıldı → Burs Kazandı → Arandı → Randevu → Kayıt.
- Burs kazananlar otomatik "Sıcak Lead" olarak işaretlenir, kayıt randevusuna
  yönlendirilir (`/demo`).

## Bildirim Entegrasyonu

- Notifications: yeni bildirim türü **Bursluluk Sınavı**.
- Message Center şablonları: başvuru onayı, giriş belgesi hatırlatma, sonuç
  açıklandı, kayıt görüşmesi daveti.
- İleride FCM/SMS/e-posta ile otomatik tetiklenecek (bkz. `fcm-notifications-plan.md`).

## QR / PDF Gelecek Planı

- **Giriş belgesi QR**: başvuru no + tenant + salon/sıra imzalı token; salonda
  okutulup yoklama alınır. Üretim sunucuda (`qrcode` kütüphanesi) yapılacak.
- **PDF**: toplu giriş belgesi ve sonuç belgesi sunucu tarafında üretilecek
  (ör. `@react-pdf/renderer` veya headless render). Şimdilik buton mock.

## Güvenlik / KVKK Notları

- Başvuru formunda KVKK aydınlatma + iletişim izni + sınav kuralları onayı
  zorunlu.
- Halka açık sorgular (giriş belgesi/sonuç) TC + Başvuru No ile; rate-limit ve
  captcha (şimdilik placeholder) ileride eklenecek.
- Öğrenci kişisel verileri tenant izolasyonu altında; sonuç/burs verileri rol
  bazlı erişimle korunur (`roles-permissions.md`).

## Entegrasyon Noktaları (özet)

1. `/super-admin` kataloğunda kart.
2. Sidebar "Bursluluk Sınavı" linki.
3. Landing "Bursluluk Sınavı Başvurusu" CTA → `/scholarship-exam/apply`.
4. `/school-select` okul kartlarında "Bursluluk Başvurusu" linki.
5. CRM lead kaynağı: Bursluluk Sınavı.
6. Admissions AI hızlı komutu.
7. Message Center bursluluk şablonları.
8. Notifications bursluluk türü.
