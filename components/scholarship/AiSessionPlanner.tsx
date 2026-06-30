import { Sparkles, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { PreviewBadge } from "@/components/shared/PreviewBadge";
import {
  sessionPlanningRules,
  aiSessionSuggestions,
} from "@/lib/scholarship-exam-mock-data";

/**
 * AI Oturum ve Salon Planlama.
 * Planlama kuralları ve yapay zeka önerileri.
 */
export function AiSessionPlanner() {
  return (
    <GlassCard tone="navy" className="ai-gradient border-accent/20">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">
          AI Oturum ve Salon Planlama
        </h2>
        <PreviewBadge ai className="ml-auto" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Planlama Kuralları
          </p>
          <div className="flex flex-wrap gap-2">
            {sessionPlanningRules.map((rule) => (
              <span
                key={rule}
                className="rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1.5 text-xs text-content"
              >
                {rule}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">
            AI Önerileri
          </p>
          <ul className="space-y-2">
            {aiSessionSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                className="flex items-start gap-2 rounded-xl bg-overlay/[0.04] px-3 py-2 text-sm text-content"
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <PrimaryButton type="button" disabled title="Yakında">
          AI ile Oturum Planla · Yakında
        </PrimaryButton>
      </div>
    </GlassCard>
  );
}
