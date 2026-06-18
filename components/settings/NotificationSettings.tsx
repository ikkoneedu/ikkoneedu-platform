import { Bell } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Toggle } from "@/components/settings/Toggle";
import type { NotificationChannel } from "@/lib/settings-mock-data";

interface NotificationSettingsProps {
  channels: NotificationChannel[];
}

/**
 * Bildirim Ayarları — Bildirim Merkezi.
 * Her kanal için aktif/pasif anahtarı, günlük limit ve kullanım (mock).
 */
export function NotificationSettings({ channels }: NotificationSettingsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Bell size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bildirim Merkezi</h2>
      </div>

      <ul className="space-y-3">
        {channels.map((channel) => (
          <li
            key={channel.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-content">{channel.name}</p>
              <p className="mt-0.5 text-xs text-muted">
                Limit: {channel.limit} · Kullanım: {channel.used}
              </p>
            </div>
            <Toggle defaultOn={channel.enabled} label={channel.name} />
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
