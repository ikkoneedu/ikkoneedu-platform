import { GlassCard } from "@/components/shared/GlassCard";
import type { CampusPerformance } from "@/lib/mock-data";

interface PerformanceChartProps {
  title: string;
  data: CampusPerformance[];
  /** Dönem seçenekleri (görsel amaçlı). */
  periods?: string[];
}

/**
 * Kampüs performans analizi — basit bar chart.
 * Her çubuğun yüksekliği yüzde değerine göre belirlenir; öne çıkan kampüs
 * aksan rengiyle vurgulanır. Üzerine gelindiğinde değer ipucu gösterilir.
 */
export function PerformanceChart({
  title,
  data,
  periods = ["Son 30 Gün", "Bu Dönem", "Yıllık"],
}: PerformanceChartProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-content">{title}</h2>
        <select
          aria-label="Dönem seçimi"
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          defaultValue={periods[0]}
        >
          {periods.map((period) => (
            <option key={period} className="bg-surface text-content">
              {period}
            </option>
          ))}
        </select>
      </div>

      <div className="relative flex h-[280px] w-full items-end justify-between gap-2 border-b border-white/10 pb-2 pt-10">
        {/* Yatay ızgara çizgileri */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-2">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="h-px w-full bg-white/5" />
          ))}
        </div>

        {data.map((bar) => (
          <div
            key={bar.id}
            className="group relative z-10 flex h-full flex-1 items-end"
          >
            <div
              className={[
                "w-full rounded-t-md transition-colors",
                bar.highlight
                  ? "bg-accent shadow-[0_0_15px_rgba(178,199,239,0.3)]"
                  : "bg-accent/25 hover:bg-accent/45",
              ].join(" ")}
              style={{ height: `${bar.value}%` }}
            >
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-surface px-2 py-1 text-xs text-content opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {bar.fullName}: %{bar.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-between text-xs text-muted">
        {data.map((bar) => (
          <span key={bar.id} className="flex-1 text-center">
            {bar.label}
          </span>
        ))}
      </div>
    </GlassCard>
  );
}
