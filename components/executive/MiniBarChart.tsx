import type { TrendPoint } from "@/lib/executive-mock-data";

interface MiniBarChartProps {
  data: TrendPoint[];
  /** Değer son ekiyle gösterilir (ör. "M", "%"). */
  suffix?: string;
}

/**
 * Basit bar grafiği (gerçek grafik kütüphanesi yok).
 * Son sütun aksan rengiyle vurgulanır.
 */
export function MiniBarChart({ data, suffix = "" }: MiniBarChartProps) {
  const max = Math.max(...data.map((point) => point.value));

  return (
    <div>
      <div className="flex h-40 items-end justify-between gap-2">
        {data.map((point, index) => {
          const isLast = index === data.length - 1;
          return (
            <div key={point.label} className="group flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-2 text-[11px] font-medium text-muted opacity-0 transition-opacity group-hover:opacity-100">
                {point.value}
                {suffix}
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
  );
}
