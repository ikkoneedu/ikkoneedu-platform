import { LineChart } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { TrendPoint } from "@/lib/finance-mock-data";

interface RevenueTrendProps {
  data: TrendPoint[];
}

/**
 * Gelir trend grafiği — saf CSS bar chart (grafik kütüphanesi yok).
 * Son sütun aksan rengiyle vurgulanır.
 */
export function RevenueTrend({ data }: RevenueTrendProps) {
  const max = Math.max(...data.map((point) => point.value));

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <LineChart size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Gelir Trendi (₺M)</h2>
      </div>

      <div>
        <div className="flex h-48 items-end justify-between gap-2">
          {data.map((point, index) => {
            const isLast = index === data.length - 1;
            return (
              <div
                key={point.label}
                className="group flex h-full flex-1 flex-col items-center justify-end"
              >
                <span className="mb-2 text-[11px] font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100">
                  {point.value}M
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
          {data.map((point) => (
            <span key={point.label} className="flex-1 text-center">
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
