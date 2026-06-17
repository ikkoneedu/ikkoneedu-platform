import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { LogoMark } from "@/components/shared/LogoMark";
import { productName } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Platform Özellikleri — ${productName}`,
  description: "ikkoneedu platformunun özelliklerini keşfedin.",
};

/**
 * Platform özellikleri ekranı — geçici yer tutucu.
 * Pazarlama sayfası "Platformu İncele" CTA'sının yönlendirme hedefi.
 */
export default function FeaturesPage() {
  return (
    <div className="mesh-bg flex min-h-screen w-full items-center justify-center px-4 py-10">
      <GlassCard tone="navy" className="max-w-md text-center sm:p-10">
        <div className="mb-5 flex justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/20 bg-navy/50 text-accent">
            <LayoutGrid size={26} aria-hidden="true" />
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-content">
          Platform Özellikleri
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Platformun tüm özelliklerini ayrıntılı anlatan ekran yakında hazır
          olacak.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <PrimaryButton variant="secondary" size="lg">
              <LogoMark size={18} />
              Ana Sayfaya Dön
            </PrimaryButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
