"use client";

import { useCallback, useEffect, useState } from "react";
import { PieChart, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useT } from "@/components/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listLeads, type LeadRecord } from "@/lib/services/leads";

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
 * Lead Kaynakları — GERÇEK Firestore. Lead'leri `source` alanına göre gruplar
 * ve pay yüzdelerini hesaplar. Tenant izole. Veri yoksa boş durum gösterir.
 */
export function RealLeadSources() {
  const t = useT();
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canView = profile != null && CRM_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canView;

  const [rows, setRows] = useState<LeadRecord[] | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) return;
    try {
      setRows(await listLeads(tenantId));
    } catch {
      setRows([]);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) return null;

  // Kaynağa göre grupla (boş kaynak "Diğer").
  const counts = new Map<string, number>();
  for (const lead of rows ?? []) {
    const key = lead.source?.trim() || t("panelCrm.sources.other");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = rows?.length ?? 0;
  const sources = [...counts.entries()]
    .map(([name, count]) => ({ name, count, share: total ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

  return (
    <GlassCard tone="navy" className="flex h-full flex-col">
      <div className="mb-5 flex items-center gap-2">
        <PieChart size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("panelCrm.sources.title")}</h2>
      </div>

      {rows === null ? (
        <p className="py-10 text-center text-sm text-muted">{t("panelCrm.sources.loading")}</p>
      ) : total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center text-muted">
          <Inbox size={26} className="text-accent" aria-hidden="true" />
          <p className="text-sm">{t("panelCrm.sources.empty")}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-center gap-4">
          {sources.map((source) => (
            <div key={source.name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-content">{source.name}</span>
                <span className="text-xs text-muted">
                  {t("panelCrm.sources.count", { count: source.count })}<span className="font-semibold text-accent">%{source.share}</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-overlay/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
                  style={{ width: `${source.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
