# FIREBASE_ARCHITECTURE.md — Veri Modeli

> **Tek doğruluk kaynağı:** `lib/firebase/collections.ts`. Koleksiyon yolları
> component içinde **hardcode edilmez**; her zaman buradaki path helper'lar
> kullanılır (`tenantStudents(tenantId)`, `userProfileDoc(uid)` …).

## 1. Gerçek (uygulanan) yapı

### Kök (global) koleksiyonlar
```
users/{uid}                      # kullanıcı profili — role, tenantId, schoolId, status, linked*
schools/{schoolId}               # okulun kimlik/iletişim profili (schoolId = tenantId)
platformLeads/{leadId}           # SaaS satış lead'leri (tenant öncesi)
platformDemoRequests/{id}        # SaaS demo talepleri
platformAuditLogs/{logId}        # platform denetim kaydı (yalnız SUPER_ADMIN)
platform/config                  # platform yapılandırması
```

> **Neden `users` kökte?** İlk girişte kullanıcının tenant'ı bilinmediği için
> profil kök `users/{uid}` belgesinde tutulur; `tenantId`/`schoolId` bu belgeden
> okunur. Bu, aşağıdaki "önerilen" tenant-scoped users şemasından bilinçli bir
> sapmadır ve değiştirilmemelidir (kurallar ve servisler buna bağlıdır).

### Tenant alt koleksiyonları
```
tenants/{tenantId}
  ├─ users/{userId}              # (opsiyonel ikincil; birincil profil kök users'ta)
  ├─ students/{studentId}
  ├─ parents/{parentId}
  ├─ teachers/{teacherId}
  ├─ classes/{classId}
  ├─ leads/{leadId}              # CRM lead'leri (tenant müşteri olduktan sonra)
  ├─ appointments/{appointmentId}
  ├─ announcements/{announcementId}
  ├─ messages/{messageId}
  ├─ notifications/{notificationId}
  ├─ notificationLogs/{logId}
  ├─ notificationPreferences/{userId}
  ├─ events/{eventId}
  ├─ payments/{paymentId}
  ├─ subscriptions/{subscriptionId}
  ├─ settings/{section}          # ör. settings/general, settings/scholarshipExam
  ├─ auditLogs/{logId}
  ├─ scholarshipApplications/{applicationNo}
  ├─ scholarshipResults/{applicationNo}
  └─ demoRequests/{id}
```

## 2. Önerilen referans şema (hedef / kıyas)
Aşağıdaki yapı kavramsal hedeftir. Mevcut kod `users`'ı kökte tutar; tam
tenant-scoped users'a geçiş **ayrı bir karar/PR** gerektirir, kendi başına
yapılmaz:
```
tenants/{tenantId}/users/{userId}
tenants/{tenantId}/staff/{staffId}
platformUsers/{userId}
platformSettings/general
platformAuditLogs/{logId}
```

## 3. Kurallar
- **Tenant ID zorunlu yaklaşımı:** her tenant belgesi `tenants/{tenantId}/...`
  altında; erişim `request.auth.token.tenantId == tenantId` (veya profil
  tenantId eşleşmesi) ile sınırlanır. Bkz. `firestore.rules`.
- **Path helper zorunlu:** istemcide koleksiyon yolu hardcode edilmez.
- **Tutarlılık:** belge içindeki `tenantId` alanı, belgenin yolundaki tenant ile
  aynı olmalıdır.

## 4. Roller ve custom claims
Roller: `super_admin, founder, school_admin, principal, vice_principal,
coordinator, teacher, parent, student, staff (support/sales/pr), public`
(kod tarafında BÜYÜK_HARF sabitler — `lib/auth/role-constants.ts`).

**Custom claims önerisi:** `role` ve `tenantId` Firebase Auth **custom claim**
olarak set edilmeli (`app/api/admin/set-claims`, `scripts/set-claims.mjs`).
Böylece Security Rules `request.auth.token.tenantId` / `.role` ile hızlı ve
güvenli yetki kontrolü yapar (her kuralda Firestore `get()` gerektirmeden).

## 5. İstemci/sunucu Firebase ayrımı
- **İstemci:** `lib/firebase/client.ts` (Web SDK; Auth + Firestore).
- **Sunucu:** `lib/firebase/admin.ts` (`server-only`; Admin SDK). Yalnızca API
  route'larında. Client'a **import edilmez**.
- **İkincil app:** `lib/firebase/secondary-app.ts` — yöneticinin oturumunu
  bozmadan hesap açmak için (Admin SDK yokken fallback).
