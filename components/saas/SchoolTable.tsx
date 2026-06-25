import Link from "next/link";
import { Building2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import type { SaasSchool } from "@/lib/saas-mock-data";

interface SchoolTableProps {
  schools: SaasSchool[];
}

const PLAN_STYLES: Record<SaasSchool["plan"], string> = {
  Starter: "border-overlay/10 bg-overlay/5 text-muted",
  Professional: "border-accent/20 bg-accent/10 text-accent",
  Enterprise: "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-300",
};

const STATUS_STYLES: Record<SaasSchool["status"], string> = {
  Aktif: "border-emerald-400/20 bg-emerald-400/10 text-emerald-400",
  "Deneme Süreci": "border-amber-400/20 bg-amber-400/10 text-amber-400",
};

/**
 * Okullar Listesi.
 * Her satırda okul adı, paket, durum, kullanıcı sayısı ve yönet butonu.
 * Masaüstünde tablo, mobilde kart düzeni.
 */
export function SchoolTable({ schools }: SchoolTableProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Building2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Okullar Listesi</h2>
        <DataExportButtons
          className="ml-auto"
          filename="okullar-listesi"
          title="Okullar Listesi"
          columns={[
            { key: "name", label: "Okul" },
            { key: "plan", label: "Paket" },
            { key: "status", label: "Durum" },
            { key: "users", label: "Kullanıcı" },
          ]}
          rows={schools as unknown as Record<string, unknown>[]}
        />
      </div>

      {/* Masaüstü tablo başlığı */}
      <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-overlay/10 px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
        <span>Okul</span>
        <span>Paket</span>
        <span>Durum</span>
        <span>Kullanıcı</span>
        <span className="text-right">İşlem</span>
      </div>

      <ul className="divide-y divide-overlay/5">
        {schools.map((school) => (
          <li
            key={school.id}
            className="flex flex-col gap-3 px-2 py-4 lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold text-content">{school.name}</span>
            <span>
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${PLAN_STYLES[school.plan]}`}>
                {school.plan}
              </span>
            </span>
            <span>
              <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[school.status]}`}>
                {school.status}
              </span>
            </span>
            <span className="text-sm text-muted">{school.users} kullanıcı</span>
            <span className="lg:text-right">
              <Link href="/super-admin">
                <PrimaryButton variant="secondary" size="sm" className="w-full lg:w-auto">
                  Yönet
                </PrimaryButton>
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
