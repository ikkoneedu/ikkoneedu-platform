# SECURITY_CHECKLIST.md — IKK ONE EDU OS

## Anahtarlar ve ortam değişkenleri
- [ ] `NEXT_PUBLIC_FIREBASE_*` değerleri **public client key**'dir; istemciye
      gönderilmesi normaldir (Firebase Web SDK gereği). Güvenlik bunlarla değil
      **Firestore Rules** ile sağlanır.
- [ ] **Service account / private key (`FIREBASE_ADMIN_PRIVATE_KEY` vb.) ASLA
      commit edilmez** ve `NEXT_PUBLIC_` öneki almaz. Yalnızca sunucu ortamında
      (Vercel env) tutulur.
- [ ] `.env.local` **commit edilmez** (`.gitignore` içinde).
- [ ] `.env.local.example` güvenli örnek olarak (boş değerlerle) tutulur.
- [ ] AI sağlayıcı anahtarları (`OPENAI_/ANTHROPIC_/GEMINI_`) yalnızca sunucu;
      bu sürümde kullanılmaz.

## Firestore / tenant
- [ ] **Firestore Security Rules olmadan production kabul edilmez.**
- [ ] **Tenant izolasyonu zorunlu** — kullanıcı kendi tenant'ı dışındaki veriyi
      okuyamaz/yazamaz.
- [ ] **Role-based access control** kurallarla zorlanır (sadece UI ile değil).
- [ ] Kullanıcı kendi profilinde kritik alanları (`role`, `tenantId`, `schoolId`,
      `status`, `linked*`, `permissions`) **değiştiremez** (allow-list ile).
- [ ] Hassas koleksiyonlar (`payments`, `settings`, `auditLogs`) yalnızca yetkili
      role açıktır; catch-all kural bunları dışlar.

## Uygulama / route
- [ ] Admin route'ları korunur (istemcide `RoleGuard`, sunucuda gizli işler için
      ID token doğrulamalı API route).
- [ ] Sunucu Admin SDK route'ları çağıranın **ID token'ını doğrular** ve yetkiyi
      sunucuda zorlar (örn. `app/api/admin/create-user`).
- [ ] Halka açık sorgular (bursluluk sonuç/giriş belgesi) **doğrulayıcı**
      (başvuru no + TC/telefon) ister; tek bir numarayla veri sızdırılmaz.

## Form / girdi
- [ ] Tüm formlarda validation (istemci + sunucu).
- [ ] XSS: kullanıcı girdisi `dangerouslySetInnerHTML` ile basılmaz.
- [ ] Injection: Firestore sorguları parametreli helper'larla kurulur.
- [ ] Open redirect: yönlendirme parametreleri yalnız site-içi yollara izin verir.

## Veri / gizlilik
- [ ] **PII loglanmaz** (TC, telefon, e-posta, şifre konsola/log'a yazılmaz).
- [ ] Geçici şifre **Firestore'a yazılmaz**; yalnız oluşturma anında bir kez gösterilir.
- [ ] Yönetilen hesaplarda `mustChangePassword: true`.
- [ ] **Audit log** önemli işlemler için (hesap oluşturma, rol değişimi, silme).

## Production öncesi son kontrol
- [ ] `firebase deploy --only firestore:rules` ile kurallar yayınlandı.
- [ ] `npm run lint` + `npx tsc --noEmit` + `npm run build` temiz.
- [ ] `npm audit` gözden geçirildi; kritik/yüksek açık yok (server-only/upstream
      olanlar belgelendi).
- [ ] Güvenlik header'ları aktif (`X-Frame-Options`, `X-Content-Type-Options`,
      `Referrer-Policy` — `middleware.ts`).
