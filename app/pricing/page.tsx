import type { Metadata } from "next";
import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { PricingPlans } from "@/components/pricing/PricingPlans";
import { ModuleMatrix } from "@/components/pricing/ModuleMatrix";
import { RevenuePotential } from "@/components/pricing/RevenuePotential";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { PricingFaq } from "@/components/pricing/PricingFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/seo";
import { faqSchema } from "@/lib/seo/structured-data";
import { productName } from "@/lib/constants";
import {
  pricingPlans,
  revenuePotential,
  averageMonthlyRevenuePerSchool,
  revenueShareModel,
  comparisonColumns,
  comparisonRows,
  pricingFaq,
} from "@/lib/pricing-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return buildMetadata({
    title: t("pricing.meta.title"),
    path: "/pricing",
    description: t("pricing.meta.description"),
    keywords: ["kolej yazılımı fiyat", "okul yönetim sistemi fiyatlandırma", "SaaS okul yazılımı"],
  });
}

export default async function PricingPage() {
  const t = await getServerT();
  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      <JsonLd data={faqSchema(pricingFaq)} />
      {/* Üst bar */}
      <header className="sticky top-0 z-30 border-b border-overlay/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight text-content">
              {productName}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/features">
              <PrimaryButton variant="ghost" size="sm">
                {t("pricing.nav.features")}
              </PrimaryButton>
            </Link>
            <Link href="/demo">
              <PrimaryButton size="sm">{t("pricing.nav.requestDemo")}</PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <Reveal>
          <div className="py-16 text-center lg:py-20">
            <SectionHeader
              align="center"
              eyebrow={t("pricing.header.eyebrow")}
              title={t("pricing.header.title")}
              description={t("pricing.header.description")}
            />
          </div>
        </Reveal>

        {/* Paketler */}
        <section className="pb-8">
          <PricingPlans plans={pricingPlans} />
        </section>

        {/* Modül matrisi — katalog odaklı (paket→modül), ödeme yok */}
        <section className="py-12 lg:py-16">
          <Reveal>
            <ModuleMatrix />
          </Reveal>
        </section>

        {/* Gelir potansiyeli */}
        <section className="py-12 lg:py-16">
          <Reveal>
            <RevenuePotential
              tiers={revenuePotential}
              averageMonthly={averageMonthlyRevenuePerSchool}
              share={revenueShareModel}
            />
          </Reveal>
        </section>

        {/* Karşılaştırma tablosu */}
        <section className="py-12 lg:py-16">
          <Reveal>
            <ComparisonTable columns={comparisonColumns} rows={comparisonRows} />
          </Reveal>
        </section>

        {/* SSS */}
        <section className="py-12 lg:py-16">
          <Reveal>
            <PricingFaq items={pricingFaq} />
          </Reveal>
        </section>

        {/* Son CTA */}
        <section className="py-12 lg:py-20">
          <Reveal>
            <div className="rounded-2xl border border-accent/20 bg-navy/30 px-6 py-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
                {t("pricing.cta.title")}
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
                {t("pricing.cta.description")}
              </p>
              <Link href="/demo" className="mt-6 inline-block">
                <PrimaryButton size="lg">{t("pricing.cta.requestDemo")}</PrimaryButton>
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
