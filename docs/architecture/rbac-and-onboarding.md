# Rol Bazlı Erişim ve Onboarding (Faz Planı)

> Hedef: Halk, müdür, okul yöneticisi, öğretmen, veli, öğrenci için rol bazlı
> kayıt + giriş + yetkilendirme. Firebase Admin SDK kullanılmaz; davet/kod
> mekaniği ikinci Firebase app ile gerçek hesap üretir.

## Roller

| Rol | Açılış | Özet |
|-----|--------|------|
| `SUPER_ADMIN` | `/super-admin` | Platform sahibi, tüm yetkiler |
| `SCHOOL_ADMIN` | `/admin` | Okul yöneticisi — **finans dahil** her şey |
| `PRINCIPAL` (Müdür) | `/admin` | Gidişat, öğretmenler, ders programı, CRM — **finans YOK** |
| `TEACHER` | `/teacher` | Kendi sınıfı, öğrenci/veli kodu üretir |
| `PARENT` | `/parent` | Öğretmenden aldığı kod ile girer |
| `STUDENT` | `/student` | Öğretmenden aldığı kod ile girer |
| `SALES` | `/crm` | Aday veli / lead yönetimi |
| `SUPPORT` | `/messages` | Teknik destek |
| `PUBLIC` (Halk) | `/portal` | Açık kayıt; bursluluk başvurusu + okul sayfaları |

Yetki ayrımı `lib/auth/permissions.ts` + `lib/auth/roles.ts` üzerinden. Müdür
(`PRINCIPAL`) `FINANCE_*` ve `SUBSCRIPTION_*` izinlerine sahip DEĞİLDİR.

## Kayıt / Giriş modeli

- **Halk:** `/register` üzerinden açık kayıt (email/şifre). `signUpPublic` hesap
  + `users/{uid}` profilini `role: PUBLIC, tenantId: "public"` ile oluşturur.
  Güvenlik kuralları yalnızca bu rolde self-create'e izin verir.
- **Müdür / Öğretmen:** okul yöneticisi tarafından oluşturulur (Faz 3).
- **Veli / Öğrenci:** öğretmenin ürettiği **kod** ile (Faz 2). Kod arka planda
  gizli bir email/şifre hesabına karşılık gelir (ikinci Firebase app ile
  öğretmenin oturumu bozulmadan oluşturulur).

## Giriş sonrası yönlendirme

`lib/auth/role-routing.ts → getHomeRouteForRole(profile.role)`. Profil yoksa
giriş engellenir: *"Yetki profiliniz bulunamadı..."*.

## Fazlar

- **Faz 1 (bu sürüm) ✅** — Roller (PRINCIPAL + PUBLIC), izin matrisi, halk açık
  kaydı (`/register`), halk portalı (`/portal`), rol bazlı yönlendirme, güvenlik
  kurallarında public self-register.
- **Faz 2** — Öğretmen→veli→öğrenci davet/kod sistemi (kod üretimi, kod ile
  giriş, öğrenci↔veli bağlama, sınıf oluşturma).
- **Faz 3** — Panel içi yetki uygulaması: müdürde finans gizleme, öğretmenin
  yalnızca kendi sınıfını yönetmesi, okul yöneticisinin öğretmen/müdür
  oluşturması; `ProtectedRoute`/`middleware` ile gerçek route koruması.
- **Faz 4** — Custom claims'e geçiş (Admin SDK) + Firestore kurallarının
  claim bazlı sıkılaştırılması.

## İlgili dosyalar

- `lib/auth/role-constants.ts` — roller, etiketler, seviyeler
- `lib/auth/permissions.ts`, `lib/auth/roles.ts` — izin matrisi
- `lib/auth/role-routing.ts` — rol → route
- `lib/auth/route-config.ts` — public/protected + `ROUTE_ROLES`
- `components/auth/AuthProvider.tsx` — `signIn`, `signUpPublic`, `signOut`
- `lib/services/user-profile.ts` — profil okuma + halk profili oluşturma
- `app/register/page.tsx`, `app/portal/page.tsx`
- `firestore.rules` — public self-register kuralı
