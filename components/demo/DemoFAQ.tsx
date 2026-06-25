import { ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Reveal } from "@/components/landing/Reveal";
import type { DemoFaqItem } from "@/lib/demo-mock-data";

interface DemoFAQProps {
  items: DemoFaqItem[];
}

/**
 * Demo SSS bölümü.
 * Native <details> ile erişilebilir, JS gerektirmeyen açılır panel.
 */
export function DemoFAQ({ items }: DemoFAQProps) {
  return (
    <section className="py-12 lg:py-16">
      <Reveal>
        <SectionHeader align="center" eyebrow="SSS" title="Sık Sorulan Sorular" />
      </Reveal>
      <div className="mx-auto mt-10 max-w-3xl space-y-3">
        {items.map((item) => (
          <details
            key={item.id}
            className="group rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-content">
              {item.question}
              <ChevronDown
                size={18}
                className="shrink-0 text-muted transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
