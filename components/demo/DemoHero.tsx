import { Sparkles, ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { productName } from "@/lib/constants";
import { getServerT } from "@/lib/i18n/server";

/**
 * Demo sayfası hero bölümü.
 * Değer önerisini ve forma yönlendiren birincil CTA'yı sunar.
 */
export async function DemoHero() {
  const t = await getServerT();
  return (
    <Reveal>
      <section className="flex flex-col items-center gap-6 py-16 text-center lg:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs font-medium text-accent">
          <Sparkles size={14} aria-hidden="true" />
          {t("demo.hero.badge", { product: productName })}
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-content sm:text-5xl lg:text-6xl">
          {t("demo.hero.title")}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {t("demo.hero.description")}
        </p>

        <a href="#demo-form">
          <PrimaryButton size="lg">
            {t("demo.hero.cta")}
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </a>
      </section>
    </Reveal>
  );
}
