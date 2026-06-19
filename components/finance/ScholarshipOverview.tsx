import { GraduationCap } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { Scholarship } from "@/lib/finance-mock-data";

interface ScholarshipOverviewProps {
  items: Scholarship[];
}

/**
 * Burs ve indirim yönetimi — tür bazında öğrenci sayısı, toplam tutar ve oran.
 */
export function ScholarshipOverview({ items }: ScholarshipOverviewProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <GraduationCap size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Burs ve İndirim Yönetimi</h2>
      </div>

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-content">{item.type}</p>
              <p className="text-xs text-muted">{item.students} öğrenci</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-bold text-content">{item.totalAmount}</p>
              <span className="mt-0.5 inline-block rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                {item.rate} oran
              </span>
            </div>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
