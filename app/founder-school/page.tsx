import Link from "next/link";
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

export const metadata = buildMetadata({
  title: "Kurucu Okul ve Stratejik Ortak",
  path: "/founder-school",
  description:
    "İngiliz Kültür Kolejleri, ikkoneedu okul işletim sisteminin ilk uygulama, geliştirme ve büyüme ortağıdır.",
  keywords: ["kolej yazılımı", "stratejik ortaklık", "okul dijital dönüşümü"],
});

export default function FounderSchoolPage() {
  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      {/* Üst bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-xl">
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
                Özellikler
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
