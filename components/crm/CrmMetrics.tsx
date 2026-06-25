import { GlassCard } from "@/components/shared/GlassCard";
import type { CrmMetric } from "@/lib/crm-mock-data";

interface CrmMetricsProps {
  metrics: CrmMetric[];
}

/**
 * CRM Genel Metrikleri.
 */
export function CrmMetrics({ metrics }: CrmMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <GlassCard key={metric.id} tone="navy" interactive className="p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-overlay/10 bg-navy/40 text-accent">
              <Icon size={18} aria-hidden="true" />
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight text-content">
              {metric.value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{metric.label}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
