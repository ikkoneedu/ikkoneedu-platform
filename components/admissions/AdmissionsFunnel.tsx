import { Filter } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { AdmissionsFunnelStage } from "@/lib/admissions-ai-mock-data";

interface AdmissionsFunnelProps {
  stages: AdmissionsFunnelStage[];
}

/**
 * Kayıt Funnel Analitiği.
 * Aşamalar ve bir önceki aşamaya göre dönüşüm oranları.
 */
export function AdmissionsFunnel({ stages }: AdmissionsFunnelProps) {
  const max = Math.max(...stages.map((s) => s.value));

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Filter size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Kayıt Funnel Analitiği</h2>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const width = Math.round((stage.value / max) * 100);
          const prev = index > 0 ? stages[index - 1].value : stage.value;
          const rate = Math.round((stage.value / prev) * 100);
          return (
            <div key={stage.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-content">{stage.label}</span>
                <span className="text-muted">
                  {stage.value.toLocaleString("tr-TR")}
                  {index > 0 && <span className="ml-2 text-xs font-semibold text-accent">%{rate}</span>}
                </span>
              </div>
              <div className="h-7 overflow-hidden rounded-lg bg-overlay/[0.04]">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-accent/40 to-accent"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
