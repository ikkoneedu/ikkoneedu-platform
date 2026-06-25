import { BadgeCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { QualityMetric } from "@/lib/exam-mock-data";

interface QualityAnalysisCardProps {
  metrics: QualityMetric[];
}

/**
 * AI Kalite Kontrolü.
 * Müfredat uyumu, kazanım kapsamı, zorluk dengesi ve okunabilirlik (mock).
 */
export function QualityAnalysisCard({ metrics }: QualityAnalysisCardProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <BadgeCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Kalite Kontrolü</h2>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {metrics.map((metric) => (
          <div key={metric.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-content">{metric.label}</span>
              <span className="font-semibold text-accent">%{metric.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-overlay/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
