import { CalendarRange, Sparkles, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";

/**
 * AI Ders Programı Oluşturucu hero kartı.
 * Değer önerisini ve birincil eylemi (mock) öne çıkarır.
 */
export function SchedulerHero() {
  return (
    <GlassCard className="ai-gradient flex flex-col items-start gap-5 border-accent/20 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/15 text-accent">
          <CalendarRange size={26} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-content sm:text-2xl">
            10 dakikalık işi saniyelere indirin.
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
            AI Ders Programı Oluşturucu; öğretmen uygunluklarını, sınıf
            saatlerini, ders yoğunluklarını ve kurum önceliklerini analiz ederek
            en uygun programı önerir.
          </p>
        </div>
      </div>

      <PrimaryButton size="lg" className="w-full shrink-0 sm:w-auto">
        <Sparkles size={18} aria-hidden="true" />
        Yeni Program Oluştur
        <ArrowRight size={18} aria-hidden="true" />
      </PrimaryButton>
    </GlassCard>
  );
}
