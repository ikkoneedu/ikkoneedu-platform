import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ExecutiveMetric } from "@/lib/executive-mock-data";

interface ExecutiveMetricsProps {
  metrics: ExecutiveMetric[];
}

const TREND_STYLES: Record<NonNullable<ExecutiveMetric["trend"]>, string> = {
  up: "text-emerald-400",
  down: "text-brand",
  neutral: "text-muted",
};

const TREND_ICON: Record<NonNullable<ExecutiveMetric["trend"]>, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

/**
 * Yönetici Özet Kartları.
 */
export function ExecutiveMetrics({ metrics }: ExecutiveMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const trend = metric.trend ?? "neutral";
        const TrendIcon = TREND_ICON[trend];
        return (
          <GlassCard key={metric.id} tone="navy" interactive className="p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-medium text-muted">{metric.label}</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <span className="text-3xl font-bold tracking-tight text-content">
                {metric.value}
              </span>
              {metric.delta && (
                <span className={`flex items-center gap-1 text-xs font-semibold ${TREND_STYLES[trend]}`}>
                  <TrendIcon size={14} aria-hidden="true" />
                  {metric.delta}
                </span>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
