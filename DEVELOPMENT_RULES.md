# DEVELOPMENT_RULES.md — Kod Yazım Kuralları

## TypeScript
- **Strict yaklaşım.** `any` kullanma; bilinmeyen veri için `unknown` + tip
  daraltma. Firestore okumalarında alanlar `String(x ?? "")` gibi güvenli
  şekilde normalize edilir (mevcut servis deseni korunur).
- Public fonksiyon ve servis dönüşleri için `interface`/`type` tanımla.
- Build'i kıran tip hatasını `// @ts-ignore` veya `ignoreBuildErrors` ile gizleme;
  kök nedeni çöz.

## Bileşen isimlendirme ve organizasyon
- Bileşen dosyaları **PascalCase** (`StudentTable.tsx`), yardımcılar **camelCase**.
- Yer: alan bazlı klasörler (`components/<alan>/`), paylaşılan atomlar
  `components/shared/`. Yeni ortak parça önce `shared/` içinde aranır,
  yoksa oraya eklenir — **UI tekrarını azalt**.
- Servisler `lib/services/`, Firebase yolları `lib/firebase/collections.ts`,
  yetki `lib/auth/`, doğrulama `lib/validation/` altında toplanır.

## Server / Client component ayrımı
- Varsayılan **Server Component**. Etkileşim/hook gerekiyorsa dosyanın başına
  `"use client"`.
- **Firebase Admin SDK yalnızca sunucuda** (`lib/firebase/admin.ts` `server-only`).
  Admin kodu **asla** client component'e import edilmez.
- Gizli anahtar gerektiren işler **API route** (`app/api/.../route.ts`,
  `runtime = "nodejs"`) üzerinden yapılır.

## UI / Tailwind
- Tasarım sistemi: **`components/shared/` + Tailwind utility sınıfları**
  (shadcn/ui yok). Mevcut token ve renkleri kullan; rastgele renk ekleme.
- Stil çakışmasında mevcut sınıf dizilimini taklit et (koyu tema, `bg-white/[0.04]`,
  `border-white/10`, `text-content/muted/accent`).
- **Mobil uyumluluk zorunlu** — `sm: md: lg:` kırılımları her yeni ekranda.

## Veri durumları (zorunlu)
Her veri gösteren ekran üç durumu da ele almalı:
1. **Loading state** (iskelet/placeholder),
2. **Empty state** (anlamlı boş mesaj + CTA),
3. **Error state** (kullanıcı dostu hata, teknik detay sızdırmadan).

## Formlar
- **Validation zorunlu** (zod veya mevcut `lib/validation` / `people-validation`
  desenleri). Sunucuya giden veride tekrar doğrula.
- Gönderim sırasında buton `disabled` + ilerleme metni.
- Başarı/başarısızlık kullanıcıya net gösterilir.

## Firebase çağrılarında güvenlik
- Koleksiyon yolları **path helper'lardan** üretilir; string hardcode yok.
- `tenantId` doğrulanmış profilden gelir; istemciden körü körüne kabul edilmez.
- Şifre/PII Firestore'a veya log'a yazılmaz.

## Erişilebilirlik (temel)
- Anlamlı `aria-label`, ikon-only butonlarda etiket, form `label` bağlama,
  yeterli kontrast, klavye ile erişilebilir etkileşim.

## Bağımlılıklar
- **Rastgele bağımlılık ekleme yasak.** Yeni paket gerekiyorsa önce gerekçesini
  planda belirt; mevcut araçlarla çözülebiliyorsa ekleme.

## Büyük değişiklik
- Çok dosyalı/mimari değişiklik öncesi **kısa plan** çıkar (etkilenen dosyalar,
  riskler, geri alma). Bkz. `CODEX_CLAUDE_WORKFLOW.md`.

## İş bitişi
- `npm run lint`, `npx tsc --noEmit`, `npm run build` → hepsi temiz.
- Değişen dosyalar + riskler + test sonucu raporlanır.
