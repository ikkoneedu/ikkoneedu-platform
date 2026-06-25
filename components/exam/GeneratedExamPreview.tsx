import { FileCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { GeneratedQuestion } from "@/lib/exam-mock-data";

interface GeneratedExamPreviewProps {
  questions: GeneratedQuestion[];
}

const DIFFICULTY_STYLES: Record<GeneratedQuestion["difficulty"], string> = {
  Kolay: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Orta: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Zor: "border-brand/20 bg-brand/10 text-brand",
};

/**
 * AI üretim önizleme alanı — Oluşturulan Sınav.
 * Her soruda zorluk, kazanım ve soru tipi etiketleri gösterilir.
 */
export function GeneratedExamPreview({ questions }: GeneratedExamPreviewProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <FileCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Oluşturulan Sınav</h2>
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="rounded-xl border border-overlay/5 bg-overlay/[0.03] p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-navy/50 text-xs font-bold text-accent">
                {question.number}
              </span>
              <p className="text-sm leading-relaxed text-content">{question.text}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 pl-10">
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${DIFFICULTY_STYLES[question.difficulty]}`}
              >
                {question.difficulty}
              </span>
              <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                {question.outcome}
              </span>
              <span className="rounded-full border border-overlay/10 bg-overlay/[0.04] px-2 py-0.5 text-[11px] font-medium text-muted">
                {question.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
