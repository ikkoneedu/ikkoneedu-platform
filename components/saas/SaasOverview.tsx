import { GlassCard } from "@/components/shared/GlassCard";
import type { SaasMetric } from "@/lib/saas-mock-data";

interface SaasOverviewProps {
  metrics: SaasMetric[];
}

/**
 * Platform Genel Durumu.
 * Toplam okul, aktif kullanıcı, aylık gelir ve AI kullanımı metrikleri.
 */
export function SaasOverview({ metrics }: SaasOverviewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <GlassCard key={metric.id} tone="navy" interactive className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted">{metric.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-overlay/10 bg-navy/40 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-content">
              {metric.value}
            </p>
          </GlassCard>
        );
      })}
    </div>
  );
}
