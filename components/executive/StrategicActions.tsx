import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { StrategicAction } from "@/lib/executive-mock-data";

interface StrategicActionsProps {
  actions: StrategicAction[];
}

/**
 * Stratejik Aksiyonlar — rapor ve sunum kısayolları (mock).
 */
export function StrategicActions({ actions }: StrategicActionsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Target size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Stratejik Aksiyonlar</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            href={action.href ?? "/coming-soon"}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white/[0.06]"
          >
            <span className="text-sm font-medium text-content">{action.label}</span>
            <ArrowRight
              size={16}
              className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}
