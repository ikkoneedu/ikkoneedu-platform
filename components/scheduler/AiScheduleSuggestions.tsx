import { Sparkles, Check } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface AiScheduleSuggestionsProps {
  suggestions: string[];
}

/**
 * AI Program Önerileri.
 * Oluşturulan programa dair yapay zeka iyileştirme notlarını listeler (mock).
 */
export function AiScheduleSuggestions({ suggestions }: AiScheduleSuggestionsProps) {
  return (
    <GlassCard className="ai-gradient flex h-full flex-col border-accent/20">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Program Önerileri</h2>
      </div>

      <ul className="space-y-3">
        {suggestions.map((suggestion) => (
          <li key={suggestion} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-accent/15 text-accent">
              <Check size={14} aria-hidden="true" />
            </span>
            <span className="text-sm leading-relaxed text-content">{suggestion}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
