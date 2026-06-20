"use client";

import { useEffect, useState } from "react";
import { Inbox, Award, Contact } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listScholarshipApplications,
  type ScholarshipApplicationRecord,
} from "@/lib/services/scholarship-applications";
import { listLeads, type LeadRecord } from "@/lib/services/leads";

const STAFF_ROLES = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.PR,
  ROLES.SALES,
  ROLES.SUPER_ADMIN,
] as const;

/**
 * CRM gelen kutusu — gerçek bursluluk başvuruları + lead'ler (Firestore).
 * Yalnızca giriş yapmış CRM personeli + Firebase aktifken görünür.
 */
export function CrmInbox() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canSee =
    profile != null && (STAFF_ROLES as readonly string[]).includes(profile.role);

  const [apps, setApps] = useState<ScholarshipApplicationRecord[] | null>(null);
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  useEffect(() => {
    if (!firebaseReady || !tenantId || !canSee) return;
    let active = true;
    void (async () => {
      const [a, l] = await Promise.all([
        listScholarshipApplications(tenantId),
        listLeads(tenantId),
      ]);
      if (active) {
        setApps(a);
        setLeads(l);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, tenantId, canSee]);

  if (!firebaseReady || !canSee || apps === null) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Award size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Bursluluk Başvuruları</h2>
          <span className="ml-auto text-xs text-muted">{apps.length}</span>
        </div>
        {apps.length === 0 ? (
          <p className="text-sm text-muted">Henüz başvuru yok.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {apps.map((a) => (
              <li key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-content">{a.studentName || "—"}</span>
                  <span className="font-mono text-xs text-accent">{a.applicationNo}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  Veli: {a.parentName || "—"} · {a.parentPhone || a.parentEmail || "—"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <Contact size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Lead&apos;ler</h2>
          <span className="ml-auto text-xs text-muted">{leads.length}</span>
        </div>
        {leads.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Inbox size={15} aria-hidden="true" />
            Henüz lead yok.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {leads.map((l) => (
              <li key={l.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-content">{l.fullName || "—"}</span>
                  <span className="text-xs text-muted">{l.source || "—"}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {l.phone || "—"}
                  {l.email ? ` · ${l.email}` : ""}
                </p>
                {l.note && <p className="mt-1 text-xs text-muted/70">{l.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
