import { Download } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { ExamExportAction } from "@/lib/exam-mock-data";

interface ExportCenterProps {
  actions: ExamExportAction[];
}

/**
 * Dışa Aktarma Merkezi.
 * PDF/Word/Forms/LMS aktarımları şimdilik mock'tur (gerçek üretim yoktur).
 */
export function ExportCenter({ actions }: ExportCenterProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Download size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Dışa Aktarma Merkezi</h2>
      </div>
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
