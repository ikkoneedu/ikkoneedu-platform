import { Zap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SelectField } from "@/components/shared/SelectField";

interface QuizGeneratorProps {
  options: {
    lessons: string[];
    topics: string[];
    questionCounts: string[];
  };
}

/**
 * Hızlı Quiz oluşturucu.
 * Ders, konu ve soru sayısı seçimiyle quiz üretir (mock).
 */
export function QuizGenerator({ options }: QuizGeneratorProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <Zap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Hızlı Quiz Oluştur</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SelectField label="Ders" items={options.lessons} />
        <SelectField label="Konu" items={options.topics} />
        <SelectField label="Soru Sayısı" items={options.questionCounts} />
      </div>

      <PrimaryButton size="md" className="mt-6 w-full">
        Quiz Üret
      </PrimaryButton>
    </GlassCard>
  );
}
