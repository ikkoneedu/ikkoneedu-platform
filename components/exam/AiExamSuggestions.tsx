import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ExamSuggestion } from "@/lib/exam-mock-data";

interface AiExamSuggestionsProps {
  suggestions: ExamSuggestion[];
}

/**
 * AI Eğitim Önerileri.
 * Sınav verilerinden çıkarılan yapay zeka iyileştirme notları (mock).
 */
export function AiExamSuggestions({ suggestions }: AiExamSuggestionsProps) {
  return (
    <GlassCard className="ai-gradient border-accent/20">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Eğitim Önerileri</h2>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <li
              key={suggestion.id}
              className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="text-sm leading-relaxed text-content">
                {suggestion.text}
              </span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
