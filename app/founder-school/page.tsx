import type { Metadata } from "next";
import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { HeroSection } from "@/components/founder/HeroSection";
import { FounderBenefits } from "@/components/founder/FounderBenefits";
import { WhyIKC } from "@/components/founder/WhyIKC";
import { DigitalTransformationTimeline } from "@/components/founder/DigitalTransformationTimeline";
import { PartnershipModel } from "@/components/founder/PartnershipModel";
import { RevenueShareCard } from "@/components/founder/RevenueShareCard";
import { VisionSection } from "@/components/founder/VisionSection";
import { FounderCTA } from "@/components/founder/FounderCTA";
import { buildMetadata } from "@/lib/seo/seo";
import { productName } from "@/lib/constants";
import {
  founderBenefits,
  whyIkc,
  transformationTimeline,
  partnershipModel,
  founderRevenueShare,
  founderVisionMetrics,
} from "@/lib/founder-mock-data";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return buildMetadata({
    title: t("founderSchool.meta.title"),
    path: "/founder-school",
    description: t("founderSchool.meta.description"),
    keywords: [
      t("founderSchool.meta.keyword1"),
      t("founderSchool.meta.keyword2"),
      t("founderSchool.meta.keyword3"),
    ],
  });
}

export default async function FounderSchoolPage() {
  const t = await getServerT();
  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
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
                {t("founderSchool.nav.features")}
              </PrimaryButton>
            </Link>
            <Link href="/demo">
              <PrimaryButton size="sm">{t("founderSchool.nav.requestDemo")}</PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* 1. Hero */}
        <HeroSection />

        {/* 2. Kurucu Okul Nedir? */}
        <FounderBenefits cards={founderBenefits} />

        {/* 3. Neden IKC? */}
        <WhyIKC cards={whyIkc} />

        {/* 4. Dijital kampüs dönüşümü */}
        <DigitalTransformationTimeline items={transformationTimeline} />

        {/* 5. Ortak kazanım modeli */}
        <PartnershipModel columns={partnershipModel} />

        {/* 6. Gelir paylaşım modeli */}
        <RevenueShareCard share={founderRevenueShare} />

        {/* 7. Gelecek vizyonu */}
        <VisionSection metrics={founderVisionMetrics} />

        {/* 8. Son CTA */}
        <FounderCTA />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
