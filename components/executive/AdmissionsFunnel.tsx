import { Filter } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { FunnelStage, AdmissionsBreakdown } from "@/lib/executive-mock-data";

interface AdmissionsFunnelProps {
  funnel: FunnelStage[];
  breakdown: AdmissionsBreakdown[];
}

/**
 * Kayıt ve Aday Veli Analitiği — funnel + dağılım kartları.
 */
export function AdmissionsFunnel({ funnel, breakdown }: AdmissionsFunnelProps) {
  const max = Math.max(...funnel.map((stage) => stage.value));

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Filter size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Kayıt ve Aday Veli Analitiği</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <div className="space-y-3">
          {funnel.map((stage, index) => {
            const width = Math.round((stage.value / max) * 100);
            const prev = index > 0 ? funnel[index - 1].value : stage.value;
            const rate = Math.round((stage.value / prev) * 100);
            return (
              <div key={stage.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-content">{stage.label}</span>
                  <span className="text-muted">
                    {stage.value.toLocaleString("tr-TR")}
                    {index > 0 && <span className="ml-2 text-xs text-accent">%{rate}</span>}
                  </span>
                </div>
                <div className="h-7 overflow-hidden rounded-lg bg-overlay/[0.04]">
                  <div
                    className="flex h-full items-center rounded-lg bg-gradient-to-r from-accent/40 to-accent"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dağılım */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {breakdown.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-overlay/5 bg-overlay/[0.03] px-4 py-2.5"
            >
              <span className="text-sm text-muted">{item.label}</span>
              <span className="text-sm font-bold text-content">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
