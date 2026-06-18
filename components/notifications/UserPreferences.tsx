import { SlidersHorizontal } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Toggle } from "@/components/settings/Toggle";
import type { UserPreference } from "@/lib/notifications-mock-data";

interface UserPreferencesProps {
  preferences: UserPreference[];
}

/**
 * Kullanıcı Bildirim Tercihleri.
 * Her tür için mock açma/kapama anahtarı.
 */
export function UserPreferences({ preferences }: UserPreferencesProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-1 flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Kullanıcı Bildirim Tercihleri</h2>
      </div>
      <p className="mb-5 text-sm text-muted">
        Kullanıcılar hangi bildirimleri almak istiyor?
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {preferences.map((pref) => {
          const Icon = pref.icon;
          return (
            <div
              key={pref.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
            >
              <span className="flex items-center gap-2.5 text-sm text-content">
                <Icon size={16} className="text-accent" aria-hidden="true" />
                {pref.label}
              </span>
              <Toggle defaultOn={pref.enabled} label={pref.label} />
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
