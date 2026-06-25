"use client";

import { Check, Minus } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useT } from "@/components/i18n/LocaleProvider";
import type { ComparisonRow, ComparisonValue } from "@/lib/pricing-data";

interface ComparisonTableProps {
  columns: string[];
  rows: ComparisonRow[];
}

function Cell({ value }: { value: ComparisonValue }) {
  const t = useT();
  if (typeof value === "boolean") {
    return value ? (
      <Check size={18} className="mx-auto text-emerald-400" aria-label={t("pricing.comparison.yes")} />
    ) : (
      <Minus size={18} className="mx-auto text-muted/50" aria-label={t("pricing.comparison.no")} />
    );
  }
  // Only "Sınırsız" is a translatable cell value; prices and numbers
  // (₺9.900, 500, 2.500, ...) are locale-neutral and rendered verbatim.
  const key = `pricing.comparison.cell.${value}`;
  const translated = t(key);
  const text = translated === key ? value : translated;
  return <span className="text-sm font-medium text-content">{text}</span>;
}

/**
 * Paket karşılaştırma tablosu.
 * Professional sütunu aksan vurgusuyla öne çıkarılır.
 * Mobilde yatay scroll ile görüntülenir.
 */
export function ComparisonTable({ columns, rows }: ComparisonTableProps) {
  const t = useT();
  return (
    <GlassCard tone="navy">
      <h2 className="mb-5 text-lg font-semibold text-content">{t("pricing.comparison.title")}</h2>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-overlay/10">
              <th className="py-3 pr-4 text-left text-sm font-semibold text-muted">
                {t("pricing.comparison.feature")}
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  className={[
                    "px-4 py-3 text-center text-sm font-bold",
                    column === "Professional" ? "text-accent" : "text-content",
                  ].join(" ")}
                >
                  {t(`pricing.comparison.column.${column.toLowerCase()}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-overlay/5">
                <td className="py-3 pr-4 text-left text-sm text-content">
                  {t(`pricing.comparison.row.${row.label}`)}
                </td>
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
