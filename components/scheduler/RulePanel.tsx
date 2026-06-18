import { ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SmartRule } from "@/lib/scheduler-mock-data";

interface RulePanelProps {
  rules: SmartRule[];
}

/**
 * Akıllı Kurallar paneli.
 * Programı şekillendiren kısıtları ve aktiflik durumlarını gösterir (mock).
 */
export function RulePanel({ rules }: RulePanelProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <ShieldCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Akıllı Kurallar</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <div
              key={rule.id}
              className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-content">{rule.title}</h3>
                  <span
                    className={[
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      rule.active
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-white/5 text-muted",
                    ].join(" ")}
                  >
                    {rule.active ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {rule.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
