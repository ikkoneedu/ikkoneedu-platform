"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  AlertCircle,
  RefreshCw,
  Download,
  Search,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useHasRole } from "@/components/auth/RoleGate";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listAllCrm,
  crmKindLabel,
  type GlobalCrmEntry,
  type CrmKind,
} from "@/lib/services/crm-global";
import { listSchools, type SchoolRecord } from "@/lib/services/schools";
import { CrmStatusSelect } from "@/components/crm/CrmStatusSelect";
import { CRM_STATUSES, crmStatusLabel } from "@/lib/services/crm-actions";
import { createPlatformAuditLog } from "@/lib/services/audit-logs";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const KINDS: CrmKind[] = ["lead", "scholarship", "inquiry", "demo"];

const KIND_BADGE: Record<CrmKind, string> = {
  lead: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  scholarship: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  inquiry: "border-accent/30 bg-accent/10 text-accent",
  demo: "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

/**
 * Global CRM — süper adminin TÜM okulların lead/başvuru/talep kayıtlarını
 * birleşik gördüğü panel. Okul ve tür filtreleri, arama, sayımlar ve CSV.
 */
export function GlobalCrmPanel() {
  const { user, firebaseReady, loading } = useAuth();
  const isSuperAdmin = useHasRole([ROLES.SUPER_ADMIN]);
  const ready = firebaseReady && isSuperAdmin;

  const [entries, setEntries] = useState<GlobalCrmEntry[]>([]);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [tenantFilter, setTenantFilter] = useState("ALL");
  const [kindFilter, setKindFilter] = useState<string>("ALL");

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [c, s] = await Promise.all([listAllCrm(), listSchools()]);
      setEntries(c);
      setSchools(s);
      setError(null);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  const schoolName = useCallback(
    (tenantId: string) => schools.find((s) => s.id === tenantId)?.name ?? tenantId,
    [schools],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (tenantFilter !== "ALL" && e.tenantId !== tenantFilter) return false;
      if (kindFilter !== "ALL" && e.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q)
      );
    });
  }, [entries, search, tenantFilter, kindFilter]);

  const kindCounts = useMemo(() => {
    const map = new Map<CrmKind, number>();
    for (const e of entries) map.set(e.kind, (map.get(e.kind) ?? 0) + 1);
    return map;
  }, [entries]);

  // Pipeline durum dağılımı (filtreye duyarlı) + dönüşüm oranı.
  const statusCounts = useMemo(() => {
    const norm = (s: string) => (s === "received" ? "new" : s);
    const map = new Map<string, number>();
    for (const e of filtered) {
      const s = norm(e.status);
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    return map;
  }, [filtered]);

  const conversionRate = useMemo(() => {
    if (filtered.length === 0) return 0;
    const converted = statusCounts.get("converted") ?? 0;
    return Math.round((converted / filtered.length) * 100);
  }, [filtered, statusCounts]);

  if (loading) {
    return <GlassCard tone="navy" className="text-sm text-muted">Yükleniyor…</GlassCard>;
  }

  if (!ready) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <div className="text-sm text-muted">
          <p className="font-semibold text-content">Global CRM kullanılamıyor</p>
          <p className="mt-1">
            Bu görünüm yalnızca giriş yapmış bir SUPER_ADMIN hesabıyla ve Firebase
            aktifken çalışır.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Database size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Global CRM</h2>
        <span className="text-xs text-muted">tüm okullar · {entries.length} kayıt</span>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={refreshing}
          className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
          aria-label="Yenile"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
        <button
          type="button"
          onClick={() => exportCrmCsv(filtered, schoolName)}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-xs text-muted transition hover:text-content disabled:opacity-50"
        >
          <Download size={13} aria-hidden="true" />
          CSV
        </button>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Tür sayımları */}
      <div className="mb-4 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <span
            key={k}
            className={`rounded-full border px-2.5 py-0.5 text-xs ${KIND_BADGE[k]}`}
          >
            {crmKindLabel(k)}: {kindCounts.get(k) ?? 0}
          </span>
        ))}
      </div>

      {/* Dönüşüm hunisi (filtreye duyarlı) */}
      <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Pipeline
          </span>
          <span className="text-xs text-muted">
            Dönüşüm oranı:{" "}
            <span className="font-semibold text-emerald-300">%{conversionRate}</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CRM_STATUSES.map((s) => {
            const count = statusCounts.get(s) ?? 0;
            const pct = filtered.length ? Math.round((count / filtered.length) * 100) : 0;
            return (
              <div
                key={s}
                className="flex min-w-[96px] flex-1 flex-col gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5"
              >
                <span className="text-xs text-muted">{crmStatusLabel(s)}</span>
                <span className="text-sm font-semibold text-content">
                  {count}
                  <span className="ml-1 text-xs font-normal text-muted">%{pct}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtreler */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, telefon, e-posta ara…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-content placeholder:text-muted/60 outline-none focus:border-accent"
          />
        </div>
        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs text-content outline-none focus:border-accent"
          aria-label="Okul filtrele"
        >
          <option value="ALL" className="bg-surface">Tüm okullar</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id} className="bg-surface">{s.name}</option>
          ))}
        </select>
        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-xs text-content outline-none focus:border-accent"
          aria-label="Tür filtrele"
        >
          <option value="ALL" className="bg-surface">Tüm türler</option>
          {KINDS.map((k) => (
            <option key={k} value={k} className="bg-surface">{crmKindLabel(k)}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {entries.length === 0 ? "Henüz CRM kaydı yok." : "Filtreye uygun kayıt yok."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="pb-2 pr-4 font-medium">Okul</th>
                <th className="pb-2 pr-4 font-medium">Tür</th>
                <th className="pb-2 pr-4 font-medium">Ad</th>
                <th className="pb-2 pr-4 font-medium">İletişim</th>
                <th className="pb-2 pr-4 font-medium">Durum</th>
                <th className="pb-2 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.slice(0, 500).map((e) => (
                <tr key={`${e.kind}-${e.id}`} className="text-content">
                  <td className="py-2.5 pr-4">{schoolName(e.tenantId)}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${KIND_BADGE[e.kind]}`}>
                      {crmKindLabel(e.kind)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="font-medium">{e.name}</span>
                    {e.detail && (
                      <span className="ml-2 text-xs text-muted">{e.detail}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-muted">
                    {e.phone || "—"}
                    {e.email ? ` · ${e.email}` : ""}
                  </td>
                  <td className="py-2.5 pr-4">
                    <CrmStatusSelect
                      tenantId={e.tenantId}
                      kind={e.kind}
                      id={e.id}
                      status={e.status}
                      onChanged={refresh}
                      onError={setError}
                      onAction={(status) =>
                        createPlatformAuditLog({
                          actorId: user?.uid,
                          action: "crm.status_change",
                          resource: `tenants/${e.tenantId}/${e.kind}/${e.id}`,
                          meta: { status, kind: e.kind },
                        }).then(() => undefined)
                      }
                    />
                  </td>
                  <td className="py-2.5 text-xs text-muted">{formatDate(e.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 500 && (
            <p className="mt-2 text-xs text-muted">
              İlk 500 kayıt gösteriliyor. Daraltmak için filtre kullanın veya CSV indirin.
            </p>
          )}
        </div>
      )}
    </GlassCard>
  );
}

function formatDate(ms: number | null): string {
  if (!ms) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ms));
}

function exportCrmCsv(
  entries: GlobalCrmEntry[],
  schoolName: (tenantId: string) => string,
): void {
  if (typeof window === "undefined" || entries.length === 0) return;
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = ["Okul", "Tür", "Ad", "Telefon", "E-posta", "Durum", "Detay", "Tarih"];
  const rows = entries.map((e) => [
    schoolName(e.tenantId),
    crmKindLabel(e.kind),
    e.name,
    e.phone,
    e.email,
    e.status,
    e.detail,
    formatDate(e.createdAt),
  ]);
  const csv = [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `global-crm-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
