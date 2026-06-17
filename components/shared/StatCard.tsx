import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface StatCardProps {
  label: string;
  value: string;
  /** Değişim metni (ör. "+%8,2"). */
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
}

const TREND_STYLES: Record<NonNullable<StatCardProps["trend"]>, string> = {
  up: "text-emerald-400",
  down: "text-brand",
  neutral: "text-muted",
};

const TREND_ICONS: Record<NonNullable<StatCardProps["trend"]>, LucideIcon> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

/**
 * İstatistik kartı.
 * Bir metriği ikon, değer ve değişim göstergesiyle sunar.
 */
export function StatCard({
  label,
  value,
  delta,
  trend = "neutral",
  icon: Icon,
}: StatCardProps) {
  const TrendIcon = TREND_ICONS[trend];

  return (
    <GlassCard interactive className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-muted">{label}</span>
        {Icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
            <Icon size={18} aria-hidden="true" />
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <span className="text-3xl font-bold tracking-tight text-content">
          {value}
        </span>
        {delta && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${TREND_STYLES[trend]}`}
          >
            <TrendIcon size={14} aria-hidden="true" />
            {delta}
          </span>
        )}
      </div>
    </GlassCard>
  );
}
