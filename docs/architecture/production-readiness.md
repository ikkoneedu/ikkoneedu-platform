# Production Hazırlığı: SEO, Güvenlik, Form & Env

> Bu sürümde gerçek auth, AI, FCM, SMS ve ödeme **yoktur**. Bu doküman, satılabilir
> MVP için kurulan SEO / güvenlik / form / production altyapısını ve Firebase
> bağlandığında dokunulacak noktaları açıklar.

## 1. SEO

- **Merkezi yardımcı:** `lib/seo/seo.ts` → `buildMetadata()` (title/description/
  keywords/canonical/OpenGraph/Twitter). `siteUrl`, `NEXT_PUBLIC_APP_URL`'den okunur.
- **Global metadata:** `app/layout.tsx` (`metadataBase`, title template, robots,
  ikon, OG/Twitter varsayılanları, `viewport` + `themeColor`).
- **Sayfa metadata'sı:** `/`, `/features`, `/pricing`, `/demo`, `/founder-school`,
  `/scholarship-exam` `buildMetadata()` kullanır. Hedef anahtar kelimeler doğal
  şekilde işlenmiştir (okul yönetim sistemi, kolej yazılımı, özel okul CRM,
  bursluluk sınavı başvuru sistemi, anaokulu yönetim sistemi, eğitim kurumu yazılımı).
- **sitemap & robots:** `app/sitemap.ts`, `app/robots.ts` (korumalı route'lar
  `lib/auth/route-config.ts`'ten türetilir; public istisnalar korunur).
- **JSON-LD:** `components/seo/JsonLd.tsx` + `lib/seo/structured-data.ts`
  (Organization, SoftwareApplication → ana sayfa; FAQPage → `/demo`, `/pricing`).
- **İkon:** `app/icon.svg` (favicon otomatik üretilir).

## 2. Güvenlik

- **Header'lar:** `next.config.ts` → CSP (dev'i bozmayacak şekilde), X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy ve production'da HSTS.
  `connect-src https: wss:` Firebase için şimdiden açıktır.
- **Middleware:** `middleware.ts` — şu an **engelleme yapmaz**; güvenlik header'larını
  pekiştirir ve korumalı route'ları işaretler. Firebase Auth için hazır iskelet.
- **Route ayrımı:** `lib/auth/route-config.ts` — public/protected route'lar ve
  rol eşlemesi (`ROUTE_ROLES`) tek kaynaktan yönetilir.

## 3. Form Güvenliği

- **Validation (Zod):** `lib/validation/*` (`common`, `demo-request`,
  `scholarship-application`). Telefon, e-posta, ad soyad, okul adı doğrulanır.
- **Spam koruması:** `lib/security/spam-protection.ts` (honeypot, submit cooldown,
  basit rate-limit) + `components/shared/HoneypotField.tsx`.
- **Bağlı formlar:** Demo (`/demo`) ve bursluluk başvuru formu
  (`/scholarship-exam/apply`, `/school/[slug]/scholarship/apply`).
- reCAPTCHA, SMS, WhatsApp **eklenmedi** (ileride).

## 4. Environment

- `.env.example` ve `.env.local.example`: `NEXT_PUBLIC_*` istemci değerleri;
  gizli anahtarlar (Firebase Admin, AI) **NEXT_PUBLIC_ öneki olmadan**, açıklamalı
  ve yorum satırında bekler. `.env.local` commit edilmez.
- `NEXT_PUBLIC_APP_URL` ayarlanırsa canonical/sitemap/OG mutlak URL'leri doğru üretilir.

## 5. Firebase Bağlanınca Dokunulacak Dosyalar

| Dosya | Yapılacak |
|-------|-----------|
| `.env.local` | `NEXT_PUBLIC_FIREBASE_*` değerlerini doldur. |
| `middleware.ts` | `AUTH_ENABLED = true`; oturum çerezi/claim doğrulamasını bağla. |
| `lib/auth/route-config.ts` | Gerekirse rol eşlemesini güncelle (kaynak hazır). |
| `lib/firebase/client.ts` | Değişiklik gerekmez; env dolunca otomatik aktifleşir. |
| `lib/services/*` | Değişiklik gerekmez; env dolunca Firestore'a yazar. |
| `.env.example` (Admin SDK) | Sunucu doğrulaması için Admin SDK anahtarlarını ekle. |

> Auth bağlanmadan giriş akışı "fake" şekilde büyütülmemiştir; yalnızca koruma
> altyapısı hazırdır.
