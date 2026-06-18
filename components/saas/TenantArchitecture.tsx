import { Network, Globe, Check } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { SaasTenant } from "@/lib/saas-mock-data";

interface TenantArchitectureProps {
  tenants: SaasTenant[];
  features: string[];
}

/**
 * Tenant Yönetimi — Multi School Architecture.
 * Okul bazlı alt alan adlarını ve çoklu kiracı (multi-tenant) özelliklerini gösterir.
 */
export function TenantArchitecture({ tenants, features }: TenantArchitectureProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-1 flex items-center gap-2">
        <Network size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Tenant Yönetimi</h2>
      </div>
      <p className="mb-5 text-sm text-muted">Multi School Architecture</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-content">Aktif Alan Adları</h3>
          <ul className="space-y-2.5">
            {tenants.map((tenant) => (
              <li
                key={tenant.id}
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-navy/50 text-accent">
                  <Globe size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-content">{tenant.domain}</p>
                  <p className="truncate text-xs text-muted">{tenant.school}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-content">Özellikler</h3>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-sm text-content"
              >
                <Check size={16} className="shrink-0 text-emerald-400" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
