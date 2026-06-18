# Firebase Auth Planı

> Durum: **Hazırlık.** Firebase Auth kurulmadı, bağlanmadı.

## Kimlik Doğrulama

- **Firebase Auth** kullanılacak (e-posta/şifre + ileride SSO).
- Oturum, Custom Claims ile zenginleştirilir.

## Custom Claims

| Claim | Açıklama |
|-------|----------|
| `role` | Kullanıcı rolü (`SUPER_ADMIN` … `STUDENT`) |
| `tenantId` | Bağlı okul (tenant) kimliği |
| `schoolId` | Kampüs kimliği (opsiyonel) |

Claims, kullanıcı oluşturulurken/rol değişiminde bir **Admin SDK Cloud
Function** ile atanır.

## Route Koruması (Middleware)

- `middleware.ts` ile korunan rotalar denetlenir.
- Tenant çözümleme: `lib/tenant/tenant-resolver.ts` (subdomain → `tenantId`).
- Rol → route eşlemesi `docs/architecture/roles-permissions.md` matrisine göre.
- Yetkisiz erişim `/login` veya 403'e yönlendirilir.

```
İstek → middleware → oturum/claims oku → tenant çöz → rol-route kontrolü → izin/yönlendir
```

## Firestore Security Rules

- Role + `tenantId` bazlı (bkz. `lib/firebase/security-rules-notes.ts`).
- **Super Admin:** global platform verilerine erişir.
- **Okul yöneticisi:** yalnızca kendi tenant verisine erişir.
- **Öğretmen:** yalnızca bağlı olduğu sınıf/öğrenci verilerine erişir.
- **Veli:** yalnızca kendi çocuğuyla ilişkili verileri görür.
- **Öğrenci:** yalnızca kendi verisine erişir.

## Kurulum Adımları (ileride)

1. `npm i firebase` (+ `firebase-admin` sunucu için).
2. `lib/firebase/firebase-config.ts` → `initializeApp` + `getAuth` + `getFirestore`.
3. Ortam değişkenleri `.env.local` (bkz. `.env.example`).
4. Custom Claims atayan Cloud Function (`setUserRole`).
5. `middleware.ts` ile route koruması.
6. `firestore.rules` (notlardan üret) + composite index'ler.
7. `lib/data/*` fonksiyonlarını Firestore sorgularıyla doldur.
