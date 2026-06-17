import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

type Trend = "up" | "down" | "neutral";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: Trend;
  icon: LucideIcon;
  /** Kartın altındaki görsel (sparkline, kapasite çubuğu, puan vb.). */
  children?: ReactNode;
}

const TREND_BADGE: Record<Trend, string> = {
  up: "text-emerald-400 bg-emerald-400/10",
  down: "text-brand bg-brand/10",
  neutral: "text-muted bg-white/5",
};

const TREND_ICON: Record<Trend, LucideIcon> = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
};

/**
 * Yönetim paneli metrik kartı.
 * Büyük soluk arka plan ikonu, değer ve değişim rozeti içerir;
 * altına sparkline / kapasite / puan gibi görseller yerleştirilebilir.
 */
export function MetricCard({
  label,
  value,
  delta,
  trend = "neutral",
  icon: Icon,
  children,
}: MetricCardProps) {
  const TrendIcon = TREND_ICON[trend];

  return (
    <GlassCard tone="navy" interactive className="group relative overflow-hidden">
      <Icon
        size={64}
        aria-hidden="true"
        className="pointer-events-none absolute -right-1 -top-1 text-white/[0.06] transition-opacity group-hover:text-white/[0.1]"
      />

      <h3 className="mb-1 text-sm font-medium text-muted">{label}</h3>

      <div className="mb-4 flex items-end gap-3">
        <span className="text-3xl font-bold tracking-tight text-content">
          {value}
        </span>
        {delta && (
          <span
            className={`mb-1 flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-semibold ${TREND_BADGE[trend]}`}
          >
            <TrendIcon size={12} aria-hidden="true" />
            {delta}
          </span>
        )}
      </div>

      {children}
    </GlassCard>
  );
}
