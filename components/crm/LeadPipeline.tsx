import { Kanban, GraduationCap, MapPin, UserCheck } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { PipelineColumn } from "@/lib/crm-mock-data";

interface LeadPipelineProps {
  columns: PipelineColumn[];
}

/**
 * Lead Pipeline — kanban görünümü.
 * Mobilde yatay scroll ile görüntülenir.
 */
export function LeadPipeline({ columns }: LeadPipelineProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Kanban size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Lead Pipeline</h2>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-[960px] gap-4">
          {columns.map((column) => (
            <div key={column.id} className="flex w-[160px] flex-1 flex-col">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-content">{column.title}</span>
                <span className="rounded-full bg-overlay/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted">
                  {column.leads.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {column.leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-overlay/10 bg-overlay/[0.04] p-3 transition-colors hover:border-accent/30"
                  >
                    <p className="text-sm font-semibold text-content">{lead.parentName}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                      <GraduationCap size={12} aria-hidden="true" />
                      {lead.childAge} · {lead.level}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                      <MapPin size={12} aria-hidden="true" />
                      {lead.campus}
                    </p>
                    <p className="mt-2 flex items-center gap-1 border-t border-overlay/5 pt-2 text-[11px] text-accent">
                      <UserCheck size={12} aria-hidden="true" />
                      {lead.advisor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
