import Link from "next/link";
import { ArrowRight, Tag, LayoutGrid } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";

/**
 * Son çağrı (CTA) bölümü.
 * Demo, fiyatlandırma ve özellikler sayfalarına yönlendirir.
 */
export function FounderCTA() {
  return (
    <section className="py-16 lg:py-24">
      <Reveal>
        <GlassCard
          tone="navy"
          className="ai-gradient flex flex-col items-center gap-5 border-accent/20 px-6 py-14 text-center sm:px-10"
        >
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-content sm:text-4xl">
            Birlikte Geleceği İnşa Ediyoruz
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            İngiliz Kültür Kolejleri ve ikkoneedu iş birliğiyle eğitim
            teknolojilerinde yeni bir dönem başlıyor.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/demo">
              <PrimaryButton size="lg" className="w-full sm:w-auto">
                Demo Talep Et
                <ArrowRight size={18} aria-hidden="true" />
              </PrimaryButton>
            </Link>
            <Link href="/pricing">
              <PrimaryButton variant="secondary" size="lg" className="w-full sm:w-auto">
                <Tag size={18} aria-hidden="true" />
                Fiyatlandırmayı İncele
              </PrimaryButton>
            </Link>
            <Link href="/features">
              <PrimaryButton variant="ghost" size="lg" className="w-full sm:w-auto">
                <LayoutGrid size={18} aria-hidden="true" />
                Platform Özellikleri
              </PrimaryButton>
            </Link>
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
