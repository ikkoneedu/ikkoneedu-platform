# IKK ONE EDU OS — MVP Analiz Raporu

> Hazırlanma amacı: Mevcut sistemi **satılabilir bir SaaS okul işletim sistemine**
> dönüştürmek için gerçek durum tespiti. Rakipler (K12NET, PowerSchool, ManageBac,
> Veracross, Blackbaud, Schoology) referans alınmıştır. Görsellik değil **çalışan
> sistem, doğru veri modeli, doğru tenant/rol mimarisi** önceliklidir.

---

## 0. Rakip omurgası (özet)

Tüm bu ürünler onlarca "modül" gibi görünse de **tek bir veri omurgasını** paylaşır:

```
Öğrenci (tek kayıt)
  ├─ Veli (ilişki)
  ├─ Sınıf / Şube
  ├─ Ders programı
  ├─ Devamsızlık
  ├─ Not / Karne
  ├─ Ödev
  ├─ Finans (öğrenci bazlı bakiye)
  └─ Kayıt kabul (CRM → öğrenci)
```

IKK ONE EDU OS bu omurgaya **çok yakın**. Eksik olan, omurganın bazı uçlarının
(settings, finans, bildirim) gerçek Firestore'a bağlanması.

---

## 1. Şu anda GERÇEK çalışan modüller (Firestore'a yazıyor)

| Modül | Servis | Koleksiyon | Durum |
|---|---|---|---|
| Auth / Profil | `user-profile.ts`, `users.ts` | `users/{uid}` | ✅ Gerçek |
| Okul (tenant) yönetimi | `schools.ts` | `tenants/{id}` | ✅ Gerçek |
| Kullanıcı oluşturma (personel/öğrenci/veli) | `users.ts`, `access-codes.ts` | `users` | ✅ Gerçek |
| Sınıflar + erişim kodları | `access-codes.ts` | `tenants/{id}/classes`, `accessCodes` | ✅ Gerçek |
| CRM lead + pipeline + dönüşüm | `leads.ts`, `crm-actions.ts`, `crm-global.ts` | `tenants/{id}/leads` | ✅ Gerçek |
| Bursluluk başvuru | `scholarship-applications.ts` | `.../scholarshipApplications` | ✅ Gerçek (create+list) |
| Demo/bilgi talebi | `demo-requests.ts` | `.../demoRequests` | ✅ Gerçek |
| Ders programı | `schedule.ts` | `.../schedule` | ✅ Gerçek |
| Devamsızlık | `attendance.ts` | `.../attendance` | ✅ Gerçek |
| Ödev | `assignments.ts` | `.../assignments` | ✅ Gerçek |
| Not / Karne | `grades.ts` | `studentRecords` / grades | ✅ Gerçek |
| Duyurular | `announcements.ts` | `.../announcements` | ✅ Gerçek |
| Birebir mesaj | `messaging.ts` | `directMessages` | ✅ Gerçek |
| Denetim kaydı | `audit-logs.ts` | `platformAuditLogs`, tenant auditLogs | ✅ Gerçek |
| Global CRM (süper admin) | `crm-global.ts` | collection group | ✅ Gerçek |
| Profil düzenleme | `user-profile.ts` | `users/{uid}` | ✅ Gerçek |

**Sonuç:** Veri omurgasının **~%75'i gerçek**. Bu, rakiplerin temel modüllerinin
çoğunun zaten çalıştığı anlamına gelir.

---

## 2. MOCK olan / gerçek olmayan modüller

| Modül | Durum | Not |
|---|---|---|
| **Settings (ayarlar)** | ❌ Mock | Servis YOK. Okul/akademik/bursluluk/program ayarları statik. **En kritik eksik.** |
| **Finans / Ödemeler** | ❌ Mock | `payments` koleksiyonu var, servis/UI yok. Öğrenci bazlı bakiye yok. |
| **Bildirimler** | ⚠️ Yarı | Composer'lar localStorage'a yazıyor; `notifications` koleksiyonuna Firestore kaydı yok. |
| **Bursluluk sonuç/burs oranı girişi** | ⚠️ Yarı | Başvuru gerçek; ama yönetici **sonuç/burs oranı girişi** ve veli **sonuç sorgulama** Firestore'a bağlı değil (mock lookup). |
| **Executive/Finance dashboard grafikleri** | ❌ Mock | Tüm metrik/grafikler statik veri. |
| **AI panelleri** (exam-ai, scheduler-ai, ai-brain, report-card-ai, admissions-ai, counseling AI) | ❄️ Dondurulmuş | Kasıtlı — AI entegrasyonu yok. |
| **Parent ↔ Student bağlama (linkedStudentIds)** | ⚠️ Yarı | Veli kodu öğrenciye bağlanıyor (access-codes) ama veli panelinde bağlı öğrenci verisi tam akmıyor. |

---

## 3. Eksik / zayıf veri modelleri

1. **TenantSettings** tipi yok — okul/akademik/bursluluk/program ayarları için
   tek bir sözleşme gerekiyor (`tenants/{id}/settings/{section}`).
2. **Payment / StudentBalance** modeli yok — öğrenci bazlı `status: PENDING |
   PARTIAL | PAID | OVERDUE`, tutar, vade.
3. **Notification** modeli zayıf — `{ title, body, audience, createdBy,
   createdAt, readBy[] }` standardı yok.
4. **ScholarshipApplication** sonuç alanları eksik — `examScore`, `scholarshipRate`,
   `resultStatus`, `room`, `seatNo` write-path'i yok.
5. **Course/Lesson** modeli `schedule` içine gömülü — ayrı `courses` koleksiyonu
   yok (rakiplerde ders ≠ program girişi).
6. **Student** profili kök `users` altında — rakipler ayrı `students` zengin
   profili tutar (veli ilişkisi, sınıf, no). Şu an `users` + `accessCodes` ile
   idare ediliyor; MVP için yeterli ama ölçeklenince ayrılmalı.

---

## 4. Eksik Firestore koleksiyonları (tanımlı ama kullanılmayan)

`collections.ts`'te **tanımlı ama servisi/yazımı olmayan**:
- `settings` — ❌ servis yok (kritik)
- `payments` — ❌ servis yok
- `notifications` — ⚠️ yalnızca okuma/tip, yazım yok
- `appointments` — ❌ (randevu localStorage'da)
- `counselingSessions` — ❌ (rehberlik mock)
- `reportCards` — ❌ (karne PDF var, koleksiyon yok)
- `subscriptions`, `devices`, `aiUsage`, `notificationLogs/Preferences` — ileride

---

## 5. Mantıksal hatalar / tutarsızlıklar

1. **Bursluluk sonuç akışı kopuk:** Başvuru gerçek kaydoluyor ama yönetici
   sonuç giremiyor, veli gerçek sonuç sorgulayamıyor (mock `sampleResult`).
2. **Settings tek kaynak değil:** Ders saatleri, eğitim yılı, bursluluk tarihleri
   her modülde ayrı sabit. Tek `settings` kaynağından okunmuyor.
3. **Finans ada:** Öğrenciyle ödeme arasında bağ yok; tahsilat tablosu mock.
4. **Bildirim çift standart:** Composer localStorage, panel ayrı mock liste.
5. **Lead → öğrenci dönüşümü** gerçek (kod üretir) ama **öğrenci profili zenginliği**
   (veli e-postası, sınıf) dönüşümde tam taşınmıyor.

---

## 6. Güvenlik açıkları / riskler

1. ✅ **İyi:** Firestore kuralları canlı, tenant izolasyonu, yetki yükseltme
   engeli, askıya alma, collection-group süper admin kısıtı — hepsi deploy edildi.
2. ⚠️ **`tenants/{id}` herkese açık okuma** — okul dizini için bilinçli; ama tenant
   doc'una hassas alan EKLENMEMELİ (şu an güvenli: ad/şehir/durum).
3. ⚠️ **`platform/**` okuma `isActiveUser`** — herhangi bir aktif kullanıcı platform
   config okuyabilir; hassas config buraya konmamalı (audit log kökte, güvenli).
4. ⚠️ **NEXT_PUBLIC Firebase anahtarları** istemcide (normal) — asıl koruma
   kurallarda; doğru.
5. ⚠️ **Settings yazımı** eklenince kural gerekecek: `tenants/{id}/settings`
   yazımı yalnızca okul yönetimi (zaten generic tenant write kuralı kapsıyor —
   `isStaff() && myTenant()==id && tenantNotSuspended`). ✅ Hazır.

---

## 7. Tenant sorunları

- ✅ Tüm gerçek veri `tenants/{tenantId}/...` altında.
- ✅ İzolasyon kurallarla zorlanıyor; süper admin collection-group ile çapraz okur.
- ⚠️ **Mock tenant kimlikleri** (`tenant_ikk` vb.) bazı eski servislerde
   `DEFAULT_TENANT_ID` olarak duruyor (leads/audit). Gerçek girişte profilden
   `tenantId` alınıyor; ama default'lar temizlenmeli (kafa karışıklığı riski).

---

## 8. Auth sorunları

- ✅ Tek kaynak `users/{uid}`; tüm zorunlu alanlar mevcut (uid, email,
  displayName, role, tenantId, schoolId, status, createdAt, updatedAt).
- ✅ RoleGuard korumalı sayfalarda çalışıyor; rol bazlı yönlendirme + askıya alma
  (hesap + okul) hem UI hem kurallarda.
- ⚠️ **Custom claims yok** — rol/tenant Firestore profilinden okunuyor (her kural
  değerlendirmesinde `get()`). MVP için çalışır; ölçeklenince custom claims'e
  geçilmeli (maliyet/performans).
- ⚠️ **İlk süper admin** elle oluşturulmalı (Firestore'da `role: SUPER_ADMIN`).
  Dokümante edilmeli.

---

## 9. MVP için kalan işler

1. **Settings servisi + School/Academic/Scholarship/Timetable ayarları** (Firestore).
2. **Bursluluk sonuç akışı:** yönetici sonuç/burs oranı girer, veli gerçek sorgular.
3. **Finans:** öğrenci bazlı ödeme durumu (`payments`) servisi + panel.
4. **Bildirim:** composer → `tenants/{id}/notifications` Firestore + panel okuma.
5. **Veli paneli:** bağlı öğrencinin gerçek devamsızlık/ödev/not/finansı.
6. **DEFAULT_TENANT_ID temizliği** — her yerde profilden tenantId.
7. **İlk süper admin / kurulum** dokümanı.

---

## 10. Production öncesi yapılması gerekenler

- [ ] Firestore **composite index** ihtiyacı (where+orderBy eklenirse) gözden geçir.
- [ ] **Güvenlik kuralları** son gözden geçirme (settings/payments yazımı).
- [ ] **Hata/boş durum** ekranları (mock mod uyarıları) tutarlı.
- [ ] **İlk kurulum sihirbazı** (okul + ilk admin + settings).
- [ ] **Yedekleme** (DataBackupSettings JSON export hazır; otomatik yedek backend gerekir).
- [ ] **KVKK/gizlilik** metinleri, çerez.
- [ ] **Performans:** custom claims, sayfa başına sorgu sayısı.
- [ ] **E2E test** kritik akışlar (login→panel, lead→öğrenci, başvuru→sonuç).

---

## GÜNCELLEME — Uygulanan öncelikler (canlı)

Aşağıdaki öncelikler bu rapordan sonra **gerçekleştirildi** (hepsi `main`'de):

- ✅ **#1 Settings** — `settings.ts` + `LiveSettings` (school/academic/scholarship/timetable, gerçek Firestore)
- ✅ **#2 Bursluluk sonuç girişi** — `setScholarshipResult` + `ScholarshipResultsManager`
- ✅ **#3 Finans** — `payments.ts` + `PaymentManager` (PENDING/PARTIAL/PAID/OVERDUE)
- ✅ **#4 Bildirim** — `notifications.ts` + `NotificationFeed` (Firestore, FCM yok)
- ✅ **#5 Veli paneli** — grades/attendance/assignments/schedule zaten gerçekti; `ParentFinanceCard` eklendi
- ✅ **#6–7 Settings tüketimi** — `ScholarshipSettingsBanner` + AccountSummaryCard akademik yıl okuması
- ✅ **#9 Kurulum** — `docs/KURULUM.md` (ilk SUPER_ADMIN dahil)
- ✅ **#10 AI dondurma** — `AiComingSoonNotice` tüm AI sayfalarında

**Kalan (bilinçli ertelendi):**
- #8 `DEFAULT_TENANT_ID` temizliği — public formları bozma riski (dikkatli yapılmalı)
- Veli **public bursluluk sonuç sorgulama** — yeni `scholarshipResults` koleksiyonu + kural deploy gerektirir

---

## TAMAMLANMA ORANI

| Katman | Tamamlanma |
|---|---|
| Frontend / sayfalar / UI | ~%90 |
| Auth + rol + tenant mimarisi | ~%90 |
| Veri omurgası (gerçek servisler) | ~%75 |
| Okul operasyonları (program/yoklama/ödev/not/CRM/bursluluk başvuru) | ~%70 |
| Settings / Finans / Bildirim (gerçek) | ~%20 → **~%85** ✅ |
| AI modülleri | %0 (kasıtlı dondurulmuş, net "Coming Soon") |

### **Genel MVP tamamlanma: ~%65 → ~%82** (AI hariç ~%88)

> Güncelleme: #1–7, #9, #10 tamamlandı. Settings/Finans/Bildirim/Bursluluk-sonuç
> artık gerçek Firestore. Kalan: #8 (temizlik) ve public sonuç sorgulama (deploy).

Sistem **satılabilir MVP'ye yakın**. Eksik olan, birkaç uç modülün (settings,
finans, bildirim, bursluluk sonuç) Firestore'a bağlanması.

---

## EN KRİTİK İLK 10 İŞ (öncelik sırasıyla)

1. **Settings servisi + School Settings (Firestore)** — diğer modüllerin tek
   ayar kaynağı. *(En yüksek kaldıraç.)*
2. **Bursluluk sonuç girişi (yönetici) + gerçek sonuç sorgulama (veli)** — ürünün
   en güçlü satış noktası.
3. **Finans: öğrenci bazlı ödeme durumu servisi + panel** (PENDING/PARTIAL/PAID/OVERDUE).
4. **Bildirim: Firestore `notifications` yazımı + panelde okuma** (FCM yok).
5. **Veli paneli gerçek veri** (bağlı öğrencinin devamsızlık/ödev/not/finans).
6. **Academic Settings** (eğitim yılı/dönem/sınıf seviyeleri) → modüller okur.
7. **Timetable Settings** (ders saatleri/teneffüs/gün) → program modülü okur.
8. **DEFAULT_TENANT_ID temizliği** — tüm servisler profilden tenantId alsın.
9. **İlk kurulum/süper admin dokümanı + sihirbaz.**
10. **AI panellerine "Coming Soon" şeffaf durumu** (dondurulmuş ama net).

---

*Bu rapor kod inceleme envanterine dayanır; uygulama bu rapordaki öncelik
sırasına göre yapılacaktır.*
