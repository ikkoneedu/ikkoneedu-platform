import { Building2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { CampusRow } from "@/lib/executive-mock-data";

interface CampusComparisonProps {
  rows: CampusRow[];
}

const columns = ["Öğrenci", "Başvuru", "Memnuniyet", "AI Kullanımı", "Gelir", "Durum"];

/**
 * Kampüs Karşılaştırması tablosu.
 * Mobilde yatay scroll ile görüntülenir.
 */
export function CampusComparison({ rows }: CampusComparisonProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Building2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Kampüs Karşılaştırması</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Kampüs
              </th>
              {columns.map((column) => (
                <th key={column} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/5">
                <td className="py-3 pr-4 text-sm font-semibold text-content">{row.name}</td>
                <td className="px-3 py-3 text-sm text-muted">{row.students}</td>
                <td className="px-3 py-3 text-sm text-muted">{row.applications}</td>
                <td className="px-3 py-3 text-sm text-muted">{row.satisfaction}</td>
                <td className="px-3 py-3 text-sm text-muted">{row.aiUsage}</td>
                <td className="px-3 py-3 text-sm text-muted">{row.revenue}</td>
                <td className="px-3 py-3">
                  <span
                    className={[
                      "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      row.status === "Aktif"
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                        : "border-amber-400/20 bg-amber-400/10 text-amber-400",
                    ].join(" ")}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
