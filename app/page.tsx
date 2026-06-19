import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, LogIn, Smartphone } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { HeroShowcase } from "@/components/landing/HeroShowcase";
import {
  productName,
  productFullName,
  tagline,
  description,
} from "@/lib/constants";
import {
  founderHighlights,
  platformExperiences,
  aiModules,
  revenueTiers,
  type LandingCard,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: `${productName} — ${tagline}`,
  description,
  keywords: [
    "ikkoneedu",
    "eğitim işletim sistemi",
    "yapay zeka eğitim",
    "okul yönetim sistemi",
    "EdTech",
    "dijital kampüs",
    "İngiliz Kültür Kolejleri",
    "SaaS okul yazılımı",
  ],
  openGraph: {
    title: `${productName} — ${tagline}`,
    description,
    siteName: productName,
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${productName} — ${tagline}`,
    description,
  },
};

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

export default function HomePage() {
  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      {/* Üst bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
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
            <Link href="/demo">
              <PrimaryButton size="sm">Demo Talep Et</PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 1. Hero */}
        <section className="grid grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <Reveal>
            <div className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-accent">
                <Sparkles size={14} aria-hidden="true" />
                {productFullName}
              </span>

              <div>
                <h1 className="text-5xl font-bold tracking-tight text-content sm:text-6xl">
                  {productName}
                </h1>
                <p className="mt-3 text-xl font-medium text-accent sm:text-2xl">
                  {tagline}
                </p>
              </div>

              <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                Okul yönetimini, veli iletişimini, öğrenci deneyimini ve yapay
                zekayı tek platformda birleştiren yeni nesil dijital kampüs
                ekosistemi.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/demo">
                  <PrimaryButton size="lg" className="w-full sm:w-auto">
                    Demo Talep Et
                    <ArrowRight size={18} aria-hidden="true" />
                  </PrimaryButton>
                </Link>
                <Link href="/features">
                  <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
                    Platformu İncele
                  </PrimaryButton>
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <HeroShowcase />
          </Reveal>
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
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-accent">
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
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <LogoMark size={24} />
            <span className="font-medium text-content">{productName}</span>
          </div>
          <p>© {new Date().getFullYear()} {productName}. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
