import { FileText } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SelectField } from "@/components/shared/SelectField";
import {
  applications,
  applicationStatuses,
  type ApplicationStatus,
} from "@/lib/scholarship-exam-mock-data";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Bekliyor: "bg-amber-400/10 text-amber-300",
  Onaylandı: "bg-emerald-400/10 text-emerald-300",
  "Eksik Bilgi": "bg-amber-400/10 text-amber-300",
  "Oturum Atandı": "bg-brand/15 text-brand",
  "Sınava Girdi": "bg-accent/10 text-accent",
  "Sonuç Açıklandı": "bg-accent/10 text-accent",
  "Randevu Aldı": "bg-brand/15 text-brand",
  "Kayıt Oldu": "bg-emerald-400/10 text-emerald-300",
};

const COLUMNS = [
  "Başvuru No",
  "Öğrenci",
  "Veli",
  "Telefon",
  "Sınıf",
  "Mevcut Okul",
  "Kampüs Tercihi",
  "Durum",
  "Oturum",
  "Salon",
  "Sıra No",
  "CRM Durumu",
];

/**
 * Başvuru Yönetimi tablosu.
 * Durum filtresi ile başvuru listesi (masaüstü tablo, mobil yatay scroll).
 */
export function ScholarshipApplicationsTable() {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Başvuru Yönetimi</h2>
        </div>
        <SelectField
          label="Durum Filtresi"
          items={["Tümü", ...applicationStatuses]}
          className="w-full sm:w-56"
        />
      </div>

      <div className="-mx-6 overflow-x-auto px-6">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-muted">
              {COLUMNS.map((col) => (
                <th key={col} className="whitespace-nowrap px-3 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applications.map((row) => (
              <tr
                key={row.id}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
              >
                <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-muted">
                  {row.applicationNo}
                </td>
                <td className="whitespace-nowrap px-3 py-3 font-medium text-content">
                  {row.studentName}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">{row.parentName}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">{row.phone}</td>
                <td className="whitespace-nowrap px-3 py-3 text-content">{row.grade}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">{row.currentSchool}</td>
                <td className="whitespace-nowrap px-3 py-3 text-content">
                  {row.campusPreference}
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">{row.session}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">{row.room}</td>
                <td className="whitespace-nowrap px-3 py-3 text-muted">{row.seatNo}</td>
                <td className="whitespace-nowrap px-3 py-3 text-content">{row.crmStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
