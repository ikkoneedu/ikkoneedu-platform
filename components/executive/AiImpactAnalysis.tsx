import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { AiImpactMetric } from "@/lib/executive-mock-data";

interface AiImpactAnalysisProps {
  metrics: AiImpactMetric[];
}

/**
 * AI Kullanım Değeri — AI Etki Analizi.
 */
export function AiImpactAnalysis({ metrics }: AiImpactAnalysisProps) {
  return (
    <GlassCard className="ai-gradient flex h-full flex-col border-accent/20">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Etki Analizi</h2>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <li
              key={metric.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="flex-1 text-sm text-content">{metric.label}</span>
              <span className="text-sm font-bold text-content">{metric.value}</span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
