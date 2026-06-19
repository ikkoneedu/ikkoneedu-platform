# Firebase Kurulumu (Başlangıç Entegrasyonu)

> **Durum:** Başlangıç entegrasyonu. Firebase Auth ve Firestore **bağlantısı**
> hazırlanmıştır; gerçek kullanıcı sistemi, ödeme, AI, FCM ve SMS **yoktur**.
> Ortam değişkenleri tanımlı değilken uygulama **Mock Mod** çalışır.

## 1. Firebase Projesi Kurulumu

1. [Firebase Console](https://console.firebase.google.com) üzerinden bir proje
   oluşturun.
2. **Project Settings → General → Your apps** bölümünden bir **Web App** ekleyin.
3. Firebase size bir `firebaseConfig` nesnesi verir. Bu değerleri `.env.local`
   içine aktarın (aşağıya bakın). **Değerleri koda gömmeyin.**

## 2. Authentication Kurulumu

1. **Build → Authentication → Get started**.
2. Sign-in method olarak **Email/Password** (ve istenirse **Phone**) etkinleştirin.
3. Bu sürümde gerçek giriş akışı bağlanmamıştır; yalnızca SDK bağlantısı
   (`getAuth`) hazırdır. Roller ve custom claims için bkz.
   [`login-and-tenant-flow.md`](./login-and-tenant-flow.md) ve
   `lib/auth/firebase-auth-types.ts`.

## 3. Firestore Kurulumu

1. **Build → Firestore Database → Create database**.
2. Geliştirme için **Test mode** ile başlayabilirsiniz.
   > ⚠️ **Test mode uyarısı:** Test modu kuralları herkese okuma/yazma izni
   > verir ve yalnızca geçici geliştirme içindir. Üretime **asla** test modu
   > kurallarıyla çıkmayın.
3. Koleksiyon yapısı çok kiracılıdır (multi-tenant). Yollar
   `lib/firebase/collections.ts` içindeki yardımcılarla üretilir:

   ```
   platform/config
   tenants/{tenantId}
   tenants/{tenantId}/users
   tenants/{tenantId}/students
   tenants/{tenantId}/teachers
   tenants/{tenantId}/parents
   tenants/{tenantId}/announcements
   tenants/{tenantId}/messages
   tenants/{tenantId}/notifications
   tenants/{tenantId}/leads
   tenants/{tenantId}/demoRequests
   tenants/{tenantId}/scholarshipExams
   tenants/{tenantId}/scholarshipApplications
   tenants/{tenantId}/settings
   tenants/{tenantId}/auditLogs
   ```

## 4. Ortam Değişkenleri (`.env`)

`.env.local.example` dosyasını `.env.local` olarak kopyalayın ve doldurun:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

- `NEXT_PUBLIC_` önekli değerler istemciye gönderilir; Firebase Web SDK için bu
  normaldir. **Erişim güvenliği API anahtarıyla değil, Firestore Security Rules
  ile sağlanır.**
- `.env.local` dosyası `.gitignore` içindedir ve **asla commit edilmez**.

## 5. Mock Mod (Env yokken)

`lib/firebase/client.ts` içindeki `isFirebaseConfigured()` env değerlerini
kontrol eder:

- **Env tanımlı değilse:** Firebase başlatılmaz; `auth`, `db`, `storage` `null`
  döner. Servis katmanı (`lib/services/*`) Firestore'a yazmaz, formlar yine
  başarı mesajı gösterir.
- **Env tanımlıysa:** Firebase başlatılır (tek sefer, `getApps()` koruması) ve
  servisler Firestore'a `addDoc` ile yazar.

Bağlantı durumu **Ayarlar → Entegrasyonlar** altındaki
*Firebase Bağlantısı* kartında görünür ("Bağlantıya Hazır" / "Mock Mod").

### Firestore'a yazmaya hazır servisler

| Servis | Fonksiyon | Koleksiyon |
|--------|-----------|------------|
| Demo talep | `createDemoRequest` | `tenants/platform/demoRequests` |
| Bursluluk başvurusu | `createScholarshipApplication` | `tenants/{tenantId}/scholarshipApplications` |
| Lead | `createLead` | `tenants/{tenantId}/leads` |
| Denetim kaydı | `createAuditLog` | `tenants/{tenantId}/auditLogs` |

Bağlı formlar: `/demo`, `/scholarship-exam/apply`,
`/school/[slug]/scholarship/apply`, `/crm` (Yeni Lead).

## 6. Production Security Rules (Sonra Eklenecek)

> Bu sürümde **production Security Rules dahil değildir.** Üretime çıkmadan önce
> `tenantId` + `role` (custom claims) tabanlı kurallar eklenecektir. Taslak ve
> notlar için bkz. `lib/firebase/security-rules-notes.ts` ve
> `firebase-auth-plan.md`.

Örnek hedef kural mantığı (özet):

```
match /tenants/{tenantId}/{document=**} {
  allow read, write: if request.auth != null
    && request.auth.token.tenantId == tenantId;
}
```

## Kapsam Dışı (Bu Sürümde Eklenmedi)

- ❌ Gerçek kullanıcı/oturum sistemi (Auth akışı bağlanmadı)
- ❌ OpenAI / Anthropic / gerçek AI entegrasyonu
- ❌ FCM (push bildirim)
- ❌ SMS
- ❌ Ödeme sistemi
- ❌ Production Firestore Security Rules
