# IKK ONE EDU OS — Kurulum Rehberi

Bu doküman, sistemi sıfırdan canlıya almak ve **ilk süper admini** oluşturmak
için adımları içerir. (AI entegrasyonları bu sürümde dondurulmuştur.)

---

## 1. Firebase projesi

1. https://console.firebase.google.com → proje oluştur (ör. `ikkoneedu-7120d`).
2. **Authentication → Sign-in method → Email/Password**'ü etkinleştir.
3. **Firestore Database** oluştur (production mode).
4. **Project Settings → General → Your apps → Web app** ekle; SDK config'i kopyala.

## 2. Ortam değişkenleri

`.env.local` (yerel) ve **Vercel → Settings → Environment Variables** (canlı):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<proje>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<proje>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<proje>.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

> `NEXT_PUBLIC_*` değişkenleri **build anında** gömülür → Vercel'de ekledikten
> sonra **yeniden deploy** et.

## 3. Güvenlik kurallarını deploy et

```bash
firebase login          # Codespaces'te: firebase login --no-localhost
firebase use --add      # projeyi seç, alias: default
firebase deploy --only firestore:rules
```

veya **Firebase Console → Firestore → Rules** sekmesine `firestore.rules`
içeriğini yapıştırıp **Publish**.

## 4. İlk SÜPER ADMİN'i oluştur

Sistemde okul/kullanıcı oluşturmaya yetkili ilk hesap elle kurulur:

**4.1.** Firebase Console → **Authentication → Users → Add user**
- E-posta + şifre gir (ör. `ikkdijital@gmail.com`). Kullanıcının **UID**'sini kopyala.

**4.2.** Firestore Console → **Start collection** → `users` →
**Document ID = kopyaladığın UID** → şu alanlarla belge oluştur:

| Alan | Tip | Değer |
|---|---|---|
| `uid` | string | (UID) |
| `email` | string | ikkdijital@gmail.com |
| `displayName` | string | Sistem Yöneticisi |
| `role` | string | **SUPER_ADMIN** |
| `tenantId` | string | **platform** |
| `schoolId` | string | platform |
| `status` | string | **ACTIVE** |
| `createdAt` | string | (bugünün tarihi) |

**4.3.** `/login`'den bu hesapla gir → `/super-admin` konsoluna yönlenirsin.

## 5. İlk okulu ve kurucuyu oluştur

`/super-admin` → **Okul Oluştur**:
- Okul adı + (opsiyonel) kurucu e-postası gir → okul (tenant) + **FOUNDER**
  hesabı + geçici şifre oluşur. Şifreyi kurucuya ilet.

Kurucu `/login`'den girer → `/admin` paneline yönlenir → personel (müdür,
öğretmen, koordinatör, PR) ve sınıf/kod üretebilir.

## 6. Okul ayarlarını gir

`/settings` → **Okul Ayarları** (canlı): okul kimliği, akademik yıl, bursluluk
tarihleri, ders saatleri → `tenants/{id}/settings/*`'a kaydedilir.

---

## Rol hiyerarşisi (özet)

| Rol | Erişim |
|---|---|
| SUPER_ADMIN | Tüm okullar, global CRM, okul oluşturma |
| FOUNDER | Kendi okulu (finans dahil) + personel oluşturma |
| SCHOOL_ADMIN | Okul yönetimi (finans dahil) |
| PRINCIPAL | Okul yönetimi (finans hariç) + personel |
| VICE_PRINCIPAL / COORDINATOR | Akademik yönetim |
| TEACHER | Sınıf, yoklama, ödev, not |
| PR / SALES | CRM / aday veli |
| PARENT | Bağlı öğrenci: devamsızlık/ödev/not/finans |
| STUDENT | Program, ödev, not |
| PUBLIC | Okul keşfi, bilgi talebi, bursluluk başvurusu |

## Güvenlik notları

- Tüm okul verisi `tenants/{tenantId}/...` altında, **tenant izole**.
- Yazma yetkisi kurallarla zorlanır; askıya alınan hesap/okul erişemez.
- `NEXT_PUBLIC_*` anahtarları istemcide görünür (normaldir); asıl koruma
  **Firestore kurallarındadır**.
- Denetim kayıtları: yönetim işlemleri `platformAuditLogs` ve tenant `auditLogs`'a yazılır.

## Mock / dondurulmuş

- **AI panelleri** (sınav/program/rapor üreticiler, AI beyin) — entegrasyon yok.
- **Push (FCM) / SMS / e-posta dağıtımı**, **ödeme ağ geçidi** — sağlayıcı anahtarı
  gerektirir; bu sürümde yoktur. Bildirimler yalnızca panelde gösterilir.
