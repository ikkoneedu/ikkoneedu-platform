import { ShieldAlert, ListChecks } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { RiskFactor, RiskLevel } from "@/lib/counseling-mock-data";

interface RiskAnalysisProps {
  factors: RiskFactor[];
  plan: string[];
}

const LEVEL_STYLES: Record<RiskLevel, string> = {
  Yüksek: "border-brand/20 bg-brand/10 text-brand",
  Orta: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Düşük: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
};

const BAR_STYLES: Record<RiskLevel, string> = {
  Yüksek: "from-brand/60 to-brand",
  Orta: "from-amber-400/60 to-amber-400",
  Düşük: "from-emerald-400/60 to-emerald-400",
};

/**
 * Risk Analizi kartı: göstergeler (ilerleme çubukları + rozetler) ve takip planı.
 */
export function RiskAnalysis({ factors, plan }: RiskAnalysisProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <ShieldAlert size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Risk Analizi</h2>
      </div>

      <div className="flex flex-col gap-4">
        {factors.map((factor) => {
          const Icon = factor.icon;
          return (
            <div key={factor.id}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-content">
                  <Icon size={15} className="text-muted" aria-hidden="true" />
                  {factor.label}
                </span>
                <span
                  className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${LEVEL_STYLES[factor.level]}`}
                >
                  {factor.level}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${BAR_STYLES[factor.level]}`}
                  style={{ width: `${factor.percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks size={16} className="text-accent" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-content">Takip Planı</h3>
        </div>
        <ul className="flex flex-col gap-2">
          {plan.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}
