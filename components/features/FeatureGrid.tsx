import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import type { FeatureItem } from "@/lib/features-data";

interface FeatureGridProps {
  eyebrow: string;
  title: string;
  items: FeatureItem[];
}

/**
 * Özellik kartı ızgarası.
 * Bir kategori başlığı ve altında ikon + başlık + açıklama kartları.
 */
export function FeatureGrid({ eyebrow, title, items }: FeatureGridProps) {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader align="center" eyebrow={eyebrow} title={title} />
      </Reveal>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.id} delay={index * 0.05}>
              <GlassCard tone="navy" interactive className="h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-content">
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
