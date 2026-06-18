import { BarChart3, Smartphone, Monitor, TrendingUp, TrendingDown } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { NotificationAnalytics as AnalyticsData } from "@/lib/notifications-mock-data";

interface NotificationAnalyticsProps {
  data: AnalyticsData;
}

/**
 * Bildirim Analitiği.
 * Kanal başarı oranı, günlük gönderim, en çok/en az etkileşim ve cihaz dağılımı.
 */
export function NotificationAnalytics({ data }: NotificationAnalyticsProps) {
  const maxVolume = Math.max(...data.dailyVolume.map((d) => d.value));

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <BarChart3 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bildirim Analitiği</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Kanal başarı oranı */}
        <div>
          <p className="mb-3 text-sm font-medium text-content">Kanal Bazlı Başarı Oranı</p>
          <div className="space-y-3">
            {data.channelSuccess.map((row) => (
              <div key={row.channel}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-content">{row.channel}</span>
                  <span className="font-semibold text-accent">%{row.rate}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent" style={{ width: `${row.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Günlük gönderim */}
        <div>
          <p className="mb-3 text-sm font-medium text-content">Günlük Gönderim Sayısı</p>
          <div className="flex h-32 items-end justify-between gap-2">
            {data.dailyVolume.map((day, index) => (
              <div key={day.label} className="group flex h-full flex-1 flex-col items-center justify-end">
                <div
                  className={[
                    "w-full rounded-t-md transition-colors",
                    index === data.dailyVolume.length - 3 ? "bg-accent" : "bg-accent/25 group-hover:bg-accent/45",
                  ].join(" ")}
                  style={{ height: `${(day.value / maxVolume) * 100}%` }}
                />
                <span className="mt-1 text-[10px] text-muted">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Özet metrikler */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <TrendingUp size={18} className="text-emerald-400" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted">En Çok Okunan</p>
            <p className="text-sm font-semibold text-content">{data.mostRead}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <TrendingDown size={18} className="text-brand" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted">En Düşük Etkileşim</p>
            <p className="text-sm font-semibold text-content">{data.lowestEngagement}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
          <span className="flex items-center gap-1 text-accent">
            <Smartphone size={16} aria-hidden="true" />
            <Monitor size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs text-muted">Mobil / Web</p>
            <p className="text-sm font-semibold text-content">
              %{data.deviceSplit.mobile} / %{data.deviceSplit.web}
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
