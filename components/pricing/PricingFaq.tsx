"use client";

import { ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useT } from "@/components/i18n/LocaleProvider";
import type { FaqItem } from "@/lib/pricing-data";

interface PricingFaqProps {
  items: FaqItem[];
}

/**
 * Sık Sorulan Sorular.
 * Native <details> ile erişilebilir, JS gerektirmeyen açılır panel.
 */
export function PricingFaq({ items }: PricingFaqProps) {
  const t = useT();
  return (
    <GlassCard tone="navy">
      <h2 className="mb-5 text-lg font-semibold text-content">{t("pricing.faq.title")}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item.id}
            className="group rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold text-content">
              {t(`pricing.faq.${item.id}.question`)}
              <ChevronDown
                size={18}
                className="shrink-0 text-muted transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t(`pricing.faq.${item.id}.answer`)}
            </p>
          </details>
        ))}
      </div>
    </GlassCard>
  );
}
