import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import type { MobileMetric } from "@/lib/mobile-mock-data";

interface AppMetricsProps {
  metrics: MobileMetric[];
}

/**
 * Platform İstatistikleri.
 * Mobil kullanıma dair premium metrik kartları (mock).
 */
export function AppMetrics({ metrics }: AppMetricsProps) {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader align="center" eyebrow="İstatistikler" title="Platform İstatistikleri" />
      </Reveal>
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Reveal key={metric.id} delay={index * 0.07}>
              <GlassCard tone="navy" interactive className="p-6 text-center">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-navy/40 text-accent">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <p className="mt-4 text-3xl font-bold tracking-tight text-content">
                  {metric.value}
                </p>
                <p className="mt-1 text-xs text-muted">{metric.label}</p>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
