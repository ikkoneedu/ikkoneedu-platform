"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";
import type { FeatureItem } from "@/lib/features-data";

interface AiFeaturesProps {
  items: FeatureItem[];
}

/**
 * Yapay Zeka Modülleri — öne çıkan büyük kartlar.
 * AI özelliklerini degrade vurgulu, geniş kartlarla sergiler.
 */
export function AiFeatures({ items }: AiFeaturesProps) {
  const t = useT();
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow={t("features.aiSection.eyebrow")}
          title={t("features.aiSection.title")}
          description={t("features.aiSection.description")}
        />
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.id} delay={index * 0.06}>
              <GlassCard className="ai-gradient h-full border-accent/20">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-content">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
