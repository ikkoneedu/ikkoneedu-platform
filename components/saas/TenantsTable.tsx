"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  Users as UsersIcon,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import {
  listTenants,
  updateTenant,
  tenantStatusLabel,
  TENANT_STATUSES,
  type TenantRecord,
  type TenantStatus,
} from "@/lib/services/tenants";
import {
  listSchoolProfiles,
  type SchoolProfile,
} from "@/lib/services/school-profiles";
import { listAllUsers, type AllUser } from "@/lib/services/users";
import { packageLabel } from "@/lib/packages";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STATUS_TONES: Record<string, string> = {
  trial: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  active: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  suspended: "border-brand/30 bg-brand/10 text-brand",
  cancelled: "border-overlay/15 bg-overlay/5 text-muted",
};

const FILTERS = [
  { id: "all", labelKey: "panelSaas.tt.filter.all" },
  { id: "trial", labelKey: "panelSaas.tt.filter.trial" },
  { id: "active", labelKey: "panelSaas.tt.filter.active" },
  { id: "suspended", labelKey: "panelSaas.tt.filter.suspended" },
] as const;

/**
 * Tenant listesi + detay (okul profili + adminler) + durum/paket güncelleme.
 * Yalnızca SUPER_ADMIN + Firebase aktifken. `reloadKey` değişince yeniden çeker.
 */
export function TenantsTable({ reloadKey = 0 }: { reloadKey?: number }) {
  const tx = useT();
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;

  const [tenants, setTenants] = useState<TenantRecord[] | null>(null);
  const [profiles, setProfiles] = useState<SchoolProfile[]>([]);
  const [users, setUsers] = useState<AllUser[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!firebaseReady || !isSuper) return;
    setRefreshing(true);
    try {
      const [t, p, u] = await Promise.all([
        listTenants(),
        listSchoolProfiles(),
        listAllUsers(),
      ]);
      setTenants(t);
      setProfiles(p);
      setUsers(u);
      setError(null);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [firebaseReady, isSuper]);

  useEffect(() => {
    void refresh();
  }, [refresh, reloadKey]);

  const handleStatus = async (tenantId: string, status: TenantStatus) => {
    setBusyId(tenantId);
    setError(null);
    try {
      await updateTenant(tenantId, { status });
      setTenants((prev) =>
        prev
          ? prev.map((t) => (t.tenantId === tenantId ? { ...t, status } : t))
          : prev,
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const profileByTenant = useMemo(() => {
    const map = new Map<string, SchoolProfile>();
    for (const p of profiles) map.set(p.tenantId, p);
    return map;
  }, [profiles]);

  const adminsByTenant = useMemo(() => {
    const map = new Map<string, AllUser[]>();
    for (const u of users) {
      if (u.role === ROLES.SCHOOL_ADMIN || u.role === ROLES.FOUNDER) {
        const list = map.get(u.tenantId) ?? [];
        list.push(u);
        map.set(u.tenantId, list);
      }
    }
    return map;
  }, [users]);

  const usersByTenant = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of users) map.set(u.tenantId, (map.get(u.tenantId) ?? 0) + 1);
    return map;
  }, [users]);

  if (!firebaseReady || !isSuper || tenants === null) return null;

  const visible =
    filter === "all"
      ? tenants
      : tenants.filter((t) => t.status.toLowerCase() === filter);

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Building2 size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{tx("panelSaas.tt.heading")}</h2>
        <span className="text-xs text-muted">{visible.length}</span>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="text-muted transition hover:text-content disabled:opacity-50"
          aria-label={tx("panelSaas.tt.refreshAria")}
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-lg border px-2.5 py-1 text-xs transition ${
                filter === f.id
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-overlay/10 text-muted hover:text-content"
              }`}
            >
              {tx(f.labelKey)}
            </button>
          ))}
          <DataExportButtons
            filename={tx("panelSaas.tt.export.filename")}
            title={tx("panelSaas.tt.export.title")}
            columns={[
              { key: "name", label: tx("panelSaas.tt.col.name") },
              { key: "slug", label: tx("panelSaas.tt.col.slug") },
              { key: "packageId", label: tx("panelSaas.tt.col.package") },
              { key: "status", label: tx("panelSaas.tt.col.status") },
              { key: "city", label: tx("panelSaas.tt.col.city") },
            ]}
            rows={visible as unknown as Record<string, unknown>[]}
          />
        </div>
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {visible.length === 0 ? (
        <p className="text-sm text-muted">{tx("panelSaas.tt.empty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((t) => {
            const sp = profileByTenant.get(t.tenantId);
            const admins = adminsByTenant.get(t.tenantId) ?? [];
            const open = openId === t.tenantId;
            return (
              <div
                key={t.tenantId}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.02]"
              >
                <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : t.tenantId)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-content">
                        {t.name}
                      </span>
                      <span className="block truncate font-mono text-xs text-accent">
                        {t.slug}.ikkoneedu.com
                      </span>
                    </span>
                  </button>

                  <span className="rounded-md bg-overlay/5 px-2 py-0.5 text-[11px] text-muted">
                    {packageLabel(t.packageId)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    <UsersIcon size={13} aria-hidden="true" />
                    {usersByTenant.get(t.tenantId) ?? 0}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                      STATUS_TONES[t.status.toLowerCase()] ?? STATUS_TONES.active
                    }`}
                  >
                    {tenantStatusLabel(t.status.toLowerCase())}
                  </span>
                  <select
                    value={
                      TENANT_STATUSES.includes(
                        t.status.toLowerCase() as TenantStatus,
                      )
                        ? (t.status.toLowerCase() as TenantStatus)
                        : "active"
                    }
                    disabled={busyId === t.tenantId}
                    onChange={(e) =>
                      handleStatus(t.tenantId, e.target.value as TenantStatus)
                    }
                    className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
                    aria-label={tx("panelSaas.tt.statusAria")}
                  >
                    {TENANT_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-surface">
                        {tenantStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </div>

                {open && (
                  <div className="grid grid-cols-1 gap-4 border-t border-overlay/10 px-4 py-4 sm:grid-cols-2">
                    <div className="text-sm">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        {tx("panelSaas.tt.schoolProfile")}
                      </p>
                      {sp ? (
                        <ul className="space-y-0.5 text-muted">
                          <li>
                            {tx("panelSaas.tt.cityDistrict")}{" "}
                            <span className="text-content">
                              {sp.city || "—"}
                              {sp.district ? ` / ${sp.district}` : ""}
                            </span>
                          </li>
                          <li>
                            {tx("panelSaas.tt.phone")}{" "}
                            <span className="text-content">{sp.phone || "—"}</span>
                          </li>
                          <li>
                            {tx("panelSaas.tt.email")}{" "}
                            <span className="text-content">{sp.email || "—"}</span>
                          </li>
                          <li>
                            {tx("panelSaas.tt.web")}{" "}
                            <span className="text-content">{sp.website || "—"}</span>
                          </li>
                          <li>
                            {tx("panelSaas.tt.status")}{" "}
                            <span className="text-content">{sp.status}</span>
                          </li>
                        </ul>
                      ) : (
                        <p className="text-muted">
                          {tx("panelSaas.tt.noProfile")}
                        </p>
                      )}
                    </div>

                    <div className="text-sm">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                        {tx("panelSaas.tt.admins", { count: admins.length })}
                      </p>
                      {admins.length === 0 ? (
                        <p className="text-muted">{tx("panelSaas.tt.noAdmins")}</p>
                      ) : (
                        <ul className="space-y-1">
                          {admins.map((a) => (
                            <li
                              key={a.uid}
                              className="flex items-center justify-between gap-2 rounded-lg border border-overlay/10 bg-overlay/[0.02] px-2.5 py-1.5"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-content">
                                  {a.displayName || a.email}
                                </span>
                                <span className="block truncate text-xs text-muted">
                                  {a.email} · {a.role}
                                </span>
                              </span>
                              <span className="shrink-0 text-xs text-muted">
                                {a.status}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
