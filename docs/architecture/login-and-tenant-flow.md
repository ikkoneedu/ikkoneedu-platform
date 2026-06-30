# Giriş ve Tenant Akışı

> Durum: **Mock / Frontend.** Gerçek auth/Firebase yok. Yalnızca routing ve UX akışı.

## Genel Bakış

İki giriş yolu vardır:

1. **Ana platform girişi** — `/login` (rol seçimine göre yönlendirme).
2. **Okula özel giriş** — `/school/[slug]` halka açık sayfasından `/login?school=[slug]`.

## Ana Sayfa (`/`)

İki hedef kitle:

- **Okullar / kurum sahipleri:** Demo (`/demo`), Özellikler (`/features`),
  Fiyatlandırma (`/pricing`) CTA'ları.
- **Mevcut kullanıcılar:** Rol kartları → `/login?role=...`
  - Okul Yönetimi → `/login?role=admin`
  - Öğretmen → `/login?role=teacher`
  - Veli → `/login?role=parent`
  - Öğrenci → `/login?role=student`

## Giriş (`/login`)

Tek giriş sistemi. `role` ve `school` query parametreleri:

| Parametre | Etki |
|-----------|------|
| `role=admin` | Alt başlık "Okul yönetim panelinize..." · Giriş → `/admin` |
| `role=teacher` | Öğretmen portalı · Giriş → `/teacher` |
| `role=parent` | Veli portalı · Giriş → `/parent` |
| `role=student` | Öğrenci portalı · Giriş → `/student` |
| (role yok) | "Hesabınıza giriş yapın" · Giriş → `/school-select` |
| `school=ingiliz-kultur` | Okul rozeti gösterilir (tenant bağlamı) |

Demo giriş butonları: Super Admin → `/super-admin`, Okul Yönetimi → `/admin`,
Öğretmen → `/teacher`, Veli → `/parent`, Öğrenci → `/student`.

> `useSearchParams()` bir `<Suspense>` sınırı içinde kullanılır (Next 15 gereği).

## Okul Seçimi (`/school-select`)

Birden fazla okula bağlı kullanıcı için. Kartlar: İngiliz Kültür Kolejleri,
Atael Koleji, Demo Okul, Super Admin. Her kartta okul adı, **tenant slug**,
rol, kullanıcı sayısı, "Devam Et" (→ `/admin` veya `/super-admin`) ve okul
kartlarında: Halka Açık Okul Sayfası (`/school/[slug]`) + Bursluluk Başvurusu
(`/school/[slug]/scholarship/apply`).

## Okula Özel Halka Açık Yapı (`/school/[slug]`)

Her okulun mini halka açık sayfası. `lib/tenant/tenant-resolver.ts →
resolveSchoolBySlug(slug)` ile çözülür (mock). İçerik slug'a göre değişir.

Slug → tenant eşlemesi (`lib/tenant/tenant-config.ts → PUBLIC_SCHOOLS`):

| slug | tenantId | schoolName |
|------|----------|------------|
| `ingiliz-kultur` | `tenant_ikk` | İngiliz Kültür Kolejleri |
| `atael` | `tenant_atael` | Atael Koleji |
| `demo-okul` | `tenant_demo` | Demo Okul |

Alt route'lar:

```
/school/[slug]
/school/[slug]/scholarship/apply
/school/[slug]/scholarship/admission-card
/school/[slug]/scholarship/results
```

## Gelecek: Firebase Auth Custom Claims

Gerçek entegrasyonda oturum şu claim'leri taşır:

- `role` — SUPER_ADMIN | FOUNDER | SCHOOL_ADMIN | PRINCIPAL | VICE_PRINCIPAL | COORDINATOR | TEACHER | PARENT | STUDENT | SUPPORT | SALES | PR | DRIVER | PUBLIC
- `tenantId` — bağlı okul (tenant)
- `schoolId` — kampüs

Middleware: `school` query / subdomain → `tenantId`; `role` → hedef panel.
Firestore Security Rules `tenantId` + `role` bazlı (bkz. `firebase-auth-plan.md`).

## Korumalı / Halka Açık Sayfa Ayrımı

**Halka açık (giriş gerektirmez):**

```
/  /features  /pricing  /demo  /founder-school  /mobile-app
/school/[slug]
/school/[slug]/scholarship/apply
/school/[slug]/scholarship/admission-card
/school/[slug]/scholarship/results
/login  /school-select
```

**Giriş gerektiren (korumalı panel):**

```
/admin  /teacher  /parent  /student  /super-admin  /settings
/crm  /messages  /notifications  /executive  /saas-admin
/scholarship-exam (+ yönetim alt sayfaları)  /report-card-ai  /counseling  /finance
```
