import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import { PhoneMockup } from "@/components/mobile/PhoneMockup";
import { ScreenContent } from "@/components/mobile/ScreenContent";
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
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow="Önizleme"
          title="Her Rol İçin Tasarlandı"
          description="Veli, öğrenci, öğretmen ve yönetici deneyimi tek uygulamada."
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {screens.map((screen, index) => (
          <Reveal key={screen.id} delay={index * 0.08}>
            <div className="flex flex-col items-center gap-5">
              <PhoneMockup>
                <ScreenContent title={screen.title} rows={screen.rows} />
              </PhoneMockup>
              <div className="text-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {screen.role}
                </span>
                <h3 className="mt-1 text-base font-semibold text-content">
                  {screen.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {screen.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
