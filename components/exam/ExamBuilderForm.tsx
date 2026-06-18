import { SlidersHorizontal, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SelectField } from "@/components/shared/SelectField";
import type { ExamFormOptions } from "@/lib/exam-mock-data";

interface ExamBuilderFormProps {
  options: ExamFormOptions;
}

/**
 * Sınav oluşturma formu.
 * Kademe, sınıf, ders, konu, kazanım, soru sayısı, zorluk ve sınav türü.
 * "AI ile Sınav Oluştur" butonu şimdilik mock'tur.
 */
export function ExamBuilderForm({ options }: ExamBuilderFormProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sınav Oluşturma</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Eğitim Kademesi" items={options.levels} />
        <SelectField label="Sınıf" items={options.grades} />
        <SelectField label="Ders" items={options.lessons} />
        <SelectField label="Konu" items={options.topics} />
        <SelectField label="Kazanım" items={options.outcomes} />
        <SelectField label="Soru Sayısı" items={options.questionCounts} />
        <SelectField label="Zorluk Seviyesi" items={options.difficulties} />
        <SelectField label="Sınav Türü" items={options.examTypes} />
      </div>

      <PrimaryButton size="lg" className="mt-6 w-full">
        <Sparkles size={18} aria-hidden="true" />
        AI ile Sınav Oluştur
      </PrimaryButton>
    </GlassCard>
  );
}
