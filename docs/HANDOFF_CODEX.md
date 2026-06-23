# Codex Devralma Promptu — IKK ONE EDU OS

> Bu dosya, çalışmayı bir başka ajanın (özellikle **Codex**) aynı kurallarla,
> aynı kaliteyle sürdürmesi için yazıldı. Aşağıdaki bloğu Codex'e görev promptu
> olarak ver.

---

## ROL & BAĞLAM
Sen bu repoda çalışan **kıdemli full-stack geliştiricisin**. Proje: **IKK ONE EDU
OS** — özel okullar için **multi-tenant SaaS okul işletim sistemi** (Next.js 15
App Router, React 19, TypeScript, Tailwind, Firebase Auth + Firestore,
firebase-admin, Vercel). Hedef: **güvenli, stabil, satılabilir premium MVP.**
AI özellikleri **en son** faz.

**İLK İŞ (zorunlu):** Şu dosyaları oku ve bunlara harfiyen uy:
`AGENTS.md`, `DEVELOPMENT_RULES.md`, `PROJECT_CONTEXT.md`, `ROADMAP.md`,
`SECURITY_CHECKLIST.md`, `FIREBASE_ARCHITECTURE.md`, `UI_UX_GUIDELINES.md`,
`CODEX_CLAUDE_WORKFLOW.md`, `docs/DEPLOY.md`.

## MUTLAK KURALLAR
- Çalışan özellikleri **bozma**. Rastgele refactor **yok**. İstenmeyen route/UI
  değişikliği **yok**.
- **Dead button yok**: her buton ya çalışır ya `disabled`/`/coming-soon`.
- **Tenant izolasyonu kutsal**: Firestore yolları `lib/firebase/collections.ts`
  path helper'larından üretilir; component içinde hardcode **yok**.
- **Provisioning kararı verildi**: sunucu hesabı oluşturma **`/api/admin/create-user`**
  ile yapılır (`lib/services/account-provisioning.ts` → `tryServerCreate`).
  Codex'in eski `/api/admin/provision-account` route'u **KULLANILMAYACAK**, yeniden
  eklenmeyecek.
- **Güvenlik**: secret/`.env.local` commit etme. Admin SDK yalnız sunucu
  (`lib/firebase/admin.ts`, `runtime="nodejs"`). Kuralları gevşetme; değişiklik
  varsa `firestore.rules`'a yaz ve gerekçele.
- `ignoreBuildErrors` / TS kontrol kapatma / `npm audit fix --force` (Next/Firebase
  kıran) **yasak**.
- **İş bitişi**: `npm run lint`, `npx tsc --noEmit`, `npm run build` → **üçü de temiz**.
  Sonra commit. Commit trailer: `Co-Authored-By` + oturum satırı stilini koru.

## ŞU ANA KADAR YAPILANLAR (durum)
- **Phase 1** (stabilizasyon + güvenlik) `main`'e alındı (Vercel canlı):
  `firestore.rules` sertleştirme, doğrulamalı bursluluk sonuç/giriş-belgesi server
  route'ları, SEO (robots/sitemap/noindex), dead-button temizliği, login
  "Şifremi unuttum".
- **Custom claims akışı**: `firebase deploy --only firestore:rules` yapıldı; ilk
  SUPER_ADMIN claim'i + profili kuruldu; `create-user` yeni hesaplara claim atıyor;
  `set-claims` route sertleştirildi (zod + audit log) + auth-guard'lar prod'da
  fail-safe (Codex'ten alınan tamamlayıcı parçalar).
- **Phase 4 başlangıcı**: `components/crm/RealLeadPipeline.tsx` — CRM lead'leri
  GERÇEK Firestore'dan (`listLeads`) yükleniyor (dalda: `claude/nice-turing-d45ity`).

## GERÇEK-VERİ BAĞLAMA DESENİ (bunu tekrar et)
Mock bir paneli gerçeğe bağlarken örnek al: `components/crm/AppointmentManager.tsx`
ve yeni `components/crm/RealLeadPipeline.tsx`. Desen:
1. `"use client"` bileşen; `const { profile, firebaseReady } = useAuth();`
   `const tenantId = profile?.tenantId;`
2. Rol kapısı (CRM/staff rolleri) + `usable = firebaseReady && tenantId && canView`.
3. `useEffect` → ilgili **gerçek servisi** çağır (`lib/services/*`): liste döndür.
4. **Üç durum zorunlu**: loading (`rows===null`), empty (anlamlı mesaj + CTA),
   error (kullanıcı dostu, `getAuthErrorMessage`).
5. Mevcut mock bileşenin görünümünü/sınıflarını taklit et (UI değişmesin).
6. Sayfada mock importu kaldır, gerçek bileşeni koy.

Hazır servisler (çoğu mevcut): `students, parents, teachers, classes, leads,
appointments, messages, notifications, announcements, payments, scholarship-*,
schools, tenants, demo-requests, crm-global, attendance, grades, schedule`.

## SIRADAKİ GÖREVLER (öncelik sırası)
**A. CRM'i tamamla (Phase 4)** — branch `claude/nice-turing-d45ity` üzerinde:
   - `CrmMetrics` → gerçek sayımlar (lead sayısı/aşama dağılımı `listLeads`'ten).
   - `LeadDetails`, `LeadSources`, `RevenueForecast`, `TaskCenter`,
     `Appointments` (mock) → ya gerçek servise bağla ya da veri yoksa **empty
     state**'e çevir. `AiCrmInsights` → AI fazına kadar "Yakında".
**B. Super Admin & tenant yönetimi (Phase 3)** — `app/super-admin`, `app/saas-admin`
   mock; `lib/services/tenants.ts` + `listAllUsers()` ile gerçek tenant/kullanıcı
   listesine bağla. SUPER_ADMIN-only; kuralları doğrula.
**C. Executive/Finance panelleri** — `app/executive`, `app/finance` mock; gerçek
   `payments`/sayımlara bağla ya da empty state.
**D. Dead-button nöbeti** — yeni eklenen her ekranda tara (heuristik:
   `grep -c "<button"` vs `onClick|type="submit"|disabled`). AI mock panelleri
   (student AI koç, `AiInsightCard`, `QuickPromptGrid`) bilinçli inert — dokunma.

## İŞ AKIŞI (CODEX_CLAUDE_WORKFLOW.md)
- Geliştirme dalı: **`claude/nice-turing-d45ity`** (güncel iş burada). Büyük yeni
  faz için `phase/04-crm-real-data` gibi ayrı dal aç.
- **`main` korumalı**: yalnız test edilmiş, kurallarla uyumlu iş; FF/PR ile.
- Büyük değişiklik öncesi kısa plan çıkar. Her PR'da: değişen dosyalar, riskler,
  `lint/tsc/build` sonucu.

## BİLİNEN AÇIK KONU
- **Canlı login doğrulaması**: `main`'e Phase 1 alındı; kullanıcının Vercel deploy
  sonrası girişi teyit etmesi bekleniyor. Hâlâ "Giriş yapılamadı" derse: Network
  sekmesindeki başarısız isteğe bak (auth kodu mu, `permission-denied` mi). Şifre
  ihtimali için Authentication'dan reset.
- `npm audit`: 8 moderate, hepsi server-only `firebase-admin → @google-cloud → uuid`
  zinciri; fix yalnız breaking downgrade → **dokunma**, upstream bekle.
