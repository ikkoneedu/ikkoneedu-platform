import { GlassCard } from "@/components/shared/GlassCard";
import { Reveal } from "@/components/landing/Reveal";
import { PhoneMockup } from "@/components/mobile/PhoneMockup";
import { ScreenContent } from "@/components/mobile/ScreenContent";
import type { AppFeature, MobileScreen } from "@/lib/mobile-mock-data";

interface AppSectionLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  features: AppFeature[];
  screen: MobileScreen;
  /** Telefonu sağa al (varsayılan: sola). */
  reverse?: boolean;
}

/**
 * Rol bazlı uygulama bölümü düzeni.
 * Bir telefon mockup'ı ve yanında örnek ekran (özellik) kartları gösterir.
 */
export function AppSectionLayout({
  eyebrow,
  title,
  description,
  features,
  screen,
  reverse = false,
}: AppSectionLayoutProps) {
  return (
    <section className="py-12 lg:py-16">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        {/* Telefon */}
        <Reveal className={reverse ? "lg:order-2" : ""}>
          <PhoneMockup>
            <ScreenContent title={screen.title} rows={screen.rows} />
          </PhoneMockup>
        </Reveal>

        {/* İçerik */}
        <Reveal delay={0.1} className={reverse ? "lg:order-1" : ""}>
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {eyebrow}
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-content sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
              {description}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <GlassCard key={feature.id} interactive className="flex items-center gap-3 p-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <span className="text-sm font-medium text-content">{feature.title}</span>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
