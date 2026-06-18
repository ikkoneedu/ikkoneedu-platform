import { NotebookPen } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { SelectField } from "@/components/shared/SelectField";

interface WorksheetGeneratorProps {
  options: {
    lessons: string[];
    topics: string[];
    pageCounts: string[];
    activityTypes: string[];
  };
}

/**
 * AI Çalışma Kağıdı üretici.
 * Ders, konu, sayfa sayısı ve etkinlik türü seçimiyle çalışma kağıdı (mock).
 */
export function WorksheetGenerator({ options }: WorksheetGeneratorProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <NotebookPen size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Çalışma Kağıdı</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Ders" items={options.lessons} />
        <SelectField label="Konu" items={options.topics} />
        <SelectField label="Sayfa Sayısı" items={options.pageCounts} />
        <SelectField label="Etkinlik Türü" items={options.activityTypes} />
      </div>

      <PrimaryButton size="md" className="mt-6 w-full">
        Çalışma Kağıdı Oluştur
      </PrimaryButton>
    </GlassCard>
  );
}
