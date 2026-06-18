import { List } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { NotificationRecord, NotificationStatus } from "@/lib/notifications-mock-data";

interface NotificationListProps {
  notifications: NotificationRecord[];
}

const STATUS_STYLES: Record<NotificationStatus, string> = {
  Gönderildi: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Zamanlandı: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Taslak: "border-white/10 bg-white/5 text-muted",
};

/**
 * Bildirim Listesi tablosu.
 * Masaüstünde tablo, mobilde kart düzeni.
 */
export function NotificationList({ notifications }: NotificationListProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <List size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Bildirim Listesi</h2>
      </div>

      <div className="hidden grid-cols-[2fr_1fr_1.4fr_1.2fr_0.8fr_0.8fr_1fr] gap-4 border-b border-white/10 px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
        <span>Başlık</span>
        <span>Tür</span>
        <span>Alıcı Grubu</span>
        <span>Kanal</span>
        <span>Okunma</span>
        <span>Tarih</span>
        <span>Durum</span>
      </div>

      <ul className="divide-y divide-white/5">
        {notifications.map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 px-2 py-3 lg:grid lg:grid-cols-[2fr_1fr_1.4fr_1.2fr_0.8fr_0.8fr_1fr] lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold text-content">{item.title}</span>
            <span className="text-sm text-muted">{item.type}</span>
            <span className="text-sm text-muted">{item.audience}</span>
            <span className="text-sm text-muted">{item.channel}</span>
            <span className="text-sm text-muted">{item.readRate}</span>
            <span className="text-sm text-muted">{item.date}</span>
            <span>
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                {item.status}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
