"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";
import { productName } from "@/lib/constants";

/**
 * Platform Özellikleri hero bölümü.
 * Sayfanın değer önerisini ve birincil CTA'yı sunar.
 */
export function HeroSection() {
  const t = useT();
  return (
    <Reveal>
      <section className="flex flex-col items-center gap-6 py-16 text-center lg:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs font-medium text-accent">
          <Sparkles size={14} aria-hidden="true" />
          {t("features.hero.badge", { product: productName })}
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-content sm:text-5xl lg:text-6xl">
          {t("features.hero.title")}
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {t("features.hero.subtitle")}
        </p>

        <Link href="/demo">
          <PrimaryButton size="lg">
            {t("features.hero.cta")}
            <ArrowRight size={18} aria-hidden="true" />
          </PrimaryButton>
        </Link>
      </section>
    </Reveal>
  );
}
