# PROJECT_CONTEXT.md — IKK ONE EDU OS

## Ürün
**IKK ONE EDU OS** — *One Network Education Operating System*.
Özel okullar, kolejler ve anaokulları için geliştirilen **multi-tenant SaaS okul
işletim sistemi**.

## Ticari amaç
Bu proje ticari bir SaaS ürünüdür. İlk hedef; tek bir okulda (kurucu kurum)
sorunsuz çalışan, sonra **başka okullara satılabilen** bir platform kurmaktır.

- **Kurucu kurum:** İngiliz Kültür Kolejleri (ilk tenant / referans müşteri).
- **Satış modeli:** White-label, **multi-tenant**. Her okul kendi verisiyle
  izole bir "tenant" olarak çalışır; ortak kod tabanı, ayrı veri alanı.
- **Birincil hedef:** **Stabil, güvenli ve satılabilir bir MVP.** Gösterişli
  ama yarım özellikler yerine; az ama sağlam çalışan modüller.

## Ürün ilkeleri
1. **Önce stabilite ve güven.** Demoda her tıklanan yer çalışmalı; dead button,
   bozuk link, boş ekran olmamalı.
2. **Premium ama sade deneyim.** Kurumsal eğitim kurumuna yakışan ciddi, modern,
   hızlı ve güven veren bir arayüz (koyu tema, cam efektli kartlar).
3. **Tenant izolasyonu kutsaldır.** Bir okul başka okulun verisini asla göremez.
4. **AI en sona.** Yapay zeka modülleri (ders programı, rapor asistanı, veli
   iletişim taslakları, analiz) **en son fazda** devreye alınır. MVP'de bu
   ekranlar görsel/placeholder olarak durabilir ama satışın merkezi değildir.

## Hedef kullanıcılar (roller)
Super Admin (platform), Okul Yöneticisi/Kurucu, Müdür/Müdür Yrd./Koordinatör,
Öğretmen, Veli, Öğrenci, Personel (Destek/Satış/PR).

## Hedef modüller
Kurumsal web sitesi · Admin panel · Super admin panel · CRM · Randevu sistemi ·
Veli portalı · Öğrenci yönetimi · Öğretmen/personel yönetimi · Ders programı ·
Duyurular · Etkinlikler · Sınavlar · Bursluluk sınavı paneli · Kütüphane ·
Ölçme-değerlendirme · Raporlama · Bildirim merkezi · Ayarlar · Tenant yönetimi.

## Başarı kriteri (MVP)
- Tüm menü ve butonlar çalışır veya net "Yakında" durumundadır.
- Auth + rol sistemi tutarlıdır; her rol yalnızca yetkili olduğu ekranı görür.
- Firestore Security Rules ile tenant izolasyonu zorlanır.
- `lint` + `tsc` + `build` temiz; Vercel'de sorunsuz deploy.
