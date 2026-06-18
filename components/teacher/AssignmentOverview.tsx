import { ClipboardList } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { AssignmentStats, TeacherAssignment } from "@/lib/mock-data";

interface AssignmentOverviewProps {
  stats: AssignmentStats;
  assignments: TeacherAssignment[];
}

const STATUS_STYLES: Record<TeacherAssignment["status"], string> = {
  "Devam Ediyor": "border-accent/20 bg-accent/10 text-accent",
  "Süresi Doldu": "border-brand/20 bg-brand/10 text-brand",
  Tamamlandı: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
};

/**
 * Ödev yönetimi.
 * Özet metrikleri ve güncel ödev listesini durum etiketleriyle gösterir.
 */
export function AssignmentOverview({ stats, assignments }: AssignmentOverviewProps) {
  const summary = [
    { label: "Kontrol Bekleyen", value: stats.pending },
    { label: "Teslim Edilmeyen", value: stats.notSubmitted },
    { label: "Bu Hafta Verilen", value: stats.thisWeek },
  ];

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <ClipboardList size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Ödev Yönetimi</h2>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center"
          >
            <p className="text-2xl font-bold text-content">{item.value}</p>
            <p className="mt-0.5 text-xs text-muted">{item.label}</p>
          </div>
        ))}
      </div>

      <ul className="mt-5 space-y-2.5">
        {assignments.map((assignment) => (
          <li
            key={assignment.id}
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3"
          >
            <span className="rounded bg-navy/40 px-2 py-0.5 text-xs font-semibold text-accent">
              {assignment.classGroup}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-content">
              {assignment.title}
            </span>
            <span className="shrink-0 text-xs text-muted">{assignment.dueDate}</span>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[assignment.status]}`}
            >
              {assignment.status}
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
