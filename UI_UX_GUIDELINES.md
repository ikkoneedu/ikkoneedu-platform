# UI_UX_GUIDELINES.md — Tasarım Dili

## Genel dil
- **Premium, kurumsal SaaS görünümü** korunur: koyu tema, **glassmorphism**
  (cam efektli kartlar), modern dashboard dili.
- Ton: **ciddi ama modern.** Eğitim kurumuna güven veren, sade ve net.
- Sade > gösterişli. Kullanıcı her ekranda "bu sistem sağlam" hissetmeli.

## Tasarım sistemi (gerçek)
- **shadcn/ui yok.** Ortak bileşenler `components/shared/`:
  `GlassCard`, `PrimaryButton`, `TextField`, `SelectField`, `StatCard`,
  `SectionHeader`, `AccountSummaryCard`, `LogoMark`.
- Yeni UI bu bileşenlerle ve mevcut Tailwind token'larıyla kurulur.
- Renkler tutarlı: `content` (ana metin), `muted` (ikincil), `accent` (vurgu),
  `navy/background` (yüzeyler), `brand` (hata/uyarı). Rastgele renk eklenmez.

## Layout
- Sayfa kabukları mevcut `PageShell` / `Sidebar` / `Topbar` / `MobileBottomNav`
  ile uyumlu olmalı.
- **Mobil uyumluluk zorunlu** — `sm: md: lg:` kırılımları; mobilde alt navigasyon.

## Veri ve durumlar
- Her dashboard kartında **anlamlı veri, boş durum veya placeholder** bulunur —
  boş/ölü kart bırakılmaz.
- Tablolarda **arama, filtreleme, loading state ve empty state** düşünülür.
- Uzun listelerde sayfalama/limit; ağır sorgular için iskelet yükleme.

## Etkileşim
- Butonlar **net CTA** taşır ("Öğrenci Ekle", "Sonucu Görüntüle"). Belirsiz
  etiket ("Tıkla") kullanılmaz.
- **Dead button yok.** Hazır olmayan aksiyon `disabled` + "Yakında" veya
  `/coming-soon`.
- Yıkıcı işlemler (silme) onay ister.

## Hareket (Framer Motion)
- **Sadece deneyimi güçlendiriyorsa** kullanılır (giriş/geçiş, kart belirme).
- Gereksiz/abartılı animasyon yok; performansı ve ciddiyeti bozmaz.
- `prefers-reduced-motion` saygısı tercih edilir.

## Erişilebilirlik
- Yeterli kontrast, ikon-only butonlarda `aria-label`, form `label` bağlama,
  klavye erişimi, anlamlı başlık hiyerarşisi.

## Tutarlılık kuralı
- **Her yeni sayfa mevcut tasarım sistemiyle uyumlu olmalı.** Yeni bir görsel dil
  icat etme; mevcut bileşen ve sınıf dizilimini taklit et.
