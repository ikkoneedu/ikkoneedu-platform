import Link from "next/link";
import { FileText, Wand2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { ExamBuilderOptions } from "@/lib/mock-data";

interface ExamBuilderPreviewProps {
  options: ExamBuilderOptions;
}

interface SelectFieldProps {
  label: string;
  items: string[];
}

function SelectField({ label, items }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted">{label}</label>
      <select
        aria-label={label}
        defaultValue={items[0]}
        className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
      >
        {items.map((item) => (
          <option key={item} className="bg-surface text-content">
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Sınav ve Quiz Merkezi.
 * AI destekli sınav oluşturucu önizlemesi; "Sınav Oluştur" /exam-ai'ye gider.
 */
export function ExamBuilderPreview({ options }: ExamBuilderPreviewProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Wand2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sınav ve Quiz Merkezi</h2>
      </div>
      <p className="mb-5 text-sm text-muted">
        AI destekli sınav oluşturucu ile kazanımlara uygun sınavı saniyeler
        içinde hazırlayın.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Ders" items={options.lessons} />
        <SelectField label="Sınıf" items={options.classes} />
        <SelectField label="Konu" items={options.topics} />
        <SelectField label="Soru Sayısı" items={options.questionCounts} />
      </div>

      <Link href="/exam-ai" className="mt-5 block">
        <PrimaryButton size="lg" className="w-full">
          <FileText size={18} aria-hidden="true" />
          Sınav Oluştur
        </PrimaryButton>
      </Link>
    </GlassCard>
  );
}
