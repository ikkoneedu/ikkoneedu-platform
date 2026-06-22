"use client";

import { useEffect, useState } from "react";
import { Target, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import {
  listPlatformLeads,
  updatePlatformLeadStatus,
  leadStatusLabel,
  LEAD_STATUSES,
  type PlatformLeadRecord,
  type LeadStatus,
} from "@/lib/services/leads";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STATUS_TONES: Record<string, string> = {
  new: "border-accent/20 bg-accent/10 text-accent",
  contacted: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  meeting_scheduled: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  proposal_sent: "border-violet-400/20 bg-violet-400/10 text-violet-300",
  won: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  lost: "border-white/15 bg-white/5 text-muted",
};

/**
 * Platform satış lead pipeline'ı (gerçek Firestore — kök `platformLeads`).
 * Demo talebinden "Lead'e Çevir" ile oluşan platform lead'leri burada izlenir.
 * Yalnızca SUPER_ADMIN + Firebase aktifken görünür.
 */
export function PlatformLeadsInbox() {
  const { profile, firebaseReady } = useAuth();
  const isSuper = profile?.role === ROLES.SUPER_ADMIN;

  const [items, setItems] = useState<PlatformLeadRecord[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady || !isSuper) return;
    let active = true;
    void (async () => {
      const rows = await listPlatformLeads();
      if (active) setItems(rows);
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, isSuper]);

  const handleStatus = async (id: string, status: LeadStatus) => {
    setBusyId(id);
    setError(null);
    try {
      await updatePlatformLeadStatus(id, status);
      setItems((prev) =>
        prev ? prev.map((r) => (r.id === id ? { ...r, status } : r)) : prev,
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  // Lead henüz yokken paneli gizleme — demo dönüşümünden sonra dolacak.
  if (!firebaseReady || !isSuper || items === null) return null;
  if (items.length === 0) return null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Target size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">
          Platform Satış Lead&apos;leri (canlı)
        </h2>
        <span className="text-xs text-muted">{items.length}</span>
        <DataExportButtons
          className="ml-auto"
          filename="platform-leadler"
          title="Platform Satış Leadleri"
          columns={[
            { key: "fullName", label: "Yetkili" },
            { key: "institution", label: "Kurum" },
            { key: "phone", label: "Telefon" },
            { key: "email", label: "E-posta" },
            { key: "city", label: "Şehir" },
            { key: "status", label: "Durum" },
            { key: "source", label: "Kaynak" },
            { key: "note", label: "Not" },
          ]}
          rows={items as unknown as Record<string, unknown>[]}
        />
      </div>

      {error && (
        <p className="mb-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {items.map((r) => (
          <div
            key={r.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-content">
                {r.institution || r.fullName || "—"}
              </span>
              <span className="block truncate text-xs text-muted">
                {r.fullName} · {r.phone || r.email || "—"}
                {r.city ? ` · ${r.city}` : ""}
              </span>
            </span>

            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                STATUS_TONES[r.status] ?? STATUS_TONES.new
              }`}
            >
              {leadStatusLabel(r.status)}
            </span>

            <select
              value={r.status}
              disabled={busyId === r.id}
              onChange={(e) => handleStatus(r.id, e.target.value as LeadStatus)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-content outline-none focus:border-accent disabled:opacity-60"
              aria-label="Lead durumu"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-surface">
                  {leadStatusLabel(s)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
