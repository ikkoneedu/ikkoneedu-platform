import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import Link from "next/link";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { AdmissionCardLookup } from "@/components/scholarship/AdmissionCardLookup";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Sınav Giriş Belgesi — ${productName}`,
  description:
    "TC Kimlik No ve Başvuru Numaranız ile bursluluk sınavı giriş belgenizi görüntüleyin.",
};

export default function AdmissionCardPage() {
  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      {/* Üst bar */}
      <header className="sticky top-0 z-30 border-b border-overlay/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <span className="text-lg font-semibold tracking-tight text-content">
              {productName}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/scholarship-exam/apply">
              <PrimaryButton variant="ghost" size="sm">
                Başvuru
              </PrimaryButton>
            </Link>
            <Link href="/scholarship-exam/results">
              <PrimaryButton variant="ghost" size="sm">
                Sonuç Sorgula
              </PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <SectionHeader
          align="center"
          eyebrow="Bursluluk Sınavı"
          title="Sınav Giriş Belgesi"
          description="TC Kimlik No ve Başvuru Numaranız ile sınav giriş belgenizi görüntüleyin."
          className="mb-10"
        />
        <AdmissionCardLookup />
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
