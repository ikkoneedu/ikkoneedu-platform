import { CalendarCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { EarlyEnrollmentTier } from "@/lib/finance-mock-data";

interface EarlyEnrollmentRevenueProps {
  tiers: EarlyEnrollmentTier[];
}

/**
 * Erken kayıt gelir analizi — kademe bazlı gelir kartları ve çubukları.
 */
export function EarlyEnrollmentRevenue({ tiers }: EarlyEnrollmentRevenueProps) {
  const max = Math.max(...tiers.map((tier) => tier.revenueValue));

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <CalendarCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Erken Kayıt Gelir Analizi</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
          >
            <p className="text-xs text-muted">{tier.level}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-content">{tier.revenue}</p>
            <p className="mt-0.5 text-xs text-muted">{tier.enrolled} erken kayıt</p>

            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(tier.revenueValue / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
