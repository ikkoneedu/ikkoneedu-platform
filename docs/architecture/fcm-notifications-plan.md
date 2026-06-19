# FCM & Bildirim Planı

> Durum: **Hazırlık.** Gerçek Firebase Cloud Messaging kurulmadı.

## Amaç

Push, sistem içi, e-posta ve SMS bildirimlerini tek merkezden, tenant bazlı ve
rol odaklı göndermek; okundu/okunmadı durumunu takip etmek.

## Koleksiyonlar

```
tenants/{tenantId}/notifications/{notificationId}        # gönderilen bildirim
tenants/{tenantId}/notificationLogs/{logId}              # teslim/okunma kaydı
tenants/{tenantId}/notificationPreferences/{userId}      # kullanıcı tercihleri
tenants/{tenantId}/devices/{deviceId}                    # FCM token / cihaz
users/{userId}/devices/{deviceId}                        # (alternatif)
```

İlgili tipler: `Notification`, `NotificationPreference`, `DeviceToken` (`src/types`).

## İş Akışı

1. Kullanıcı giriş yapar; istemci FCM token üretir (`getToken` + VAPID).
2. Token `devices` koleksiyonuna yazılır (`platform`, `active`, `lastSeenAt`).
3. Yönetici bildirim oluşturur (alıcı grubu + kanal + içerik).
4. `sendNotification` Cloud Function hedef kullanıcıları çözer
   (rol/sınıf/okul → Custom Claims + Firestore sorgusu veya FCM topic).
5. Tercihler (`notificationPreferences`) gönderim öncesi filtre uygular.
6. FCM `sendEachForMulticast` / topic publish; SMS/e-posta kanalları aynı
   Function'dan tetiklenir.
7. Teslim/okunma `notificationLogs`'a yazılır; okunma oranı buradan hesaplanır.

## Güvenlik & Kanallar

- Anahtarlar (FCM server key, SMS/e-posta sağlayıcı) yalnızca Function ortam
  değişkenlerinde.
- Acil mod: `priority: high` + APNs/Android öncelik başlıkları.
- Tüm gönderimler `auditLogs`'a kaydedilir; KVKK için opt-out tercihleri.

## UI Karşılığı

`/notifications` ve `/messages` ekranları bu sözleşmeye bağlı; yalnızca mock
gönderim gerçek Function çağrısıyla değiştirilecek.
