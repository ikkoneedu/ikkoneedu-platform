import { Sparkles, TrendingUp, Wallet, Percent } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { CrmForecast } from "@/lib/crm-mock-data";

interface RevenueForecastProps {
  forecast: CrmForecast;
}

/**
 * Kayıt Tahmini — AI Kayıt Tahmini (mock).
 */
export function RevenueForecast({ forecast }: RevenueForecastProps) {
  const items = [
    { id: "reg", label: "Bu Ay Beklenen Kayıt", value: forecast.registrations, icon: TrendingUp },
    { id: "rev", label: "Beklenen Gelir", value: forecast.expectedRevenue, icon: Wallet },
    { id: "conv", label: "Tahmini Dönüşüm", value: forecast.conversion, icon: Percent },
  ];

  return (
    <GlassCard className="ai-gradient border-accent/20">
      <div className="mb-5 flex items-center gap-2 text-accent">
        <Sparkles size={18} aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Kayıt Tahmini</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-background/30 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-navy/50 text-accent">
                <Icon size={20} aria-hidden="true" />
              </span>
              <p className="mt-4 text-2xl font-bold tracking-tight text-content">{item.value}</p>
              <p className="mt-0.5 text-xs text-muted">{item.label}</p>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
