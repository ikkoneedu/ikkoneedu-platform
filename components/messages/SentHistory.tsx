import { History } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SentMessage } from "@/lib/messages-mock-data";

interface SentHistoryProps {
  messages: SentMessage[];
}

const STATUS_STYLES: Record<SentMessage["status"], string> = {
  Gönderildi: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Zamanlandı: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Taslak: "border-white/10 bg-white/5 text-muted",
};

/**
 * Gönderim Geçmişi tablosu.
 * Masaüstünde tablo, mobilde kart düzeni.
 */
export function SentHistory({ messages }: SentHistoryProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <History size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Gönderim Geçmişi</h2>
      </div>

      <div className="hidden grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-white/10 px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
        <span>Başlık</span>
        <span>Kanal</span>
        <span>Alıcı Grubu</span>
        <span>Tarih</span>
        <span>Okunma</span>
        <span>Durum</span>
      </div>

      <ul className="divide-y divide-white/5">
        {messages.map((message) => (
          <li
            key={message.id}
            className="flex flex-col gap-2 px-2 py-3 lg:grid lg:grid-cols-[2fr_1fr_1.5fr_1fr_1fr_1fr] lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold text-content">{message.title}</span>
            <span className="text-sm text-muted">{message.channel}</span>
            <span className="text-sm text-muted">{message.audience}</span>
            <span className="text-sm text-muted">{message.date}</span>
            <span className="text-sm text-muted">{message.readRate}</span>
            <span>
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[message.status]}`}>
                {message.status}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
