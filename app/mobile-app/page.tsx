import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { MobileHero } from "@/components/mobile/MobileHero";
import { AppPreview } from "@/components/mobile/AppPreview";
import { ParentAppSection } from "@/components/mobile/ParentAppSection";
import { StudentAppSection } from "@/components/mobile/StudentAppSection";
import { TeacherAppSection } from "@/components/mobile/TeacherAppSection";
import { AIBrainMobile } from "@/components/mobile/AIBrainMobile";
import { NotificationCenter } from "@/components/mobile/NotificationCenter";
import { SecuritySection } from "@/components/mobile/SecuritySection";
import { AppMetrics } from "@/components/mobile/AppMetrics";
import { AppStoreCTA } from "@/components/mobile/AppStoreCTA";
import { productName } from "@/lib/constants";
import {
  mobileScreens,
  mobileNotifications,
  mobileSecurity,
  mobileMetrics,
} from "@/lib/mobile-mock-data";

export const metadata: Metadata = {
  title: `Mobil Uygulama — ${productName}`,
  description:
    "Veli, öğrenci, öğretmen ve yöneticiler için tasarlanmış yeni nesil mobil deneyim. Okulunuz cebinizde.",
  openGraph: {
    title: `Okulunuz Cebinizde — ${productName}`,
    description: "ikkoneedu mobil uygulamasıyla okulunuza her yerden erişin.",
    siteName: productName,
    locale: "tr_TR",
    type: "website",
  },
};

export default function MobileAppPage() {
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
        <MobileHero />

        {/* 2. Uygulama önizleme */}
        <AppPreview screens={mobileScreens} />

        {/* 3-5. Rol bazlı uygulama bölümleri */}
        <ParentAppSection />
        <StudentAppSection />
        <TeacherAppSection />

        {/* 6. AI Brain mobil */}
        <AIBrainMobile />

        {/* 7. Bildirim merkezi */}
        <NotificationCenter notifications={mobileNotifications} />

        {/* 8. Mobil güvenlik */}
        <SecuritySection items={mobileSecurity} />

        {/* 9. Platform istatistikleri */}
        <AppMetrics metrics={mobileMetrics} />

        {/* 10. App Store CTA */}
        <AppStoreCTA />
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
