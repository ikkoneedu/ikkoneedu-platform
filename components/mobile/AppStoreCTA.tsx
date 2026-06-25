"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import { StoreButtons } from "@/components/mobile/StoreButtons";
import { useT } from "@/components/i18n/LocaleProvider";

/**
 * App Store bölümü — büyük CTA.
 * Mağaza butonları ve demo talebi yönlendirmesini sunar.
 */
export function AppStoreCTA() {
  const t = useT();
  return (
    <section className="py-16 lg:py-24">
      <Reveal>
        <GlassCard
          tone="navy"
          className="ai-gradient flex flex-col items-center gap-6 border-accent/20 px-6 py-14 text-center sm:px-10"
        >
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-content sm:text-4xl">
            {t("mobileApp.cta.title")}
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            {t("mobileApp.cta.description")}
          </p>

          <StoreButtons className="justify-center" />

          <Link href="/demo">
            <PrimaryButton variant="secondary" size="lg">
              {t("mobileApp.cta.requestDemo")}
              <ArrowRight size={18} aria-hidden="true" />
            </PrimaryButton>
          </Link>
        </GlassCard>
      </Reveal>
    </section>
  );
}
