import { Wallet } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { MiniBarChart } from "@/components/executive/MiniBarChart";
import type { FinancialMetric, TrendPoint } from "@/lib/executive-mock-data";

interface FinancialOverviewProps {
  metrics: FinancialMetric[];
  trend: TrendPoint[];
}

/**
 * Finansal Görünüm — Gelir Özeti + aylık gelir trendi.
 */
export function FinancialOverview({ metrics, trend }: FinancialOverviewProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Wallet size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Gelir Özeti</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
            >
              <p className="text-xs text-muted">{metric.label}</p>
              <p className="mt-1 text-xl font-bold text-content">{metric.value}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-content">Aylık Gelir Trendi (₺M)</p>
          <MiniBarChart data={trend} suffix="M" />
        </div>
      </div>
    </GlassCard>
  );
}
