"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Kanban,
  Phone,
  Tag,
  RefreshCw,
  AlertCircle,
  Inbox,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  LEAD_STATUSES,
  leadStatusLabel,
  listLeads,
  type LeadRecord,
} from "@/lib/services/leads";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/** CRM'e erişebilen kadro (sayfa zaten RoleGuard ile korunur; ek güvence). */
const CRM_ROLES: string[] = [
  ROLES.SUPER_ADMIN,
  ROLES.FOUNDER,
  ROLES.SCHOOL_ADMIN,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SALES,
  ROLES.PR,
  ROLES.SUPPORT,
];

/**
 * Lead Pipeline — GERÇEK Firestore (`tenants/{tenantId}/leads`).
 * Lead'leri durumlarına göre kanban sütunlarına gruplar. Tenant izole.
 * Mock `LeadPipeline` yerine kullanılır; veri yoksa boş durum gösterir.
 */
export function RealLeadPipeline() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canView = profile != null && CRM_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canView;

  const [rows, setRows] = useState<LeadRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    try {
      setRows(await listLeads(tenantId));
      setError(null);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) return null;

  // Lead'leri duruma göre grupla (bilinmeyen durumlar "new"e düşer).
  const known = new Set<string>(LEAD_STATUSES);
  const byStatus = new Map<string, LeadRecord[]>();
  for (const status of LEAD_STATUSES) byStatus.set(status, []);
  for (const lead of rows ?? []) {
    const key = known.has(lead.status) ? lead.status : "new";
    byStatus.get(key)!.push(lead);
  }

  const total = rows?.length ?? 0;

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Kanban size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Lead Pipeline</h2>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted">
            {total}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          aria-label="Yenile"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition-colors hover:bg-white/[0.08] hover:text-content disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
            aria-hidden="true"
          />
        </button>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="py-10 text-center text-sm text-muted">Yükleniyor…</p>
      ) : total === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-muted">
          <Inbox size={28} className="text-accent" aria-hidden="true" />
          <p className="text-sm">Henüz lead yok. Yukarıdaki formdan ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex min-w-[960px] gap-4">
            {LEAD_STATUSES.map((status) => {
              const leads = byStatus.get(status) ?? [];
              return (
                <div key={status} className="flex w-[160px] flex-1 flex-col">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-content">
                      {leadStatusLabel(status)}
                    </span>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-muted">
                      {leads.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:border-accent/30"
                      >
                        <p className="text-sm font-semibold text-content">
                          {lead.fullName || "—"}
                        </p>
                        {lead.phone && (
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                            <Phone size={12} aria-hidden="true" />
                            {lead.phone}
                          </p>
                        )}
                        {lead.source && (
                          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                            <Tag size={12} aria-hidden="true" />
                            {lead.source}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
