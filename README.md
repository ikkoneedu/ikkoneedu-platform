# IKK ONE EDU OS

**One Network Education Operating System** — özel okullar, kolejler ve
anaokulları için geliştirilen **multi-tenant SaaS okul işletim sistemi**.
Kurucu kurum: İngiliz Kültür Kolejleri. Sistem white-label olarak başka eğitim
kurumlarına sunulabilecek şekilde kurgulanır.

> Öncelik: **güvenli, stabil ve satılabilir bir MVP.** AI özellikleri en son
> fazda devreye alınır.

## Teknoloji
- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS · Framer Motion · lucide-react · zod
- Firebase Auth + Firestore (istemci) · firebase-admin (sunucu)
- Vercel · GitHub

> Not: Proje **kendi tasarım sistemini** (`components/shared/`) kullanır;
> shadcn/ui bağımlılığı yoktur.

## Temel komutlar
```bash
npm install      # bağımlılıklar
npm run dev      # geliştirme sunucusu
npm run lint     # ESLint
npm run build    # production build
```

Ortam değişkenleri için `.env.local.example` dosyasını `.env.local` olarak
kopyalayın. Firebase değerleri boşsa uygulama "Mock Mod" çalışır.

## AI Agent Workflow
Bu repoda Codex, Claude Code ve diğer yapay zekâ ajanları **ortak kurallarla**
çalışır. Herhangi bir değişiklik yapmadan önce ilgili dokümanlar okunmalıdır:

| Dosya | Amaç |
| --- | --- |
| [`AGENTS.md`](./AGENTS.md) | Ajanlar için ana talimat: kurallar, komutlar, yasaklar |
| [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) | Ticari bağlam ve ürün vizyonu |
| [`DEVELOPMENT_RULES.md`](./DEVELOPMENT_RULES.md) | Kod yazım standartları |
| [`ROADMAP.md`](./ROADMAP.md) | Fazlı geliştirme planı (Phase 0–7) |
| [`SECURITY_CHECKLIST.md`](./SECURITY_CHECKLIST.md) | Güvenlik kontrol listesi |
| [`FIREBASE_ARCHITECTURE.md`](./FIREBASE_ARCHITECTURE.md) | Veri modeli ve path helper'lar |
| [`UI_UX_GUIDELINES.md`](./UI_UX_GUIDELINES.md) | Tasarım dili |
| [`CODEX_CLAUDE_WORKFLOW.md`](./CODEX_CLAUDE_WORKFLOW.md) | Çok ajanlı çalışma düzeni ve PR kuralları |

**Özet kurallar:** çalışan özellikleri bozma · rastgele refactor yapma · dead
button bırakma · tenant mimarisini koru · secret commit etme · iş sonunda
`npm run lint` + `npm run build` çalıştır.
