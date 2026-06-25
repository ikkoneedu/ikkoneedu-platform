"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";
import type { FounderCard } from "@/lib/founder-mock-data";

interface WhyIKCProps {
  cards: FounderCard[];
}

/**
 * İngiliz Kültür Kolejleri Neden Seçildi? — kartlar.
 */
export function WhyIKC({ cards }: WhyIKCProps) {
  const t = useT();
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow={t("founderSchool.whyIkc.eyebrow")}
          title={t("founderSchool.whyIkc.title")}
        />
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Reveal key={card.id} delay={index * 0.05}>
              <GlassCard tone="navy" interactive className="h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-content">
                  {t(`founderSchool.whyIkc.${card.id}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`founderSchool.whyIkc.${card.id}.description`)}
                </p>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
