import { Check } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SaasSubscription } from "@/lib/saas-mock-data";

interface SubscriptionCardsProps {
  subscriptions: SaasSubscription[];
}

/**
 * Abonelik Yönetimi.
 * Paket kartları: özellik listesi, aktif okul sayısı ve gelir katkısı.
 */
export function SubscriptionCards({ subscriptions }: SubscriptionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {subscriptions.map((plan) => (
        <GlassCard
          key={plan.id}
          tone="navy"
          interactive
          className={[
            "flex flex-col",
            plan.highlight ? "border-accent/40 ring-1 ring-inset ring-accent/20" : "",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-content">{plan.name}</h3>
            {plan.highlight && (
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent">
                Popüler
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold tracking-tight text-accent">
            {plan.price}
          </p>

          <ul className="mt-5 flex-1 space-y-2.5">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-content">
                <Check size={16} className="shrink-0 text-emerald-400" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-xs text-muted">Aktif Okul</p>
              <p className="text-lg font-bold text-content">{plan.activeSchools}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Gelir Katkısı</p>
              <p className="text-lg font-bold text-content">{plan.revenueShare}</p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
