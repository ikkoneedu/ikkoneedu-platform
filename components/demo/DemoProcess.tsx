import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import type { DemoStep } from "@/lib/demo-mock-data";

interface DemoProcessProps {
  steps: DemoStep[];
}

/**
 * Demo Süreci — adım kartları.
 */
export function DemoProcess({ steps }: DemoProcessProps) {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader align="center" eyebrow="Süreç" title="Demo Süreci" />
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Reveal key={step.id} delay={index * 0.08}>
              <GlassCard tone="navy" interactive className="h-full">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="text-3xl font-bold text-overlay/10">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-content">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
