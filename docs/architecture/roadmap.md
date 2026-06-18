# Yol Haritası

## Aşama 0 — Frontend (Tamamlandı)
- Tüm sayfalar ve bileşenler (mock veri ile)
- Design system, responsive, dark mode
- Super Admin erişim merkezi

## Aşama 1 — Core Architecture Refactor (Bu aşama)
- `src/types/` domain veri modelleri
- `lib/tenant/` çoklu okul çözümleme
- `lib/auth/` rol ve yetki sistemi (RBAC)
- `lib/data/` merkezi veri erişim katmanı
- `lib/firebase/` koleksiyon + yapılandırma hazırlığı
- `lib/ai/` sağlayıcıdan bağımsız AI katmanı
- `lib/features/` feature flags
- `.env.example` ve mimari dokümantasyon

## Aşama 2 — Firebase & Auth
- Firebase Auth + Custom Claims (tenantId, role)
- Firestore koleksiyonları ve Security Rules
- `lib/data/*` → gerçek Firestore sorguları

## Aşama 3 — AI Entegrasyonu
- OpenAI / Anthropic Claude / Gemini bağlanması
- Tenant bazlı kota, maliyet takibi, KVKK log

## Aşama 4 — Multi-Tenant Yayılım
- Subdomain çözümleme (middleware)
- Tenant bazlı branding ve ayarlar
- Abonelik/ödeme (Stripe Billing / iyzico)

## Aşama 5 — Mobil Uygulama
- React Native / Expo
- Push Notification (FCM)
- Biyometrik giriş
