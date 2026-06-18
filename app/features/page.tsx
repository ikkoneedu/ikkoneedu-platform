import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { HeroSection } from "@/components/features/HeroSection";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { AiFeatures } from "@/components/features/AiFeatures";
import { SecuritySection } from "@/components/features/SecuritySection";
import { CallToAction } from "@/components/features/CallToAction";
import { productName, tagline } from "@/lib/constants";
import {
  managementFeatures,
  studentFeatures,
  parentFeatures,
  teacherFeatures,
  aiFeatures,
  saasFeatures,
  securityFeatures,
} from "@/lib/features-data";

export const metadata: Metadata = {
  title: `Platform Özellikleri — ${productName}`,
  description:
    "Okul yönetimini, iletişimi ve yapay zekayı tek platformda birleştiren yeni nesil eğitim işletim sistemi.",
  openGraph: {
    title: `Platform Özellikleri — ${productName}`,
    description: tagline,
    siteName: productName,
    locale: "tr_TR",
    type: "website",
  },
};

export default function FeaturesPage() {
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
        <HeroSection />

        {/* 2. Yönetim modülleri */}
        <FeatureGrid
          eyebrow="Yönetim"
          title="Yönetim Modülleri"
          items={managementFeatures}
        />

        {/* 3. Öğrenci deneyimi */}
        <FeatureGrid
          eyebrow="Öğrenci"
          title="Öğrenci Deneyimi"
          items={studentFeatures}
        />

        {/* 4. Veli deneyimi */}
        <FeatureGrid
          eyebrow="Veli"
          title="Veli Deneyimi"
          items={parentFeatures}
        />

        {/* 5. Öğretmen deneyimi */}
        <FeatureGrid
          eyebrow="Öğretmen"
          title="Öğretmen Deneyimi"
          items={teacherFeatures}
        />

        {/* 6. Yapay zeka modülleri */}
        <AiFeatures items={aiFeatures} />

        {/* 7. SaaS özellikleri */}
        <FeatureGrid
          eyebrow="SaaS"
          title="SaaS Özellikleri"
          items={saasFeatures}
        />

        {/* 8. Güvenlik */}
        <SecuritySection items={securityFeatures} />

        {/* 9. Son CTA */}
        <CallToAction />
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
