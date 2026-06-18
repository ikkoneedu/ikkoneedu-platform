import { BarChart3, Crown, Zap, Send } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { CommunicationAnalytics as AnalyticsData } from "@/lib/messages-mock-data";

interface CommunicationAnalyticsProps {
  data: AnalyticsData;
}

/**
 * İletişim Analitiği.
 * Kanal bazlı okunma oranı ve özet metrikler (mock grafik).
 */
export function CommunicationAnalytics({ data }: CommunicationAnalyticsProps) {
  const summary = [
    { id: "most", label: "En Çok Kullanılan Kanal", value: data.mostUsedChannel, icon: Crown },
    { id: "fast", label: "En Hızlı Dönüş", value: data.fastestChannel, icon: Zap },
    { id: "vol", label: "Haftalık Gönderim", value: data.weeklyVolume, icon: Send },
  ];

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">İletişim Analitiği</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kanal okunma oranları */}
        <div>
          <p className="mb-3 text-sm font-medium text-content">Kanal Bazlı Okunma Oranı</p>
          <div className="space-y-3">
            {data.channelReadRates.map((row) => (
              <div key={row.channel}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-content">{row.channel}</span>
                  <span className="font-semibold text-accent">%{row.rate}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                    style={{ width: `${row.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Özet */}
        <div className="grid grid-cols-1 gap-3">
          {summary.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted">{item.label}</p>
                  <p className="text-sm font-semibold text-content">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
