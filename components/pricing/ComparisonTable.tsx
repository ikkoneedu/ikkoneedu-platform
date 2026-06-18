import { Check, Minus } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ComparisonRow, ComparisonValue } from "@/lib/pricing-data";

interface ComparisonTableProps {
  columns: string[];
  rows: ComparisonRow[];
}

function Cell({ value }: { value: ComparisonValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={18} className="mx-auto text-emerald-400" aria-label="Var" />
    ) : (
      <Minus size={18} className="mx-auto text-muted/50" aria-label="Yok" />
    );
  }
  return <span className="text-sm font-medium text-content">{value}</span>;
}

/**
 * Paket karşılaştırma tablosu.
 * Professional sütunu aksan vurgusuyla öne çıkarılır.
 * Mobilde yatay scroll ile görüntülenir.
 */
export function ComparisonTable({ columns, rows }: ComparisonTableProps) {
  return (
    <GlassCard tone="navy">
      <h2 className="mb-5 text-lg font-semibold text-content">Paket Karşılaştırması</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-left text-sm font-semibold text-muted">
                Özellik
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  className={[
                    "px-4 py-3 text-center text-sm font-bold",
                    column === "Professional" ? "text-accent" : "text-content",
                  ].join(" ")}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-white/5">
                <td className="py-3 pr-4 text-left text-sm text-content">{row.label}</td>
                {row.values.map((value, index) => (
                  <td
                    key={index}
                    className={[
                      "px-4 py-3 text-center",
                      index === 1 ? "bg-accent/[0.04]" : "",
                    ].join(" ")}
                  >
                    <Cell value={value} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
