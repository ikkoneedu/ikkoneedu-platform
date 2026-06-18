import { Lock } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Toggle } from "@/components/settings/Toggle";
import type { SecurityOption } from "@/lib/settings-mock-data";

interface SecuritySettingsProps {
  options: SecurityOption[];
}

/**
 * Güvenlik Ayarları — Güvenlik ve Erişim.
 * Her özellik için mock açma/kapama anahtarı.
 */
export function SecuritySettings({ options }: SecuritySettingsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Lock size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Güvenlik ve Erişim</h2>
      </div>

      <ul className="divide-y divide-white/5">
        {options.map((option) => (
          <li key={option.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-content">{option.title}</p>
              <p className="mt-0.5 text-xs text-muted">{option.description}</p>
            </div>
            <Toggle defaultOn={option.enabled} label={option.title} />
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
