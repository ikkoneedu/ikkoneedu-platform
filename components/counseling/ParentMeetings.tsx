import { Handshake } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ParentMeeting, ParentMeetingStatus } from "@/lib/counseling-mock-data";

interface ParentMeetingsProps {
  meetings: ParentMeeting[];
}

const STATUS_STYLES: Record<ParentMeetingStatus, string> = {
  Planlandı: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Tamamlandı: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Ertelendi: "border-brand/20 bg-brand/10 text-brand",
};

/**
 * Veli Görüşmeleri listesi.
 */
export function ParentMeetings({ meetings }: ParentMeetingsProps) {
  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <Handshake size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Veli Görüşmeleri</h2>
      </div>

      <ul className="flex flex-1 flex-col gap-3">
        {meetings.map((meeting) => (
          <li
            key={meeting.id}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-content">{meeting.parent}</span>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[meeting.status]}`}
              >
                {meeting.status}
              </span>
            </div>
            <p className="text-sm text-muted">{meeting.topic}</p>
            <p className="mt-2 text-xs text-muted/80">{meeting.date}</p>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
