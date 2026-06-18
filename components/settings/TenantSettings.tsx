import { Building2, Globe, Palette, Image as ImageIcon } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import type { SettingsTenant } from "@/lib/settings-mock-data";

interface TenantSettingsProps {
  tenants: SettingsTenant[];
}

/**
 * Okul ve Tenant Ayarları — Okul Yönetimi.
 * Tenant domain yapısı, okul bazlı özelleştirmeler ve okul tablosu.
 */
export function TenantSettings({ tenants }: TenantSettingsProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <Building2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Okul Yönetimi</h2>
      </div>

      {/* Tenant özet bilgileri */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <p className="text-xs text-muted">Aktif Okul Sayısı</p>
          <p className="mt-1 text-2xl font-bold text-content">{tenants.length}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-navy/40 p-4">
          <Globe size={16} className="text-accent" aria-hidden="true" />
          <span className="font-mono text-xs text-content">okuladi.ikkoneedu.com</span>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-muted">
          <span className="flex items-center gap-1.5 text-xs">
            <ImageIcon size={14} aria-hidden="true" /> Logo
          </span>
          <span className="flex items-center gap-1.5 text-xs">
            <Palette size={14} aria-hidden="true" /> Renk
          </span>
        </div>
      </div>

      {/* Okul tablosu */}
      <div className="mt-5 hidden grid-cols-[2fr_2fr_1fr_1fr_auto] gap-4 border-b border-white/10 px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-muted lg:grid">
        <span>Okul</span>
        <span>Tenant Adresi</span>
        <span>Paket</span>
        <span>Durum</span>
        <span className="text-right">İşlem</span>
      </div>
      <ul className="divide-y divide-white/5">
        {tenants.map((tenant) => (
          <li
            key={tenant.id}
            className="flex flex-col gap-2 px-2 py-4 lg:grid lg:grid-cols-[2fr_2fr_1fr_1fr_auto] lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold text-content">{tenant.name}</span>
            <span className="font-mono text-xs text-muted">{tenant.domain}</span>
            <span className="text-sm text-muted">{tenant.plan}</span>
            <span>
              <span className="inline-block rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                {tenant.status}
              </span>
            </span>
            <span className="lg:text-right">
              <PrimaryButton variant="secondary" size="sm" className="w-full lg:w-auto">
                Yönet
              </PrimaryButton>
            </span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
