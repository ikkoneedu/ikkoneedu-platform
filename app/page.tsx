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
import { getServerT } from "@/lib/i18n/server";
import { productName, description } from "@/lib/constants";
import {
  founderHighlights,
  platformExperiences,
  aiModules,
  type LandingCard,
} from "@/lib/mock-data";

/** SaaS gelir kademeleri (sayı/tutar; etiketler çeviriden gelir). */
const REVENUE_TIERS = [
  { id: "t10", count: 10, amount: "1.2" },
  { id: "t25", count: 25, amount: "3" },
  { id: "t50", count: 50, amount: "6", highlight: true },
  { id: "t100", count: 100, amount: "12" },
];

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

export default async function HomePage() {
  const t = await getServerT();
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
                {t("nav.features")}
              </PrimaryButton>
            </Link>
            <Link href="/pricing" className="hidden lg:block">
              <PrimaryButton variant="ghost" size="sm">
                {t("nav.pricing")}
              </PrimaryButton>
            </Link>
            <Link href="/founder-school" className="hidden lg:block">
              <PrimaryButton variant="ghost" size="sm">
                {t("nav.founderSchool")}
              </PrimaryButton>
            </Link>
            <Link href="/login">
              <PrimaryButton variant="ghost" size="sm">
                {t("common.login")}
              </PrimaryButton>
            </Link>
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/demo">
              <PrimaryButton size="sm">{t("nav.requestDemo")}</PrimaryButton>
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
              eyebrow={t("landing.portalEyebrow")}
              title={t("landing.portalTitle")}
              description={t("landing.portalDesc")}
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
                        {t(`landing.portal.${card.id}`)}
                      </h3>
                      <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-accent">
                        {t("common.login")}
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
              eyebrow={t("landing.founderEyebrow")}
              title={t("landing.founderTitle")}
              description={t("landing.founderDesc")}
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {founderHighlights.map((card, index) => (
              <Reveal key={card.id} delay={index * 0.08}>
                <InfoCard
                  card={{
                    ...card,
                    title: t(`landing.card.${card.id}.title`),
                    description: t(`landing.card.${card.id}.desc`),
                  }}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 3. Tek Platform, Dört Deneyim */}
        <section className="py-16 lg:py-20">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow={t("landing.platformEyebrow")}
              title={t("landing.platformTitle")}
              description={t("landing.platformDesc")}
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {platformExperiences.map((card, index) => (
              <Reveal key={card.id} delay={index * 0.08}>
                <InfoCard
                  card={{
                    ...card,
                    title: t(`landing.card.${card.id}.title`),
                    description: t(`landing.card.${card.id}.desc`),
                  }}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4. AI Modülleri */}
        <section className="py-16 lg:py-20">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow={t("landing.aiEyebrow")}
              title={t("landing.aiTitle")}
              description={t("landing.aiDesc")}
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {aiModules.map((card, index) => (
              <Reveal key={card.id} delay={index * 0.06}>
                <InfoCard
                  card={{
                    ...card,
                    title: t(`landing.card.${card.id}.title`),
                    description: t(`landing.card.${card.id}.desc`),
                  }}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* 5. SaaS Gelir Modeli */}
        <section className="py-16 lg:py-20">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow={t("landing.revenueEyebrow")}
              title={t("landing.revenueTitle")}
              description={t("landing.revenueDesc")}
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {REVENUE_TIERS.map((tier, index) => (
              <Reveal key={tier.id} delay={index * 0.08}>
                <GlassCard
                  tone="navy"
                  interactive
                  className={[
                    "h-full text-center",
                    tier.highlight ? "border-accent/40 ring-accent/20" : "",
                  ].join(" ")}
                >
                  <p className="text-sm font-medium text-accent">
                    {t("landing.tier.schools", { count: tier.count })}
                  </p>
                  <p className="mt-3 text-2xl font-bold tracking-tight text-content sm:text-3xl">
                    {t("landing.tier.revenue", { amount: tier.amount })}
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
                  {t("landing.mobileBadge")}
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-content sm:text-3xl">
                  {t("landing.mobileTitle")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {t("landing.mobileDesc")}
                </p>
              </div>
              <Link href="/mobile-app" className="shrink-0">
                <PrimaryButton size="lg">
                  {t("landing.mobileButton")}
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
                  {t("landing.scholarBadge")}
                </span>
                <h2 className="mt-4 text-2xl font-bold tracking-tight text-content sm:text-3xl">
                  {t("landing.scholarTitle")}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  {t("landing.scholarDesc")}
                </p>
              </div>
              <Link href="/scholarship-exam/apply" className="shrink-0">
                <PrimaryButton size="lg">
                  {t("landing.scholarButton")}
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
                {t("landing.finalTitle")}
              </h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/demo">
                  <PrimaryButton size="lg" className="w-full sm:w-auto">
                    {t("nav.requestDemo")}
                    <ArrowRight size={18} aria-hidden="true" />
                  </PrimaryButton>
                </Link>
                <Link href="/login">
                  <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
                    <LogIn size={18} aria-hidden="true" />
                    {t("common.login")}
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
