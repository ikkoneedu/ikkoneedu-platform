import { BrainCircuit } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SelectField } from "@/components/shared/SelectField";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { AiProvider } from "@/lib/settings-mock-data";

interface AiModelSettingsProps {
  providers: AiProvider[];
  config: {
    defaultModels: string[];
    dailyLimits: string[];
    schoolLimits: string[];
    safetyFilters: string[];
  };
}

const STATUS_STYLES: Record<AiProvider["status"], string> = {
  Hazır: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  "Test Modu": "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Pasif: "border-white/10 bg-white/5 text-muted",
};

/**
 * Yapay Zeka Ayarları — AI Model Yönetimi.
 * Sağlayıcı kartları ve genel AI yapılandırması (gerçek API entegrasyonu yok).
 */
export function AiModelSettings({ providers, config }: AiModelSettingsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <BrainCircuit size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">AI Model Yönetimi</h2>
      </div>

      {/* Sağlayıcı kartları */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {providers.map((provider) => {
          const Icon = provider.icon;
          return (
            <div
              key={provider.id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/20 bg-navy/50 text-accent">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[provider.status]}`}>
                  {provider.status}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-semibold text-content">{provider.name}</h3>
              <dl className="mt-2 space-y-1 text-xs text-muted">
                <div className="flex justify-between">
                  <dt>Kullanım</dt>
                  <dd className="text-content">{provider.usage}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Maliyet</dt>
                  <dd className="text-content">{provider.cost}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Model</dt>
                  <dd className="font-mono text-content">{provider.model}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      {/* Genel yapılandırma */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Varsayılan AI Modeli" items={config.defaultModels} />
        <SelectField label="Günlük Sorgu Limiti" items={config.dailyLimits} />
        <SelectField label="Okul Bazlı AI Limiti" items={config.schoolLimits} />
        <SelectField label="AI Güvenlik Filtresi" items={config.safetyFilters} />
      </div>

      <PrimaryButton size="lg" className="mt-6 w-full sm:w-fit">
        AI Ayarlarını Kaydet
      </PrimaryButton>
    </GlassCard>
  );
}
