import type { Metadata } from "next";
import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Sparkles, ArrowRight } from "lucide-react";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { DemoHero } from "@/components/demo/DemoHero";
import { DemoRequestForm } from "@/components/demo/DemoRequestForm";
import { BenefitsGrid } from "@/components/demo/BenefitsGrid";
import { DemoProcess } from "@/components/demo/DemoProcess";
import { FounderSchoolCard } from "@/components/demo/FounderSchoolCard";
import { DemoFAQ } from "@/components/demo/DemoFAQ";
import { DemoCTA } from "@/components/demo/DemoCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata } from "@/lib/seo/seo";
import { faqSchema } from "@/lib/seo/structured-data";
import { productName } from "@/lib/constants";
import {
  institutionTypes,
  demoBenefits,
  demoSteps,
  demoFaq,
} from "@/lib/demo-mock-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return buildMetadata({
    title: t("demo.meta.title"),
    path: "/demo",
    description: t("demo.meta.description"),
    keywords: [
      "özel okul CRM",
      "okul yönetim sistemi demo",
      "okul yazılımı demo",
    ],
  });
}

export default async function DemoPage() {
  const t = await getServerT();
  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      <JsonLd data={faqSchema(demoFaq)} />
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
                {t("demo.nav.features")}
              </PrimaryButton>
            </Link>
            <Link href="/pricing">
              <PrimaryButton variant="ghost" size="sm">
                {t("demo.nav.pricing")}
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 1. Hero */}
        <DemoHero />

        {/* AI Kayıt Danışmanı bağlantısı */}
        <Link
          href="/admissions-ai"
          className="group mb-4 flex items-center gap-4 rounded-2xl border border-accent/20 bg-accent/5 p-5 transition-all hover:-translate-y-0.5 hover:bg-accent/10"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-navy/50 text-accent">
            <Sparkles size={22} aria-hidden="true" />
          </span>
          <span className="flex-1">
            <span className="block text-base font-semibold text-content">
              {t("demo.aiLink.title")}
            </span>
            <span className="block text-sm text-muted">
              {t("demo.aiLink.description")}
            </span>
          </span>
          <ArrowRight
            size={20}
            className="shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>

        {/* 2. Demo talep formu */}
        <section id="demo-form" className="scroll-mt-20 py-8">
          <Reveal>
            <SectionHeader
              align="center"
              eyebrow={t("demo.form.eyebrow")}
              title={t("demo.form.title")}
              description={t("demo.form.description")}
              className="mb-10"
            />
            <div className="mx-auto max-w-3xl">
              <DemoRequestForm institutionTypes={institutionTypes} />
            </div>
          </Reveal>
        </section>

        {/* 3. Neden ikkoneedu? */}
        <BenefitsGrid benefits={demoBenefits} />

        {/* 4. Demo süreci */}
        <DemoProcess steps={demoSteps} />

        {/* 5. Referans — kurucu okul */}
        <FounderSchoolCard />

        {/* 6. SSS */}
        <DemoFAQ items={demoFaq} />

        {/* 7. Son CTA */}
        <DemoCTA />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
