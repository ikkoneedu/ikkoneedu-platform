import { ClipboardList } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { WatchListStudent, WatchPriority } from "@/lib/counseling-mock-data";

interface StudentWatchListProps {
  students: WatchListStudent[];
}

const PRIORITY_STYLES: Record<WatchPriority, string> = {
  Yüksek: "border-brand/20 bg-brand/10 text-brand",
  Orta: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Düşük: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
};

/**
 * Öğrenci Takip Listesi.
 * Masaüstünde tablo, mobilde kart düzeni.
 */
export function StudentWatchList({ students }: StudentWatchListProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <ClipboardList size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Öğrenci Takip Listesi</h2>
      </div>

      <div className="hidden grid-cols-[1.5fr_0.8fr_1fr_1.4fr_0.9fr] gap-4 border-b border-white/10 px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
        <span>Öğrenci</span>
        <span>Sınıf</span>
        <span>Son Görüşme</span>
        <span>Durum</span>
        <span>Öncelik</span>
      </div>

      <ul className="divide-y divide-white/5">
        {students.map((student) => (
          <li
            key={student.id}
            className="flex flex-col gap-2 px-2 py-3 lg:grid lg:grid-cols-[1.5fr_0.8fr_1fr_1.4fr_0.9fr] lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold text-content">{student.name}</span>
            <span className="text-sm text-muted">{student.grade}</span>
            <span className="text-sm text-muted">{student.lastSession}</span>
            <span className="text-sm text-muted">{student.status}</span>
            <span>
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[student.priority]}`}
              >
                {student.priority}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
