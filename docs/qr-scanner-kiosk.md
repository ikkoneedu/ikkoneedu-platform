# Kiosk QR Okuyucu — Okul Girişi Personel Devam Sistemi

Okul girişine konan bir bilgisayara **USB ile bağlanan 2D QR okuyucu** ile
personelin telefonundaki (zaten var olan) dinamik QR'ını okutarak otomatik
giriş/çıkış kaydı almak için kurulan sistem.

**Kamera KULLANILMAZ.** Okuyucu, klavyeden yazılmış gibi davranan bir USB HID
(Keyboard Wedge) cihazdır.

---

## 1. Hangi tip okuyucu alınmalı?

- **2D (QR) okuma desteği** olmalı (1D barkod okuyucular telefon ekranındaki
  QR'ı genelde okuyamaz).
- **USB HID / Keyboard Wedge** modunda çalışmalı (sürücü kurulumu gerektirmez;
  bilgisayar bunu "klavye" olarak tanır).
- **Telefon ekranından okuma** desteklemeli (parlak/yansıtan yüzeyler için
  optimize, "presentation mode" / hands-free sabit ayaklı modeller idealdir —
  personel telefonu okuyucunun önüne tutar, tetiğe basmaya gerek kalmaz).
- **Enter (CR) suffix** göndermeli — okuma bitince otomatik Enter tuşu basar.
  Çoğu okuyucuda bu fabrika ayarıdır; değilse okuyucunun kendi ayar kılavuzu/
  ayar barkoduyla "Add Enter/CR suffix" ayarlanmalıdır.

### USB HID / Keyboard Wedge ne demek?

Cihaz, bilgisayara **ayrı bir sürücü kurulmadan** doğrudan bir klavye gibi
tanıtılır. QR okutulduğunda cihaz, QR içeriğindeki metni sanki biri hızlıca
klavyeden yazıyormuş gibi, karakter karakter işletim sistemine gönderir ve
genelde sonunda **Enter** tuşuna basar. Bu sayede tarayıcıda açık olan herhangi
bir web sayfası, aktif (focus'lu) bir metin kutusuna bu veriyi normal bir
klavye girdisi gibi alır — ekstra bir SDK/kütüphane gerekmez.

---

## 2. Cihaz kurulumu

1. Okuyucuyu USB ile bilgisayara bağlayın (sürücü kurulumu gerekmez).
2. Okuyucunun ayar kılavuzuna bakıp gerekiyorsa **Enter/CR suffix** barkodunu
   okutarak bu ayarı açın (fabrika ayarı genelde zaten açıktır).
3. Okul yönetimi (Genel Müdür/Kurucu/Müdür/Müdür Yrd./Koordinatör) tarayıcıda
   kendi hesabıyla giriş yapıp `/attendance/kiosk` sayfasını açar.
4. Sayfa "Kiosk Cihazı Etkinleştirilmedi" ekranını gösterir:
   - **Hızlı etkinleştirme**: Yönetici zaten giriş yapmışsa, Cihaz Adı (ör.
     "Ana Giriş") + Lokasyon (ör. `main_gate`) girip **"Bu Cihazı
     Etkinleştir"**e tıklar. Cihaz kimliği ve sırrı bu tarayıcıya otomatik
     kaydedilir.
   - **Elle kurulum**: Cihaz başka bir yerden (`/admin/attendance-devices`
     panelinden) önceden oluşturulduysa, oradaki Okul Kimliği (tenantId),
     Cihaz ID ve Cihaz Sırrı bu ekrana elle girilebilir.
5. Aktivasyondan sonra sayfa otomatik olarak tam ekran tarama moduna geçer:
   "QR kodunuzu okuyucuya gösteriniz."
6. Personel, kendi telefonundaki (`/attendance/my-qr` sayfasındaki, zaten
   mevcut) günlük GİRİŞ veya ÇIKIŞ QR'ını okuyucuya gösterir. Aksiyon (giriş/
   çıkış) QR'ın kendisinde imzalıdır — kiosk otomatik algılar.

Sayfayı tarayıcıda **tam ekran** (F11 / kiosk modu) açık bırakmanız önerilir.

---

## 3. Kamera kullanılmıyor

Bu sistemde **kamera, `getUserMedia`, veya herhangi bir QR-kamera kütüphanesi
kullanılmaz.** (Kamera tabanlı okuma zaten `/attendance/scanner` sayfasında,
farklı bir akış olarak mevcuttur — personelin birbirini telefon kamerasıyla
okuttuğu senaryo içindir.) Kiosk sayfası tamamen **fiziksel USB okuyucunun
klavye girdisine** dayanır.

---

## 4. Önerilen okuyucu özellikleri (özet)

| Özellik                         | Neden gerekli                                  |
|----------------------------------|-------------------------------------------------|
| 2D QR desteği                    | Telefon QR'ları 2D formattadır                  |
| Telefon ekranından okuma          | Yansıma/parlaklık toleransı                     |
| USB HID (Keyboard Wedge)          | Sürücüsüz, tarayıcı input'una doğrudan yazar    |
| Presentation / hands-free         | Personel telefonu tutar, okuyucu otomatik okur  |
| Enter (CR) suffix desteği         | Kiosk sayfası taramanın bittiğini Enter'dan anlar |

---

## 5. Sorun giderme

- **Okumuyor** → Telefon ekranının parlaklığını artırın; QR'ı okuyucudan
  10–20 cm mesafede, dik açıyla tutun.
- **Enter atmıyor / tarama tamamlanmıyor** → Okuyucunun "Enter/CR suffix"
  ayar barkodunu tekrar okutup ayarı doğrulayın.
- **"Geçersiz QR"** → QR biçimi bozuk veya farklı bir sistemin QR'ı okutulmuş
  olabilir; personelin `/attendance/my-qr` sayfasındaki güncel QR'ı
  kullandığından emin olun.
- **"QR süresi dolmuş"** → Personel QR'ı GÜNLÜK yenilenir; dünkü ekran
  görüntüsü/QR bugün geçersizdir. Sayfayı yenileyip yeni QR'ı göstermeli.
- **"Bu QR daha önce kullanılmış" / "Bugünkü giriş/çıkış zaten
  tamamlanmış"** → Aynı QR (aynı gün, aynı aksiyon) ikinci kez okutulmuş;
  personel zaten giriş/çıkış yapmış demektir.
- **"Yetkisiz cihaz"** → Bu tarayıcıdaki cihaz kimliği/sırrı Firestore'da
  aktif değil veya yanlış. `/admin/attendance-devices` panelinden cihazın
  **Aktif** durumda olduğunu kontrol edin; gerekirse kioskta "Cihazı
  Sıfırla"ya basıp yeniden etkinleştirin.
- **"Personel bu okula ait değil"** → QR başka bir okulun (tenant) personeline
  ait; bu kiosk yalnızca kendi okulunun personelini kabul eder.

---

## 6. Geliştirme / test notu

`NODE_ENV !== "production"` iken kiosk sayfasının altında bir **"Geliştirme
Modu — Tarayıcı Simülasyonu"** kutusu görünür: fiziksel okuyucu olmadan bir QR
metnini yapıştırıp Enter'a basarak tarama akışını test edebilirsiniz. Bu kutu
production'da gösterilmez.

Ayrıca kiosk klavye arabelleği mantığı (`lib/attendance/scanner-buffer.ts`)
için bağımsız bir doğrulama betiği vardır (proje test runner'ı içermediğinden
Node'un yerleşik `assert`i + `--experimental-strip-types` ile çalışır, yeni
paket eklenmedi):

```bash
npm run test:scanner-buffer
```

---

## 7. Mimari özet (geliştiriciler için)

- **Token üretim/doğrulama DEĞİŞMEDİ**: `lib/attendance/token.ts` ve
  `lib/attendance/sign.ts` aynen kullanılır (`parseAttendanceQR`,
  `verifyAttendanceSig`, `ATTENDANCE_QR_SECRET`).
- **Yeni**: `lib/attendance/device-auth.ts` — kiosk cihaz sırrı üretimi/
  doğrulaması (SHA-256, personel geçici şifre deseniyle aynı mantık).
- **Yeni uç nokta**: `POST /api/staff-attendance/scan` — oturum açmış bir
  operatör (idToken) OLMADAN, cihaz sırrıyla doğrulanan kiosk tarama uç
  noktası. Firestore **transaction** ile aynı anda iki kiosktan gelen aynı
  taramadan yalnızca biri kabul edilir; aynı gün aynı aksiyon ikinci kez
  gelirse `duplicate` ile reddedilir.
- **Yeni Firestore koleksiyonları**:
  - `tenants/{tenantId}/attendanceDevices/{deviceId}` — kiosk cihaz kaydı
    (`secretHash` dışında istemciden okunur/güncellenir; sır asla saklanmaz).
  - `tenants/{tenantId}/attendanceScanLogs/{logId}` — her tarama denemesinin
    (başarılı/başarısız) denetim kaydı.
- **Mevcut `tenants/{tenantId}/attendanceLogs`** koleksiyonu AYNEN kullanılır
  (yeni bir "staffAttendance" koleksiyonu açılmadı) — böylece `/attendance/logs`
  raporu ve geç-giriş/erken-çıkış uyarı sistemi (Genel Müdür bildirimleri)
  kiosk taramalarını da otomatik kapsar.
- Kiosk sayfası `PageShell` (Sidebar/Topbar) **kullanmaz** — tam ekran,
  bağımsız bir düzendir; `robots: noindex`.
