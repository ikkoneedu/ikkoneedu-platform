import { Users } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { proctors } from "@/lib/scholarship-exam-mock-data";

const STATUS_STYLES: Record<string, string> = {
  Atandı: "bg-emerald-400/10 text-emerald-300",
  Bekliyor: "bg-amber-400/10 text-amber-300",
};

const COLUMNS = ["Salon", "Gözetmen", "Yardımcı", "Öğrenci Sayısı", "Durum"];

/**
 * Gözetmen Atama tablosu.
 * Salon bazlı gözetmen ve yardımcı atama durumları.
 */
export function ProctorAssignment() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Gözetmen Atama</h2>
        </div>
        <DataExportButtons
          filename="gozetmen-atama"
          title="Gözetmen Atama"
          columns={[
            { key: "room", label: "Salon" },
            { key: "proctor", label: "Gözetmen" },
            { key: "assistant", label: "Yardımcı" },
            { key: "studentCount", label: "Öğrenci Sayısı" },
            { key: "status", label: "Durum" },
          ]}
          rows={proctors as unknown as Record<string, unknown>[]}
        />
      </div>

      <div className="-mx-6 overflow-x-auto px-6">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-overlay/10 text-xs uppercase tracking-wide text-muted">
              {COLUMNS.map((col) => (
                <th key={col} className="whitespace-nowrap px-3 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proctors.map((row) => (
              <tr
                key={row.id}
                className="border-b border-overlay/5 transition-colors hover:bg-overlay/[0.03]"
              >
                <td className="whitespace-nowrap px-3 py-3 font-medium text-content">
                  {row.room}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-content">{row.proctor}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">{row.assistant}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">{row.studentCount}</td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}
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
