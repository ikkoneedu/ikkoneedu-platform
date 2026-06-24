import { HelpCircle, MessageCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";

interface AdmissionsFAQProps {
  questions: string[];
}

/**
 * Sık Sorulan Kayıt Soruları.
 * AI'ın yanıtlayabileceği örnek soru kartları (mock).
 */
export function AdmissionsFAQ({ questions }: AdmissionsFAQProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <HelpCircle size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sık Sorulan Kayıt Soruları</h2>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {questions.map((question) => (
          <button
            key={question}
            type="button"
            disabled
            title="Yakında (AI)"
            className="group flex cursor-not-allowed items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-left opacity-70"
          >
            <MessageCircle size={15} className="shrink-0 text-accent" aria-hidden="true" />
            <span className="text-sm text-content">{question}</span>
          </button>
        ))}
      </div>
    </GlassCard>
  );
}
