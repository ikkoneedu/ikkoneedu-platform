import { GlassCard } from "@/components/shared/GlassCard";
import type { AiUsageMetric } from "@/lib/ai-mock-data";

interface AiUsageMetricsProps {
  metrics: AiUsageMetric[];
}

/**
 * AI kullanım metrikleri.
 * Günlük sorgu, aktif kullanıcı, üretilen içerik ve zaman tasarrufu (mock).
 */
export function AiUsageMetrics({ metrics }: AiUsageMetricsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <GlassCard key={metric.id} tone="navy" interactive className="p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-overlay/10 bg-navy/40 text-accent">
              <Icon size={20} aria-hidden="true" />
            </span>
            <p className="mt-4 text-2xl font-bold tracking-tight text-content">
              {metric.value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{metric.label}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}
