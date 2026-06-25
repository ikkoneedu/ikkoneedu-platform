"use client";

import { Rocket } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/landing/Reveal";
import { useT } from "@/components/i18n/LocaleProvider";
import type { VisionMetric } from "@/lib/founder-mock-data";

interface VisionSectionProps {
  metrics: VisionMetric[];
}

/**
 * Gelecek Vizyonu — büyük hero kartı + ölçek bazlı gelir projeksiyonu.
 */
export function VisionSection({ metrics }: VisionSectionProps) {
  const t = useT();
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <GlassCard className="ai-gradient border-accent/20 px-6 py-12 sm:px-10">
          <div className="flex items-center gap-2 text-accent">
            <Rocket size={20} aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em]">
              {t("founderSchool.vision.eyebrow")}
            </span>
          </div>

          <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-tight text-content sm:text-3xl lg:text-4xl">
            {t("founderSchool.vision.title")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
            {t("founderSchool.vision.description")}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.id}
                className={[
                  "rounded-2xl border bg-background/30 p-5 text-center",
                  metric.highlight
                    ? "border-accent/40 ring-1 ring-inset ring-accent/20"
                    : "border-overlay/10",
                ].join(" ")}
              >
                <p className="text-sm font-semibold text-accent">
                  {t(`founderSchool.vision.${metric.id}.schools`)}
                </p>
                <p className="mt-2 text-lg font-bold tracking-tight text-content">
                  {t(`founderSchool.vision.${metric.id}.yearly`)}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </Reveal>
    </section>
  );
}
