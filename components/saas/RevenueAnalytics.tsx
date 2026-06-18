import { LineChart } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { RevenuePoint, RevenueMetric } from "@/lib/saas-mock-data";

interface RevenueAnalyticsProps {
  revenueByMonth: RevenuePoint[];
  metrics: RevenueMetric[];
}

/**
 * Gelir Analitiği.
 * Aylık gelir bar grafiği ve MRR/ARR/Yeni Müşteri/Churn metrikleri.
 */
export function RevenueAnalytics({ revenueByMonth, metrics }: RevenueAnalyticsProps) {
  const max = Math.max(...revenueByMonth.map((point) => point.value));

  return (
    <GlassCard tone="navy">
      <div className="mb-6 flex items-center gap-2">
        <LineChart size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Gelir Analitiği</h2>
      </div>

      {/* Aylık gelir grafiği */}
      <div className="flex h-48 items-end justify-between gap-3 border-b border-white/10 pb-2">
        {revenueByMonth.map((point, index) => {
          const isLast = index === revenueByMonth.length - 1;
          return (
            <div key={point.month} className="group flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-2 text-[11px] font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100">
                ₺{point.value}K
              </span>
              <div
                className={[
                  "w-full rounded-t-md transition-colors",
                  isLast ? "bg-accent" : "bg-accent/25 group-hover:bg-accent/45",
                ].join(" ")}
                style={{ height: `${(point.value / max) * 100}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        {revenueByMonth.map((point) => (
          <span key={point.month} className="flex-1 text-center">
            {point.month}
          </span>
        ))}
      </div>

      {/* Metrikler */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
          >
            <p className="text-sm font-semibold text-accent">{metric.label}</p>
            <p className="text-[11px] text-muted">{metric.sublabel}</p>
            <p className="mt-2 text-xl font-bold text-content">{metric.value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
