import Link from "next/link";
import { Check, Star } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { Reveal } from "@/components/landing/Reveal";
import type { PricingPlan } from "@/lib/pricing-data";

interface PricingPlansProps {
  plans: PricingPlan[];
}

/**
 * Fiyatlandırma paketleri.
 * Professional paketi görsel olarak öne çıkarılır (badge + vurgu).
 */
export function PricingPlans({ plans }: PricingPlansProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {plans.map((plan, index) => (
        <Reveal key={plan.id} delay={index * 0.08} className="h-full">
          <GlassCard
            tone="navy"
            interactive
            className={[
              "flex h-full flex-col",
              plan.highlight
                ? "border-accent/50 ring-1 ring-inset ring-accent/30 lg:-translate-y-2"
                : "",
            ].join(" ")}
          >
            {plan.badge && (
              <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                <Star size={13} aria-hidden="true" />
                {plan.badge}
              </span>
            )}

            <h3 className="text-xl font-bold tracking-tight text-content">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-muted">{plan.description}</p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-content">
                {plan.price}
              </span>
              <span className="text-sm text-muted">{plan.period}</span>
            </div>

            <ul className="mt-6 flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-content">
                  <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link href={plan.ctaHref} className="mt-6 block">
              <PrimaryButton
                variant={plan.highlight ? "primary" : "secondary"}
                size="lg"
                className="w-full"
              >
                {plan.cta}
              </PrimaryButton>
            </Link>
          </GlassCard>
        </Reveal>
      ))}
    </div>
  );
}
