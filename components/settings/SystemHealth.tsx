import { Activity } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { HealthRow } from "@/lib/settings-mock-data";

interface SystemHealthProps {
  rows: HealthRow[];
}

/**
 * Sistem Sağlığı.
 * Uptime, API, AI servisleri, veritabanı, deploy ve build durumu (mock).
 */
export function SystemHealth({ rows }: SystemHealthProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Activity size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Sistem Sağlığı</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">{row.label}</span>
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  row.ok ? "bg-emerald-400" : "bg-brand",
                ].join(" ")}
              />
            </div>
            <p className="mt-2 text-lg font-bold text-content">{row.value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
