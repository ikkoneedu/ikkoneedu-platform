"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";
import type { Benefit } from "@/lib/demo-mock-data";

interface BenefitsGridProps {
  benefits: Benefit[];
}

/**
 * Neden ikkoneedu? — fayda kartları.
 */
export function BenefitsGrid({ benefits }: BenefitsGridProps) {
  const t = useT();
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow={t("demo.benefits.eyebrow")}
          title={t("demo.benefits.title")}
        />
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <Reveal key={benefit.id} delay={index * 0.05}>
              <GlassCard tone="navy" interactive className="h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-content">
                  {t(`demo.benefit.${benefit.id}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`demo.benefit.${benefit.id}.description`)}
                </p>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
