# Firebase Entegrasyon Planı

> Durum: **Hazırlık.** Firebase SDK kurulmadı, yapılandırma bağlanmadı.
> Bu aşamada yalnızca koleksiyon yapısı ve konfigürasyon şablonu tanımlandı.

## Koleksiyon Yapısı

```
tenants/{tenantId}
  ├─ users/{userId}
  ├─ students/{studentId}
  ├─ teachers/{teacherId}
  ├─ parents/{parentId}
  ├─ announcements/{announcementId}
  ├─ notifications/{notificationId}
  ├─ subscriptions/{subscriptionId}
  ├─ settings/{section}
  └─ auditLogs/{logId}

platform/config   (global — yalnızca super admin)
```

Koleksiyon adları `lib/firebase/collections.ts` içinde merkezileştirildi.

## Kimlik Doğrulama

- **Firebase Auth** + **Custom Claims**: `tenantId`, `role`.
- Rol bazlı erişim, claims üzerinden Security Rules ile uygulanır.

## Kurulum Adımları (ileride)

1. `npm i firebase` (ve gerekirse `firebase-admin`).
2. `lib/firebase/firebase-config.ts` içinde `initializeApp` + `getAuth` + `getFirestore`.
3. Ortam değişkenleri `.env.local` (bkz. `.env.example`).
4. `lib/data/*` fonksiyonlarını Firestore sorgularıyla doldur.
5. Security Rules ve composite index'leri tanımla.

## Yedekleme

Zamanlanmış Cloud Function ile Firestore export → Cloud Storage. Soft-delete
(`deletedAt`) deseni ile silinen veri kurtarma.
