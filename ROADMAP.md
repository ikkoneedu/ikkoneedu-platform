# ROADMAP.md — IKK ONE EDU OS Geliştirme Planı

> Fazlar sıralıdır. Bir faz "tamamlandı" sayılmadan (lint + tsc + build temiz,
> kabul kriterleri sağlanmış) sonrakine geçilmez. AI **en son**.

## Phase 0 — Stabilizasyon ve analiz
- Build / lint / tsc kontrolü ve kök neden analizi.
- Route haritası (tüm `page.tsx` + `route.ts`).
- Çalışmayan buton/link tespiti (dead button envanteri).
- Dosya yapısı ve modül raporu.
- Kritik bug/güvenlik listesi.
- **Çıktı:** bu repodaki `.md` dokümanları + analiz raporu. *(Büyük ölçüde
  tamamlandı; bkz. `docs/MVP-ANALIZ-RAPORU.md` ve bu kök dökümanlar.)*

## Phase 1 — Navigation, routing ve UI bütünlüğü
- Tüm menüler çalışır; admin panel route bağlantıları doğru.
- Sayfalar arası tutarlılık (başlık, shell, boşluk/empty state).
- "Coming soon" olanlar net işaretli (`/coming-soon`, disabled).
- **Kabul:** dead button yok, 404'e düşen iç link yok.

## Phase 2 — Firebase / Auth / Firestore güvenliği
- Firebase client/server düzeni netleşir (admin yalnız sunucu).
- Tenant bazlı **path helper** kullanımının tamamlanması.
- **Firestore Security Rules** sertleştirme (tenant izolasyonu, RBAC).
- Audit log altyapısı, env örnek düzeni.
- **Kabul:** kurallar olmadan production kabul edilmez; rol bazlı erişim test edilir.

## Phase 3 — Super Admin ve tenant yönetimi
- Tenant listesi, okul oluşturma/düzenleme.
- Plan/paket bilgisi, kullanıcı rolleri yönetimi.
- Tenant `settings` ekranları.

## Phase 4 — CRM ve randevu sistemi
- Lead yönetimi, randevu oluşturma, veli aday kayıtları.
- Form validasyonları, filtreleme ve arama.

## Phase 5 — Veli / öğrenci / öğretmen portalları
- Rol bazlı dashboard, duyuru ve bildirimler.
- Öğrenci bilgileri, etkinlikler.

## Phase 6 — SEO, performans ve production hazırlığı
- Metadata, sitemap, robots, Open Graph.
- Lighthouse iyileştirmeleri, Vercel production kontrolleri.

## Phase 7 — AI özellikleri (EN SON)
- AI ders programı, AI rapor asistanı.
- AI veli iletişim taslakları, AI analiz ekranları.

---

### Mevcut durum notu
Kod tabanında Phase 1 ve Phase 2'nin önemli bölümü **kısmen uygulanmış** durumda
(route'lar, RoleGuard, `firestore.rules` sertleştirme, doğrulamalı bursluluk
sonuç/giriş belgesi route'ları, dead button düzeltmeleri). Phase 3+ modülleri
ağırlıklı olarak **UI/mock** seviyesindedir ve gerçek veriye bağlanmayı bekler.
