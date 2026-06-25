import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { productName } from "@/lib/constants";

/**
 * Platform Özellikleri hero bölümü.
 * Sayfanın değer önerisini ve birincil CTA'yı sunar.
 */
export function HeroSection() {
  return (
    <Reveal>
      <section className="flex flex-col items-center gap-6 py-16 text-center lg:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs font-medium text-accent">
          <Sparkles size={14} aria-hidden="true" />
          Platform Özellikleri — {productName}
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-content sm:text-5xl lg:text-6xl">
          Tüm Eğitim Süreçleri Tek Platformda
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Öğrenci, veli, öğretmen ve yönetim deneyimini tek merkezden yönetin.
        </p>

        <Link href="/demo">
          <PrimaryButton size="lg">
            Demo Talep Et
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </Link>
      </section>
    </Reveal>
  );
}
