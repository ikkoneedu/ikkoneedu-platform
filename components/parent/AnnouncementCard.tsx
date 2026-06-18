import { GlassCard } from "@/components/shared/GlassCard";
import type { ParentAnnouncement } from "@/lib/mock-data";

interface AnnouncementCardProps {
  announcement: ParentAnnouncement;
}

/**
 * Duyuru kartı.
 * Başlık, kısa açıklama, tarih ve kategori etiketi gösterir.
 */
export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <GlassCard interactive className="p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-content">
          {announcement.title}
        </h3>
        <span className="shrink-0 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {announcement.category}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {announcement.description}
      </p>
      <p className="mt-3 text-xs text-muted/70">{announcement.date}</p>
    </GlassCard>
  );
}
