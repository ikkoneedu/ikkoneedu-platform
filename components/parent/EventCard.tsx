import { Clock, MapPin } from "lucide-react";
import type { ParentEvent } from "@/lib/mock-data";

interface EventCardProps {
  event: ParentEvent;
}

const STATUS_STYLES: Record<ParentEvent["status"], string> = {
  Katılıyor: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Bekliyor: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Katılmıyor: "border-white/10 bg-white/5 text-muted",
};

/**
 * Etkinlik kartı.
 * Tarih, saat, yer ve katılım durumunu gösterir.
 */
export function EventCard({ event }: EventCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <span className="flex h-12 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-navy/50 text-accent">
        <span className="text-xs font-semibold">{event.date.split(" ")[0]}</span>
        <span className="text-[10px] uppercase text-muted">
          {event.date.split(" ")[1]}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-content">{event.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Clock size={12} aria-hidden="true" />
            {event.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} aria-hidden="true" />
            {event.place}
          </span>
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[event.status]}`}
      >
        {event.status}
      </span>
    </div>
  );
}
