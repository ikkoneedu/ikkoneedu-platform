"use client";

import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { PhoneMockup } from "@/components/mobile/PhoneMockup";
import { ScreenContent } from "@/components/mobile/ScreenContent";
import { useT } from "@/components/i18n/LocaleProvider";
import type { MobileScreen } from "@/lib/mobile-mock-data";

interface AppPreviewProps {
  screens: MobileScreen[];
}

/**
 * Mobil Uygulama Önizleme.
 * Veli, öğrenci, öğretmen ve AI Brain ana ekranlarını telefon mockup'larıyla
 * açıklamalı olarak sergiler.
 */
export function AppPreview({ screens }: AppPreviewProps) {
  const t = useT();
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow={t("mobileApp.preview.eyebrow")}
          title={t("mobileApp.preview.title")}
          description={t("mobileApp.preview.description")}
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {screens.map((screen, index) => (
          <Reveal key={screen.id} delay={index * 0.08}>
            <div className="flex flex-col items-center gap-5">
              <PhoneMockup>
                <ScreenContent
                  title={t(`mobileApp.screen.${screen.id}.title`)}
                  rows={screen.rows.map((_, i) =>
                    t(`mobileApp.screen.${screen.id}.row.${i}`),
                  )}
                />
              </PhoneMockup>
              <div className="text-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {t(`mobileApp.screen.${screen.id}.role`)}
                </span>
                <h3 className="mt-1 text-base font-semibold text-content">
                  {t(`mobileApp.screen.${screen.id}.title`)}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {t(`mobileApp.screen.${screen.id}.description`)}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
