# Firestore Security Rules

> Kurallar `firestore.rules` dosyasındadır. Yetki kaynağı kullanıcının
> `users/{uid}` profilindeki `role` + `tenantId` alanlarıdır (custom claims'e
> geçilene kadar).

## Erişim özeti

| Yol | Okuma | Yazma |
|-----|-------|-------|
| `users/{uid}` | Kendisi veya SUPER_ADMIN | Yalnızca SUPER_ADMIN |
| `tenants/{t}/demoRequests` | Tenant üyesi | **Herkes create** (halka açık form) |
| `tenants/{t}/scholarshipApplications` | Tenant üyesi | **Herkes create** (halka açık form) |
| `tenants/{t}/leads` | Tenant üyesi | Tenant üyesi |
| `tenants/{t}/**` (diğer) | Tenant üyesi | Tenant üyesi |
| `platform/**` | Aktif kullanıcı | Yalnızca SUPER_ADMIN |
| `connectionTests/**` | SUPER_ADMIN | Herkes create (test) |
| Diğer her şey | — | Kapalı |

- **Tenant üyesi**: profili `ACTIVE` ve `tenantId` eşleşen kullanıcı. SUPER_ADMIN
  tüm tenant'lara erişir.
- Demo ve bursluluk formları kimlik doğrulaması olmadan gönderildiği için bu iki
  koleksiyonda anonim **create** açıktır; **okuma** tenant üyesine kapalıdır.

## İlk admin profilini oluşturma (önemli — yumurta/tavuk)

Kurallar `users` yazımını yalnızca SUPER_ADMIN'e açar. İlk SUPER_ADMIN profilini
oluşturmanın iki yolu vardır:

**Yöntem A — Kurallardan ÖNCE script ile (en kolay):**
1. Firestore hâlâ *Test mode*'dayken (veya kurallar yayınlanmadan önce):
   ```bash
   npm run firebase:create-admin-profile -- <UID>
   ```
2. Sonra aşağıdaki kuralları yayınlayın.

**Yöntem B — Firebase Console'dan elle:**
1. Firestore Database → `users` koleksiyonu → belge ID = kullanıcının **UID**'si.
2. Alanlar: `role: "SUPER_ADMIN"`, `tenantId: "system"`, `schoolId: "system"`,
   `status: "ACTIVE"`, `email`, `displayName`.

> Kurallar yayınlandıktan sonra yeni kullanıcı profilleri yalnızca bir
> SUPER_ADMIN tarafından (ileride uygulama içi yönetim ekranından) oluşturulur.

## Kuralları yayınlama

**Firebase Console (en hızlı):**
Firestore Database → **Rules** sekmesi → `firestore.rules` içeriğini yapıştır →
**Publish**.

**Firebase CLI:**
```bash
npm i -g firebase-tools          # kuruluysa atla
firebase login
firebase use <PROJE_ID>          # ikkoneedu-7120d
firebase deploy --only firestore:rules
```
(`firebase.json` ve `firestore.indexes.json` repoda hazırdır.)

## Test sonrası

- `connectionTests` koleksiyonunu ve test belgelerini Console'dan silebilirsiniz.
- Üretimde `connectionTests` kuralını tamamen kaldırabilirsiniz.

## Sonraki adım: Custom Claims

Şu an rol/tenant her istekte `users/{uid}` belgesinden `get()` ile okunur (ek
okuma maliyeti). Ölçeklenince `role` + `tenantId` Firebase Auth **custom
claims**'e taşınmalı; kurallar `request.auth.token.role` / `.tenantId` kullanır.
Bu, Firebase Admin SDK (sunucu) gerektirir — şu an kapsam dışıdır.
