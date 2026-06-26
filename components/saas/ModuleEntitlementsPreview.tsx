"use client";

import { useEffect, useMemo, useState } from "react";
import { Boxes, Check, X } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listTenants, type TenantRecord } from "@/lib/services/tenants";
import { packageLabel } from "@/lib/packages";
import { resolveTenantModuleAccess } from "@/lib/modules/resolver";
import type { ModuleStatus } from "@/lib/modules/module-catalog";

const STATUS_STYLE: Record<ModuleStatus, string> = {
  live: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  pilot: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  comingSoon: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  aiReady: "border-accent/30 bg-accent/10 text-accent",
  locked: "border-overlay/15 bg-overlay/[0.05] text-muted",
};

/**
 * Modül Yetkileri (Önizleme) — SaaS Admin, SALT OKUNUR.
 *
 * Süper admin bir okul seçer; o okulun paketine + tenant.modules override'ına
 * göre çözülen modül erişimini tablo olarak gösterir. Hiçbir şey YAZMAZ;
 * entitlement düzenleme sonraki faz. Gerçek güvenlik Firestore kurallarında.
 */
export function ModuleEntitlementsPreview() {
  const t = useT();
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;

  const [tenants, setTenants] = useState<TenantRecord[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

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

  const selected = useMemo(
    () => tenants?.find((x) => x.tenantId === selectedId) ?? null,
    [tenants, selectedId],
  );

  const access = useMemo(
    () =>
      selected
        ? resolveTenantModuleAccess({
            packageId: selected.packageId,
            modules: selected.modules,
          })
        : [],
    [selected],
  );

  const enabledCount = access.filter((a) => a.included).length;

  if (!firebaseReady || !isSuper) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <Boxes size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("modules.preview.title")}</h2>
      </div>
      <p className="mb-4 text-sm text-muted">{t("modules.preview.desc")}</p>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="min-w-[200px] rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
          aria-label={t("modules.preview.selectTenant")}
        >
          <option value="" className="bg-surface">
            {tenants === null ? t("modules.preview.loading") : t("modules.preview.selectTenant")}
          </option>
          {(tenants ?? []).map((x) => (
            <option key={x.tenantId} value={x.tenantId} className="bg-surface">
              {x.name || x.tenantId}
            </option>
          ))}
        </select>
        {selected && (
          <>
            <span className="rounded-full border border-overlay/10 bg-overlay/[0.04] px-3 py-1 text-xs text-muted">
              {t("modules.preview.package")}: {packageLabel(selected.packageId)}
            </span>
            <span className="text-xs text-muted">
              {t("modules.preview.enabledCount", {
                count: enabledCount,
                total: access.length,
              })}
            </span>
          </>
        )}
      </div>

      {!selected ? (
        <p className="text-sm text-muted">{t("modules.preview.empty")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-overlay/10 text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-medium">{t("modules.preview.colModule")}</th>
                <th className="py-2 pr-3 font-medium">{t("modules.preview.colStatus")}</th>
                <th className="py-2 font-medium">{t("modules.preview.colSource")}</th>
              </tr>
            </thead>
            <tbody>
              {access.map((a) => (
                <tr key={a.module.id} className="border-b border-overlay/[0.06]">
                  <td className="py-2.5 pr-3">
                    <span className="flex items-center gap-2 text-content">
                      {a.included ? (
                        <Check size={14} className="shrink-0 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <X size={14} className="shrink-0 text-muted" aria-hidden="true" />
                      )}
                      {t(a.module.nameKey)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[a.status]}`}
                    >
                      {t(`modules.status.${a.status}`)}
                    </span>
                  </td>
                  <td className="py-2.5 text-xs text-muted">
                    {t(`modules.preview.source.${a.source}`)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
