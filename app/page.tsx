import Link from "next/link";
import {
  ArrowRight,
  LogIn,
  Smartphone,
  Award,
  School,
  BookOpen,
  Users,
  GraduationCap,
} from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { CinematicHero } from "@/components/landing/CinematicHero";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/seo";
import {
  organizationSchema,
  softwareApplicationSchema,
} from "@/lib/seo/structured-data";
import { productName, description } from "@/lib/constants";
import {
  founderHighlights,
  platformExperiences,
  aiModules,
  revenueTiers,
  type LandingCard,
} from "@/lib/mock-data";

export const metadata = buildMetadata({
  path: "/",
  description,
  keywords: [
    "eğitim işletim sistemi",
    "yapay zeka eğitim",
    "EdTech",
    "İngiliz Kültür Kolejleri",
    "SaaS okul yazılımı",
    "okul otomasyon sistemi",
  ],
});

/* Tekrar eden ikon + başlık + açıklama kartı */
function InfoCard({ card }: { card: LandingCard }) {
  const Icon = card.icon;
  return (
    <GlassCard tone="navy" interactive className="h-full">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-content">
        {card.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{card.description}</p>
    </GlassCard>
  );
}

/** Mevcut kullanıcılar için rol bazlı giriş kartları (query param ile /login). */
const portalLoginCards = [
  { id: "admin", title: "Okul Yönetimi", href: "/login?role=admin", icon: School },
  { id: "teacher", title: "Öğretmen Girişi", href: "/login?role=teacher", icon: BookOpen },
  { id: "parent", title: "Veli Girişi", href: "/login?role=parent", icon: Users },
  { id: "student", title: "Öğrenci Girişi", href: "/login?role=student", icon: GraduationCap },
];

export default function HomePage() {
  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      <JsonLd data={[organizationSchema(), softwareApplicationSchema()]} />
      {/* Üst bar */}
      <header className="sticky top-0 z-30 border-b border-overlay/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight text-content">
              {productName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/features" className="hidden lg:block">
              <PrimaryButton variant="ghost" size="sm">
                Özellikler
              </PrimaryButton>
            </Link>
            <Link href="/pricing" className="hidden lg:block">
              <PrimaryButton variant="ghost" size="sm">
                Fiyatlandırma
              </PrimaryButton>
            </Link>
            <Link href="/founder-school" className="hidden lg:block">
              <PrimaryButton variant="ghost" size="sm">
                Kurucu Okul
              </PrimaryButton>
            </Link>
            <Link href="/login">
              <PrimaryButton variant="ghost" size="sm">
                Giriş Yap
              </PrimaryButton>
            </Link>
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/demo">
              <PrimaryButton size="sm">Demo Talep Et</PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      {/* 1. Sinematik açılış deneyimi (tam genişlik) */}
      <CinematicHero />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 1b. Mevcut kullanıcılar — Okul Portalı Girişi */}
        <section className="py-12 lg:py-16">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow="Mevcut Kullanıcılar"
              title="Okul Portalınıza Giriş Yapın"
              description="Okul yöneticisi, öğretmen, veli ve öğrenciler tek giriş ekranından kendi panellerine yönlendirilir."
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {portalLoginCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Reveal key={card.id} delay={index * 0.08}>
                  <Link href={card.href}>
                    <GlassCard tone="navy" interactive className="flex h-full flex-col items-start">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                        <Icon size={24} aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-content">
                        {card.title}
                      </h3>
                      <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-accent">
                        Giriş Yap
                        <ArrowRight size={15} aria-hidden="true" />
                      </span>
                    </GlassCard>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* 2. Kurucu Okul Vurgusu */}
        <section className="py-16 lg:py-20">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow="Kurucu Okul"
              title="İngiliz Kültür Kolejleri — Kurucu Okul"
              description="İngiliz Kültür Kolejleri, ikkoneedu platformunun ilk uygulama ve geliştirme ortağı olarak dijital okul dönüşümüne öncülük eder."
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {founderHighlights.map((card, index) => (
              <Reveal key={card.id} delay={index * 0.08}>
                <InfoCard card={card} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 3. Tek Platform, Dört Deneyim */}
        <section className="py-16 lg:py-20">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow="Tek Platform"
              title="Tek Platform, Dört Deneyim"
              description="Veli, öğrenci, öğretmen ve yönetim için kusursuzca birbirine bağlı tek bir ekosistem."
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformExperiences.map((card, index) => (
              <Reveal key={card.id} delay={index * 0.08}>
                <InfoCard card={card} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4. AI Modülleri */}
        <section className="py-16 lg:py-20">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow="Yapay Zeka"
              title="AI Modülleri"
              description="Eğitimin her aşamasını güçlendiren, birbirine bağlı yapay zeka modülleri."
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aiModules.map((card, index) => (
              <Reveal key={card.id} delay={index * 0.06}>
                <InfoCard card={card} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 5. SaaS Gelir Modeli */}
        <section className="py-16 lg:py-20">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow="SaaS Gelir Modeli"
              title="Bir Okuldan Türkiye Geneline"
              description="İngiliz Kültür Kolejleri'nde başlayan bu teknoloji, ilerleyen dönemde farklı okullara abonelik modeliyle sunulabilecek ölçeklenebilir bir EdTech platformuna dönüşür."
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {revenueTiers.map((tier, index) => (
              <Reveal key={tier.id} delay={index * 0.08}>
                <GlassCard
                  tone="navy"
                  interactive
                  className={[
                    "h-full text-center",
                    tier.highlight ? "border-accent/40 ring-accent/20" : "",
                  ].join(" ")}
                >
                  <p className="text-sm font-medium text-accent">{tier.schools}</p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-content sm:text-3xl">
                    {tier.revenue}
                  </p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 5b. Mobil Uygulama Vurgusu */}
        <section className="py-16 lg:py-20">
          <Reveal>
            <GlassCard
              tone="navy"
              className="flex flex-col items-center gap-6 px-6 py-12 text-center sm:px-10 lg:flex-row lg:justify-between lg:text-left"
            >
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs font-medium text-accent">
                  <Smartphone size={14} aria-hidden="true" />
                  Mobil Uygulama
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-content sm:text-3xl">
                  Okulunuz Cebinizde
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  Veli, öğrenci, öğretmen ve yöneticiler için tasarlanmış mobil
                  deneyim ile okulunuzla ilgili tüm süreçlere her yerden erişin.
                </p>
              </div>
              <Link href="/mobile-app" className="shrink-0">
                <PrimaryButton size="lg">
                  Mobil Uygulamayı İncele
                  <ArrowRight size={18} aria-hidden="true" />
                </PrimaryButton>
              </Link>
            </GlassCard>
          </Reveal>
        </section>

        {/* 5c. Bursluluk Sınavı CTA */}
        <section className="pb-4">
          <Reveal>
            <GlassCard
              tone="navy"
              className="ai-gradient flex flex-col items-center gap-6 border-accent/20 px-6 py-12 text-center sm:px-10 lg:flex-row lg:justify-between lg:text-left"
            >
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs font-medium text-accent">
                  <Award size={14} aria-hidden="true" />
                  Bursluluk Sınavı
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-content sm:text-3xl">
                  Bursluluk Sınavı Başvurusu Açık
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  Çocuğunuz için bursluluk ve kabul sınavı başvurusunu birkaç
                  dakika içinde tamamlayın, burs fırsatını yakalayın.
                </p>
              </div>
              <Link href="/scholarship-exam/apply" className="shrink-0">
                <PrimaryButton size="lg">
                  Bursluluk Sınavı Başvurusu
                  <ArrowRight size={18} aria-hidden="true" />
                </PrimaryButton>
              </Link>
            </GlassCard>
          </Reveal>
        </section>

        {/* 6. Son CTA */}
        <section className="py-16 lg:py-24">
          <Reveal>
            <GlassCard
              tone="navy"
              className="ai-gradient flex flex-col items-center gap-6 border-accent/20 px-6 py-14 text-center sm:px-10"
            >
              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-content sm:text-4xl">
                Geleceğin Okul İşletim Sistemini Bugün Başlatalım
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/demo">
                  <PrimaryButton size="lg" className="w-full sm:w-auto">
                    Demo Talep Et
                    <ArrowRight size={18} aria-hidden="true" />
                  </PrimaryButton>
                </Link>
                <Link href="/login">
                  <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
                    <LogIn size={18} aria-hidden="true" />
                    Giriş Yap
                  </PrimaryButton>
                </Link>
              </div>
            </GlassCard>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
