import { Activity } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { HealthMetric } from "@/lib/saas-mock-data";

interface PlatformHealthProps {
  metrics: HealthMetric[];
}

/**
 * Platform Sağlığı.
 * Sunucu, API, AI servisleri ve veritabanı durumu (mock).
 */
export function PlatformHealth({ metrics }: PlatformHealthProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2 text-content">
        <Activity size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Platform Sağlığı</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <GlassCard key={metric.id} tone="navy" className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-accent">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    metric.ok ? "bg-emerald-400" : "bg-brand",
                  ].join(" ")}
                />
              </div>
              <p className="mt-4 text-lg font-bold text-content">{metric.value}</p>
              <p className="mt-0.5 text-xs text-muted">{metric.label}</p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
