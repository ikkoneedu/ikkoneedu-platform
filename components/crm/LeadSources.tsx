import { PieChart } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { LeadSource } from "@/lib/crm-mock-data";

interface LeadSourcesProps {
  sources: LeadSource[];
}

/**
 * Lead Kaynakları — pay ve dönüşüm oranları (mock grafik).
 */
export function LeadSources({ sources }: LeadSourcesProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <PieChart size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Lead Kaynakları</h2>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4">
        {sources.map((source) => {
          const Icon = source.icon;
          return (
            <div key={source.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-content">
                  <Icon size={15} className="text-accent" aria-hidden="true" />
                  {source.name}
                </span>
                <span className="text-xs text-muted">
                  %{source.share} pay ·{" "}
                  <span className="font-semibold text-emerald-400">%{source.conversion} dönüşüm</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                  style={{ width: `${source.share}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
