import { FileText, Sparkles, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

/**
 * AI Sınav Oluşturucu hero kartı.
 * Değer önerisini ve birincil eylemi (mock) öne çıkarır.
 */
export function ExamHero() {
  return (
    <GlassCard className="ai-gradient flex flex-col items-start gap-5 border-accent/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15 text-accent">
          <FileText size={26} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
            Dakikalar değil, saniyeler.
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            AI Sınav Oluşturucu; seçilen ders, konu ve kazanımlara göre sınavlar,
            quizler ve değerlendirme içerikleri üretir.
          </p>
        </div>
      </div>

      <PrimaryButton size="lg" className="w-full shrink-0 sm:w-auto">
        <Sparkles size={18} aria-hidden="true" />
        Yeni Sınav Oluştur
        <ArrowRight size={18} aria-hidden="true" />
      </PrimaryButton>
    </GlassCard>
  );
}
