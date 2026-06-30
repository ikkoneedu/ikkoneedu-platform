# Rol & Yetki Matrisi

Roller `lib/auth/role-constants.ts`, yetkiler `lib/auth/permissions.ts`,
eşleme `lib/auth/roles.ts`, kontrol `lib/auth/access-control.ts` içindedir.

## Roller

| Rol | Seviye | Açıklama |
|-----|--------|----------|
| `SUPER_ADMIN` | 100 | Platform sahibi — tüm erişim |
| `SCHOOL_ADMIN` | 80 | Okul yöneticisi — kendi tenant'ı |
| `SUPPORT` | 60 | Teknik destek |
| `SALES` | 50 | Satış / kayıt ekibi |
| `TEACHER` | 40 | Öğretmen |
| `DRIVER` | 30 | Servis şoförü — servis ve personel giriş-çıkış kapsamı |
| `PARENT` | 20 | Veli |
| `STUDENT` | 10 | Öğrenci |

## Rol → Route erişimi

| Route | SUPER | SCHOOL_ADMIN | TEACHER | PARENT | STUDENT | SALES | SUPPORT |
|-------|:-----:|:------------:|:-------:|:------:|:-------:|:-----:|:-------:|
| `/` (public) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/features` `/pricing` `/demo` `/founder-school` `/mobile-app` (public) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/login` `/school-select` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/admin` | ✓ | ✓ | – | – | – | – | – |
| `/executive` | ✓ | ✓ | – | – | – | – | – |
| `/settings` | ✓ | ✓ | – | – | – | – | ✓ |
| `/saas-admin` | ✓ | – | – | – | – | – | – |
| `/super-admin` | ✓ | – | – | – | – | – | – |
| `/messages` | ✓ | ✓ | ✓ | ✓ | – | ✓ | – |
| `/notifications` | ✓ | ✓ | ✓ | ✓ | ✓ | – | – |
| `/crm` | ✓ | ✓ | – | – | – | ✓ | – |
| `/admissions-ai` | ✓ | ✓ | – | – | – | ✓ | – |
| `/teacher` | ✓ | ✓ | ✓ | – | – | – | – |
| `/parent` | ✓ | ✓ | – | ✓ | – | – | – |
| `/student` | ✓ | ✓ | – | – | ✓ | – | – |
| `/ai-brain` | ✓ | ✓ | ✓ | – | ✓ | – | – |
| `/exam-ai` | ✓ | ✓ | ✓ | – | – | – | – |
| `/scheduler-ai` | ✓ | ✓ | ✓ | – | – | – | – |

## Özet erişim tanımları

- **SUPER_ADMIN:** Tüm sayfalar + platform geneli veri.
- **SCHOOL_ADMIN:** `/admin`, `/executive`, `/settings`, `/messages`, `/notifications`, `/crm`, `/admissions-ai` (+ portallar yönetim amaçlı).
- **TEACHER:** `/teacher`, `/messages`, `/notifications`, `/ai-brain`, `/exam-ai`.
- **PARENT:** `/parent`, `/messages`, `/notifications`.
- **STUDENT:** `/student`, `/ai-brain`, `/notifications`.
- **SALES:** `/crm`, `/admissions-ai`, `/messages`.
- **SUPPORT:** `/settings` (okuma), sistem izleme.
- **DRIVER:** Servis ve personel giriş-çıkış kapsamındaki kendi görev ekranları.

## Yetki kontrolü (kod)

```ts
import { can } from "@/lib/auth/access-control";
import { ROLES } from "@/lib/auth/role-constants";
import { PERMISSIONS } from "@/lib/auth/permissions";

can(ROLES.TEACHER, PERMISSIONS.AI_USE);        // true
can(ROLES.PARENT, PERMISSIONS.SETTINGS_WRITE); // false
```
