import { Plug } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { Integration } from "@/lib/settings-mock-data";

interface IntegrationSettingsProps {
  integrations: Integration[];
}

/**
 * Entegrasyon Ayarları — Entegrasyonlar.
 * Her servis için bağlantı durumu, son kontrol ve ayarla butonu (mock).
 */
export function IntegrationSettings({ integrations }: IntegrationSettingsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Plug size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Entegrasyonlar</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          const connected = integration.status === "Bağlı";
          return (
            <div
              key={integration.id}
              className="flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-navy/40 text-content">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    connected ? "bg-emerald-400" : "bg-white/20",
                  ].join(" ")}
                  aria-label={integration.status}
                />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-content">{integration.name}</h3>
              <p className="mt-0.5 text-xs text-muted">
                {integration.status} · {integration.lastCheck}
              </p>
              <PrimaryButton variant="secondary" size="sm" className="mt-3 w-full">
                Ayarla
              </PrimaryButton>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
