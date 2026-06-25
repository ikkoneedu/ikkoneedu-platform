import { Check, Handshake } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import type { PartnershipColumn } from "@/lib/founder-mock-data";

interface PartnershipModelProps {
  columns: PartnershipColumn[];
}

/**
 * Ortak Kazanım Modeli.
 * İki kolonlu kart: eğitim ortağı ve teknoloji ortağı sorumlulukları.
 */
export function PartnershipModel({ columns }: PartnershipModelProps) {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader
          align="center"
          eyebrow="Ortaklık"
          title="Bir Yazılım Değil, Bir Eğitim Teknolojisi Girişimi"
        />
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {columns.map((column, index) => {
          const Icon = column.icon;
          return (
            <Reveal key={column.id} delay={index * 0.1} className="h-full">
              <GlassCard tone="navy" className="flex h-full flex-col">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-content">
                      {column.name}
                    </h3>
                    <p className="text-xs font-medium uppercase tracking-wide text-accent">
                      {column.role}
                    </p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {column.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-content">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/15 text-accent">
                        <Check size={13} aria-hidden="true" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.2}>
        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-overlay/10 bg-overlay/[0.04] px-4 py-2 text-sm text-muted">
          <Handshake size={16} className="text-accent" aria-hidden="true" />
          Eğitim uzmanlığı ve teknoloji gücü tek bir vizyonda birleşir.
        </div>
      </Reveal>
    </section>
  );
}
