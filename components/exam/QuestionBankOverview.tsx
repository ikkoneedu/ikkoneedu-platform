import { Database } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SelectField } from "@/components/shared/SelectField";
import type { QuestionBankMetric } from "@/lib/exam-mock-data";

interface QuestionBankOverviewProps {
  metrics: QuestionBankMetric[];
  filters: {
    lessons: string[];
    topics: string[];
    outcomes: string[];
    difficulties: string[];
  };
}

/**
 * Soru Bankası Merkezi.
 * Banka metriklerini ve filtre alanlarını gösterir (mock).
 */
export function QuestionBankOverview({ metrics, filters }: QuestionBankOverviewProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Database size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Soru Bankası Merkezi</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-center"
          >
            <p className="text-2xl font-bold tracking-tight text-content">
              {metric.value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField label="Ders" items={filters.lessons} />
        <SelectField label="Konu" items={filters.topics} />
        <SelectField label="Kazanım" items={filters.outcomes} />
        <SelectField label="Zorluk" items={filters.difficulties} />
      </div>
    </GlassCard>
  );
}
