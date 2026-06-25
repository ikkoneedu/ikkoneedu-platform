import { Sparkles, ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { productName } from "@/lib/constants";

/**
 * Demo sayfası hero bölümü.
 * Değer önerisini ve forma yönlendiren birincil CTA'yı sunar.
 */
export function DemoHero() {
  return (
    <Reveal>
      <section className="flex flex-col items-center gap-6 py-16 text-center lg:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs font-medium text-accent">
          <Sparkles size={14} aria-hidden="true" />
          Demo Talep — {productName}
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-content sm:text-5xl lg:text-6xl">
          Geleceğin Eğitim İşletim Sistemini Deneyimleyin
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Yapay zeka destekli okul yönetimi, veli iletişimi, öğrenci deneyimi ve
          akademik süreçleri tek platformda görün.
        </p>

        <a href="#demo-form">
          <PrimaryButton size="lg">
            Demo Görüşmesi Planla
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </a>
      </section>
    </Reveal>
  );
}
