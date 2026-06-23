# AGENTS.md — IKK ONE EDU OS

> Bu dosya **Codex, Claude Code ve diğer kod ajanları** için ana talimat
> dosyasıdır. Her görevden önce okunmalıdır. Amaç: tüm ajanların aynı
> kurallarla, çalışan sistemi bozmadan ilerlemesidir.

## 1. Proje özeti
- **Ürün:** IKK ONE EDU OS (One Network Education Operating System)
- **Tür:** Özel okullar, kolejler ve anaokulları için **multi-tenant SaaS okul
  işletim sistemi**.
- **Kurucu kurum:** İngiliz Kültür Kolejleri. Sistem white-label/multi-tenant
  olarak başka okullara satılabilir kurgulanır.
- **Öncelik:** Önce **satılabilir, güvenli, stabil, premium görünümlü MVP**.
  AI özellikleri **en sona** bırakılır.

## 2. Teknoloji yığını (gerçek durum)
- Next.js **15.5.x** (App Router) · React **19** · TypeScript **5.7**
- Tailwind CSS **3.4** · Framer Motion **11** · lucide-react · zod **4**
- Firebase Web SDK **12** (Auth + Firestore) · firebase-admin **14** (sunucu)
- Dağıtım: Vercel · Kaynak: GitHub

> ⚠️ **shadcn/ui kullanılmıyor.** Proje kendi tasarım sistemini kullanır
> (`components/shared/`: GlassCard, PrimaryButton, TextField, SelectField,
> StatCard, SectionHeader …). Yeni UI bu bileşenlerle yapılır. shadcn ekleme
> kararı verilmedikçe radix/cva bağımlılığı eklenmez.

## 3. Çalışma komutları
```bash
npm install
npm run dev      # geliştirme
npm run lint     # ESLint (flat config: eslint.config.mjs)
npm run build    # production build — iş bitiminde ZORUNLU
npx tsc --noEmit # tip kontrolü
```
İş tamamlandı sayılması için **`npm run lint`, `npx tsc --noEmit` ve
`npm run build` temiz geçmelidir.**

## 4. Çalışma kuralları (zorunlu)
1. **Her görevden önce dosya yapısını anla.** Rastgele dosya açıp düzenleme.
2. **Rastgele refactor YASAK.** Sadece görevde istenen değişiklik yapılır.
3. **Çalışan özellikler bozulmaz.** Mevcut route, UI ve Firebase mantığı
   korunur; aksi açıkça istenmedikçe değiştirilmez.
4. **Yeni route eklenirse navigasyon bağlantısı da eklenir** (`lib/constants.ts`
   içindeki nav listeleri + ilgili sidebar/topbar).
5. **Dead button olmaz.** Her buton ya gerçekten çalışır ya da bilinçli olarak
   `disabled` + "Yakında"/`/coming-soon` ile işaretlenir.
6. **Tenant mimarisi bozulmaz.** Firestore yolları `lib/firebase/collections.ts`
   path helper'larından üretilir; component içinde hardcode edilmez.
7. **Secret/API key commit edilmez.** `.env.local` asla commit edilmez; örnek
   değerler `.env.local.example` içinde tutulur.
8. **Firestore Security Rules göz önünde bulundurulur.** Veri güvenliği son
   noktada `firestore.rules` ile sağlanır; istemci kontrolü yalnızca UX içindir.
9. **Büyük değişiklikten önce plan çıkarılır** (bkz. CODEX_CLAUDE_WORKFLOW.md).
10. **Her iş sonunda** lint + build çalıştırılır; hata varsa **sebebi raporlanır**.

## 5. Yasaklar
- Bu fazda **büyük feature geliştirme yok**, **UI redesign yok**.
- İstenmedikçe **route değiştirme / silme yok**.
- İstenmedikçe **Firebase logic değiştirme yok**.
- `ignoreBuildErrors` veya TypeScript kontrollerini kapatarak hata gizleme **yok**.
- Next/Firebase'i bozan/düşüren `npm audit fix --force` **yok**.
- Gereksiz bağımlılık ekleme **yok**.

## 6. Roller (tek doğruluk kaynağı: `lib/auth/role-constants.ts`)
`SUPER_ADMIN, FOUNDER, SCHOOL_ADMIN, PRINCIPAL, VICE_PRINCIPAL, COORDINATOR,
TEACHER, PARENT, STUDENT, SUPPORT, SALES, PR, PUBLIC`

## 7. İlgili dokümanlar
- `PROJECT_CONTEXT.md` — iş bağlamı ve vizyon
- `DEVELOPMENT_RULES.md` — kod yazım standartları
- `ROADMAP.md` — fazlı geliştirme planı
- `SECURITY_CHECKLIST.md` — güvenlik kontrol listesi
- `FIREBASE_ARCHITECTURE.md` — veri modeli ve path helper'lar
- `UI_UX_GUIDELINES.md` — tasarım dili
- `CODEX_CLAUDE_WORKFLOW.md` — çok ajanlı çalışma düzeni
