import { Receipt } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import type { Payment, PaymentStatus } from "@/lib/finance-mock-data";

interface PaymentTableProps {
  rows: Payment[];
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  Ödendi: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Bekliyor: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Gecikti: "border-brand/30 bg-brand/10 text-brand",
};

const columns = ["Sınıf", "Tutar", "Tarih", "Durum"];

/**
 * Tahsilat tablosu — veli/öğrenci bazında ödeme durumu.
 * Mobilde yatay scroll ile görüntülenir.
 */
export function PaymentTable({ rows }: PaymentTableProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Receipt size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Tahsilat Tablosu</h2>
        <DataExportButtons
          className="ml-auto"
          filename="tahsilat-tablosu"
          title="Tahsilat Tablosu"
          columns={[
            { key: "parent", label: "Veli" },
            { key: "student", label: "Öğrenci" },
            { key: "grade", label: "Sınıf" },
            { key: "amount", label: "Tutar" },
            { key: "date", label: "Tarih" },
            { key: "status", label: "Durum" },
          ]}
          rows={rows as unknown as Record<string, unknown>[]}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                Veli / Öğrenci
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
                <td className="py-3 pr-4">
                  <p className="text-sm font-semibold text-content">{row.parent}</p>
                  <p className="text-xs text-muted">{row.student}</p>
                </td>
                <td className="px-3 py-3 text-sm text-muted">{row.grade}</td>
                <td className="px-3 py-3 text-sm font-medium text-content">{row.amount}</td>
                <td className="px-3 py-3 text-sm text-muted">{row.date}</td>
                <td className="px-3 py-3">
                  <span
                    className={[
                      "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
                      STATUS_STYLES[row.status],
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
