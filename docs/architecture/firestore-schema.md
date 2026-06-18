# Firestore Koleksiyon Şeması

> Durum: **Hazırlık.** Firebase kurulmadı. Bu şema `lib/firebase/collections.ts`
> ve `lib/firebase/firestore-paths.ts` ile koddan da erişilebilir.

## Platform geneli (yalnızca Super Admin)

```
platform/config            # platform yapılandırması
platform/globalSettings    # global ayarlar
platform/auditLogs/{logId} # platform düzeyi denetim kayıtları
```

## Tenant (okul) bazlı

```
tenants/{tenantId}
  ├─ users/{userId}
  │    └─ devices/{deviceId}              # FCM token / cihaz kaydı
  ├─ students/{studentId}
  ├─ parents/{parentId}
  ├─ teachers/{teacherId}
  ├─ announcements/{announcementId}
  ├─ messages/{messageId}
  ├─ notifications/{notificationId}
  ├─ notificationLogs/{logId}
  ├─ notificationPreferences/{userId}
  ├─ appointments/{appointmentId}
  ├─ leads/{leadId}
  ├─ subscriptions/{subscriptionId}
  ├─ payments/{paymentId}
  ├─ settings/{section}                  # platform | security | ai
  ├─ auditLogs/{logId}
  ├─ aiUsage/{usageId}
  └─ devices/{deviceId}                   # (alternatif düz cihaz koleksiyonu)
```

## Ortak belge alanları

Her belge mümkün olduğunca şu temel alanları taşır
(`lib/firebase/firebase-types.ts → FirestoreDocument`):

| Alan | Tip | Açıklama |
|------|-----|----------|
| `id` | string | Belge kimliği |
| `tenantId` | string | Bağlı tenant (okul) |
| `schoolId` | string? | Kampüs kimliği (opsiyonel) |
| `createdAt` | string (ISO) | Oluşturulma |
| `updatedAt` | string (ISO)? | Güncellenme |

## Tip ↔ Koleksiyon eşlemesi

| Koleksiyon | Type (`src/types`) |
|-----------|--------------------|
| tenants | `Tenant` |
| users | `BaseUser` / `UserProfile` |
| students | `Student` |
| parents | `Parent` |
| teachers | `Teacher` |
| announcements | `Announcement` |
| messages | `Message` |
| notifications | `Notification` |
| appointments | `Appointment` |
| leads | `Lead` |
| subscriptions | `Subscription` |
| payments | `Payment` |
| aiUsage | `AiUsage` |
| auditLogs | `AuditLog` |
| settings | `TenantSettings` |

## İndeksleme notları

- Funnel/CRM sorguları için `leads` üzerinde `stage`, `source`, `createdAt`.
- Bildirim raporları için `notifications` üzerinde `type`, `channel`, `createdAt`.
- AI kota için `aiUsage` üzerinde `userId`, `createdAt` (günlük toplama).
