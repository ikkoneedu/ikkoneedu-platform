# Custom Claims & Firebase Admin SDK

> Faz B. Rol/tenant bilgisini Firebase Auth **custom claims**'e taşıma altyapısı.
> Mevcut profil-bazlı sistem bozulmadan, **opt-in** ve **geriye dönük uyumlu**
> eklenmiştir.

## Neden?

Şu an Firestore kuralları rolü her istekte `users/{uid}` belgesinden `get()` ile
okur (ek okuma maliyeti + bazı per-doc kontrollerde karmaşıklık). Custom claims
ile `role` + `tenantId` **token içinde** taşınır; kurallar `request.auth.token.role`
kullanır (okuma yok, daha hızlı, daha basit).

## Kurulum

1. **Service account anahtarı:** Firebase Console → Project Settings →
   Service accounts → *Generate new private key*. İnen JSON'dan değerleri
   `.env.local`e ekleyin:
   ```
   FIREBASE_ADMIN_PROJECT_ID=...
   FIREBASE_ADMIN_CLIENT_EMAIL=...
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
   > `PRIVATE_KEY` tek satır, `\n` kaçışlı, çift tırnak içinde olmalı.
   > Bu değerler **NEXT_PUBLIC_ değildir** — istemciye sızmaz.

2. **İlk SUPER_ADMIN'e claim ata** (yerel bootstrap):
   ```bash
   npm run firebase:set-claims -- <UID> SUPER_ADMIN system system
   ```
   Kullanıcı bir sonraki girişte (token yenilenince) claim'i taşır.

3. **Diğer kullanıcılara claim** (uygulama içinden): `POST /api/admin/set-claims`
   ```json
   { "idToken": "<çağıranın ID token'ı>", "targetUid": "...", "role": "TEACHER", "tenantId": "tenant_ikk" }
   ```
   API çağıranı doğrular ve **yalnızca SUPER_ADMIN** claim atayabilir
   (`app/api/admin/set-claims/route.ts`).

## Bileşenler

| Dosya | Görev |
|-------|-------|
| `lib/firebase/admin.ts` | Admin SDK init (server-only, env yoksa null) |
| `app/api/admin/set-claims/route.ts` | Claim atama API'si (SUPER_ADMIN doğrulamalı) |
| `scripts/set-claims.mjs` | Yerel bootstrap (`firebase:set-claims`) |
| `components/auth/AuthProvider.tsx` | `claims` context'e eklendi (`getIdTokenResult`) |

## Kurallar (geriye dönük uyumlu)

`firestore.rules` içindeki `isSuperAdmin()` artık önce **token claim'ine** bakar,
yoksa Firestore profiline düşer:
```
function isSuperAdmin() {
  return tokenRole() == 'SUPER_ADMIN'
    || (isActiveUser() && myRole() == 'SUPER_ADMIN');
}
```
Böylece claim atanmamış mevcut kullanıcılar çalışmaya devam eder; claim atananlar
profil okumadan tanınır.

## Sonraki adım (opsiyonel tam geçiş)

`isStaff()`, `isTenantMember()`, `myTenant()` de claim-öncelikli hale getirilip
profil `get()` çağrıları azaltılabilir. Mevcut sürümde yalnızca `isSuperAdmin()`
claim-aware'dir (en düşük risk).
