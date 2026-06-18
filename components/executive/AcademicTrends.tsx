import { LineChart, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { MiniBarChart } from "@/components/executive/MiniBarChart";
import type { AcademicMetric, TrendPoint } from "@/lib/executive-mock-data";

interface AcademicTrendsProps {
  metrics: AcademicMetric[];
  trend: TrendPoint[];
}

/**
 * Akademik Başarı Trendleri — metrikler + son 6 ay gelişim grafiği.
 */
export function AcademicTrends({ metrics, trend }: AcademicTrendsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <LineChart size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Akademik Başarı Trendleri</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric) => {
            const TrendIcon = metric.trend === "down" ? TrendingDown : TrendingUp;
            const good = metric.id === "devamsizlik" ? metric.trend === "down" : metric.trend === "up";
            return (
              <div
                key={metric.id}
                className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
              >
                <p className="text-xs text-muted">{metric.label}</p>
                <div className="mt-1 flex items-end justify-between gap-2">
                  <p className="text-xl font-bold text-content">{metric.value}</p>
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${good ? "text-emerald-400" : "text-brand"}`}>
                    <TrendIcon size={13} aria-hidden="true" />
                    {metric.delta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-content">Son 6 Ay Akademik Gelişim</p>
          <MiniBarChart data={trend} />
        </div>
      </div>
    </GlassCard>
  );
}
