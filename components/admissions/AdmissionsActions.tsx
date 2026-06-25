import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { AdmissionsAction } from "@/lib/admissions-ai-mock-data";

interface AdmissionsActionsProps {
  actions: AdmissionsAction[];
}

/**
 * Hızlı Aksiyonlar — lead, randevu, mesaj ve rapor kısayolları (mock).
 */
export function AdmissionsActions({ actions }: AdmissionsActionsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Zap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Hızlı Aksiyonlar</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href ?? "/coming-soon"}
              className="group flex items-center gap-3 rounded-2xl border border-overlay/10 bg-overlay/[0.04] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:bg-overlay/[0.06]"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="flex-1 text-sm font-medium text-content">{action.label}</span>
              <ArrowRight
                size={15}
                className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </GlassCard>
  );
}
