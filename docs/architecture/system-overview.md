# Sistem Mimarisi — Genel Bakış

ikkoneedu, yapay zeka destekli, çoklu okul (multi-tenant) bir eğitim işletim
sistemidir. Bu doküman, "Core Architecture Refactor" aşamasında hazırlanan
çekirdek mimariyi özetler.

## Katmanlar

| Katman | Konum | Sorumluluk |
|--------|-------|-----------|
| **UI / Sayfalar** | `app/`, `components/` | Next.js App Router ekranları ve bileşenleri |
| **Type Sistemi** | `src/types/` | Domain veri modelleri (tenant, user, student vb.) |
| **Tenant** | `lib/tenant/` | Çoklu okul çözümleme ve bağlam |
| **Auth / RBAC** | `lib/auth/` | Roller, yetkiler, erişim kontrolü |
| **Data Layer** | `lib/data/` | Merkezi veri erişimi (mock → Firestore) |
| **Firebase** | `lib/firebase/` | Koleksiyon adları ve yapılandırma (hazırlık) |
| **AI** | `lib/ai/` | Sağlayıcı, model, prompt, kullanım, servis |
| **Feature Flags** | `lib/features/` | Modüllerin kademeli açılması |

## Tasarım İlkeleri

- **Sağlayıcıdan bağımsızlık:** UI, veri ve AI sözleşmelerine bağlanır; arka
  uç (mock → Firestore / OpenAI / Anthropic / Gemini) şeffaf biçimde değişir.
- **Tenant izolasyonu:** Tüm veriler tenant kimliğiyle ilişkilendirilir.
- **Kademeli açılım:** Özellikler feature flag ile kontrol edilir.

## Mevcut Durum

Tüm sayfalar mock veriyle çalışır. Bu aşamada yalnızca mimari hazırlandı;
Firebase/Auth/AI **bağlanmadı**, hiçbir mevcut ekran bozulmadı.
