import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { StoreButtons } from "@/components/mobile/StoreButtons";

/**
 * App Store bölümü — büyük CTA.
 * Mağaza butonları ve demo talebi yönlendirmesini sunar.
 */
export function AppStoreCTA() {
  return (
    <section className="py-16 lg:py-24">
      <Reveal>
        <GlassCard
          tone="navy"
          className="ai-gradient flex flex-col items-center gap-6 border-accent/20 px-6 py-14 text-center sm:px-10"
        >
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-content sm:text-4xl">
            Mobil Deneyimi Keşfedin
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Okulunuzu ve eğitim süreçlerinizi her an yanınızda taşıyın.
          </p>

          <StoreButtons className="justify-center" />

          <Link href="/demo">
            <PrimaryButton variant="secondary" size="lg">
              Demo Talep Et
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </Link>
        </GlassCard>
      </Reveal>
    </section>
  );
}
