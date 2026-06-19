import { Sparkles, Lightbulb } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface AiCounselingInsightsProps {
  insights: string[];
}

/**
 * AI Rehberlik Önerileri — yapay zeka destekli içgörü kartı (mock).
 */
export function AiCounselingInsights({ insights }: AiCounselingInsightsProps) {
  return (
    <GlassCard className="ai-gradient flex h-full flex-col border-accent/20 px-6 py-8 sm:px-8">
      <div className="flex items-center gap-2 text-accent">
        <Sparkles size={20} aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]">Yapay Zeka</span>
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-content sm:text-3xl">
        AI Rehberlik Önerileri
      </h2>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {insights.map((insight) => (
          <li
            key={insight}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-background/30 p-4"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/15 text-accent">
              <Lightbulb size={15} aria-hidden="true" />
            </span>
            <span className="text-sm leading-relaxed text-content">{insight}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
