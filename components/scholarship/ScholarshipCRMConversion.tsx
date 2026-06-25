import { Filter } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { crmFunnel, crmMetrics } from "@/lib/scholarship-exam-mock-data";

/**
 * CRM Dönüşüm Takibi.
 * Başvurudan kayıta funnel ve dönüşüm metrikleri.
 */
export function ScholarshipCRMConversion() {
  const max = Math.max(...crmFunnel.map((s) => s.value));

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Filter size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">CRM Dönüşüm Takibi</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Funnel */}
        <div className="space-y-3">
          {crmFunnel.map((stage, index) => {
            const width = Math.round((stage.value / max) * 100);
            const prev = index > 0 ? crmFunnel[index - 1].value : stage.value;
            const rate = Math.round((stage.value / prev) * 100);
            return (
              <div key={stage.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-content">{stage.label}</span>
                  <span className="text-muted">
                    {stage.value.toLocaleString("tr-TR")}
                    {index > 0 && (
                      <span className="ml-2 text-xs font-semibold text-accent">%{rate}</span>
                    )}
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

        {/* Metrikler */}
        <div className="grid grid-cols-2 gap-3 self-start">
          {crmMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                className="rounded-2xl border border-overlay/10 bg-overlay/[0.03] p-4"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <p className="mt-3 text-xs text-muted">{metric.label}</p>
                <p className="mt-1 text-xl font-bold text-content">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
