import { Cpu, Building2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SaasAiUsage } from "@/lib/saas-mock-data";

interface AiUsageAnalyticsProps {
  usage: SaasAiUsage;
}

/**
 * AI Kullanım Analitiği.
 * Toplam sorgu, en aktif okullar ve en çok kullanılan modüller (grafik).
 */
export function AiUsageAnalytics({ usage }: AiUsageAnalyticsProps) {
  const max = Math.max(...usage.topModules.map((module) => module.value));

  return (
    <GlassCard tone="navy">
      <div className="mb-6 flex items-center gap-2">
        <Cpu size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Kullanım Analitiği</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sol: toplam sorgu + en aktif okullar */}
        <div>
          <div className="rounded-xl border border-accent/20 bg-navy/40 p-4">
            <p className="text-sm text-muted">Toplam Sorgu</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-content">
              {usage.totalQueries}
            </p>
          </div>

          <h3 className="mb-3 mt-5 text-sm font-semibold text-content">
            En Aktif Okullar
          </h3>
          <ul className="space-y-2.5">
            {usage.topSchools.map((school) => (
              <li
                key={school.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/50 text-accent">
                  <Building2 size={15} aria-hidden="true" />
                </span>
                <span className="flex-1 text-sm text-content">{school.name}</span>
                <span className="text-sm font-semibold text-muted">{school.queries}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sağ: en çok kullanılan modüller (yatay bar) */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-content">
            En Çok Kullanılan Modüller
          </h3>
          <div className="space-y-4">
            {usage.topModules.map((module) => (
              <div key={module.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-content">{module.name}</span>
                  <span className="font-semibold text-accent">
                    {module.value.toLocaleString("tr-TR")}
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                    style={{ width: `${(module.value / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
