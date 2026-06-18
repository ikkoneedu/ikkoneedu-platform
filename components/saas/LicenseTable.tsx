import { KeyRound } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SaasLicense } from "@/lib/saas-mock-data";

interface LicenseTableProps {
  licenses: SaasLicense[];
}

const STATUS_STYLES: Record<SaasLicense["status"], string> = {
  Aktif: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  Deneme: "border-amber-400/20 bg-amber-400/10 text-amber-400",
  Yenilenecek: "border-accent/20 bg-accent/10 text-accent",
};

/**
 * Lisans ve Paket Durumu.
 * Okul bazlı lisans başlangıç/bitiş tarihleri ve durumu (mock).
 */
export function LicenseTable({ licenses }: LicenseTableProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Lisans ve Paket Durumu</h2>
      </div>

      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-white/10 px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
        <span>Okul</span>
        <span>Paket</span>
        <span>Başlangıç</span>
        <span>Bitiş</span>
        <span>Durum</span>
      </div>

      <ul className="divide-y divide-white/5">
        {licenses.map((license) => (
          <li
            key={license.id}
            className="flex flex-col gap-2 px-2 py-4 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold text-content">{license.school}</span>
            <span className="text-sm text-muted">
              <span className="lg:hidden">Paket: </span>
              {license.plan}
            </span>
            <span className="text-sm text-muted">
              <span className="lg:hidden">Başlangıç: </span>
              {license.start}
            </span>
            <span className="text-sm text-muted">
              <span className="lg:hidden">Bitiş: </span>
              {license.end}
            </span>
            <span>
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[license.status]}`}>
                {license.status}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
