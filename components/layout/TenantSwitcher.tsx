"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listTenants, type TenantRecord } from "@/lib/services/tenants";

/**
 * Süper admin okul (tenant) seçici. Seçilen okul `setActiveTenant` ile
 * AuthProvider'a yazılır; tüm paneller o okulun verisini gösterir.
 * Yalnızca SUPER_ADMIN'de ve Firebase aktifken render edilir.
 */
export function TenantSwitcher() {
  const { profile, firebaseReady, activeTenantId, setActiveTenant } = useAuth();
  const tx = useT();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;

  const [tenants, setTenants] = useState<TenantRecord[]>([]);

  useEffect(() => {
    if (!firebaseReady || !isSuper) return;
    let active = true;
    void (async () => {
      try {
        const rows = await listTenants();
        if (active) setTenants(rows);
      } catch {
        if (active) setTenants([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, isSuper]);

  if (!firebaseReady || !isSuper) return null;

  return (
    <label
      className="relative flex items-center gap-2 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1.5 text-xs text-muted"
      title={tx("chrome.tenant.title")}
    >
      <Building2 size={14} className="shrink-0 text-accent" aria-hidden="true" />
      <span className="sr-only">{tx("chrome.tenant.select")}</span>
      <select
        value={activeTenantId ?? ""}
        onChange={(e) => setActiveTenant(e.target.value || null)}
        className="max-w-[110px] cursor-pointer appearance-none truncate bg-transparent pr-4 text-content outline-none sm:max-w-[160px]"
      >
        <option value="" className="bg-surface">{tx("chrome.tenant.platform")}</option>
        {tenants.map((t) => (
          <option key={t.tenantId} value={t.tenantId} className="bg-surface">
            {t.name || t.tenantId}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2 text-muted" aria-hidden="true" />
    </label>
  );
}
