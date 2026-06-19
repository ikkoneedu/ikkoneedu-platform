import { GlassCard } from "@/components/shared/GlassCard";
import { dashboardMetrics } from "@/lib/scholarship-exam-mock-data";

/**
 * Bursluluk sınavı genel durum panosu.
 * 9 metrik kartını duyarlı bir ızgarada gösterir.
 */
export function ScholarshipDashboard() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
      {dashboardMetrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <GlassCard key={metric.id} tone="navy" interactive className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-muted">{metric.label}</p>
                <p className="mt-2 text-xl font-bold tracking-tight text-content sm:text-2xl">
                  {metric.value}
                </p>
              </div>
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
