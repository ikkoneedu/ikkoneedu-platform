import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { ExportAction } from "@/lib/scheduler-mock-data";

interface ScheduleExportActionsProps {
  actions: ExportAction[];
}

/**
 * Kaydet / Dışa Aktar alanı.
 * Tüm eylemler şimdilik mock'tur (gerçek kayıt/PDF/Excel yoktur).
 */
export function ScheduleExportActions({ actions }: ScheduleExportActionsProps) {
  return (
    <GlassCard tone="navy">
      <h2 className="mb-4 text-lg font-semibold text-content">Kaydet ve Dışa Aktar</h2>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <PrimaryButton
              key={action.id}
              variant={action.primary ? "primary" : "secondary"}
              size="md"
              className="flex-1 sm:flex-none"
            >
              <Icon size={16} aria-hidden="true" />
              {action.label}
            </PrimaryButton>
          );
        })}
      </div>
    </GlassCard>
  );
}
