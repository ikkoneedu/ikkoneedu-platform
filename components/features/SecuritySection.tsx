import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import type { FeatureItem } from "@/lib/features-data";

interface SecuritySectionProps {
  items: FeatureItem[];
}

/**
 * Güvenlik bölümü.
 * KVKK, rol bazlı yetkilendirme, şifreleme gibi güvenlik özelliklerini sunar.
 */
export function SecuritySection({ items }: SecuritySectionProps) {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow="Güvenlik"
          title="Kurumsal Düzeyde Güvenlik"
          description="Verileriniz, en yüksek güvenlik ve uyum standartlarıyla korunur."
        />
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal key={item.id} delay={index * 0.05}>
              <GlassCard tone="navy" interactive className="h-full">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
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
