import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import type { TimelineItem } from "@/lib/founder-mock-data";

interface DigitalTransformationTimelineProps {
  items: TimelineItem[];
}

/**
 * Dijital Kampüs Dönüşümü — yıl bazlı zaman çizelgesi.
 * Dikey çizgi üzerinde yıl ve kilometre taşları.
 */
export function DigitalTransformationTimeline({ items }: DigitalTransformationTimelineProps) {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader align="center" eyebrow="Yol Haritası" title="Dijital Kampüs Dönüşümü" />
      </Reveal>

      <div className="mx-auto mt-10 max-w-3xl">
        <ol className="relative space-y-6 border-l border-white/10 pl-8">
          {items.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.06}>
              <li className="relative">
                {/* Nokta */}
                <span className="absolute -left-[41px] flex h-5 w-5 items-center justify-center rounded-full border border-accent/40 bg-background">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </span>
                <GlassCard tone="navy" className="flex items-center gap-4 p-5">
                  <span className="text-xl font-bold tracking-tight text-accent">
                    {item.year}
                  </span>
                  <span className="h-8 w-px bg-white/10" />
                  <span className="text-sm font-medium text-content sm:text-base">
                    {item.title}
                  </span>
                </GlassCard>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
