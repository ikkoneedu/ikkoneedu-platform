"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, RefreshCw, Inbox, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { SelectField } from "@/components/shared/SelectField";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listScholarshipApplications,
  type ScholarshipApplicationRecord,
} from "@/lib/services/scholarship-applications";

const STAFF_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.PR,
  ROLES.SALES,
  ROLES.SUPER_ADMIN,
];

function statusStyle(s: string): string {
  const k = s.toLowerCase();
  if (k.includes("onay") || k.includes("kayıt") || k.includes("kazan")) return "bg-emerald-400/10 text-emerald-300";
  if (k.includes("bekl") || k.includes("eksik")) return "bg-amber-400/10 text-amber-300";
  if (k.includes("sınav") || k.includes("oturum") || k.includes("salon")) return "bg-accent/10 text-accent";
  return "bg-overlay/[0.06] text-muted";
}

/**
 * Başvuru Yönetimi — GERÇEK Firestore (`scholarshipApplications`).
 * Public başvuru formundan gelen kayıtları listeler; durum filtresi + export.
 */
export function ScholarshipApplicationsTable() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canView = profile != null && STAFF_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canView;

  const [rows, setRows] = useState<ScholarshipApplicationRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("Tümü");

  const load = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setRows(await listScholarshipApplications(tenantId));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    (rows ?? []).forEach((r) => r.status && set.add(r.status));
    return Array.from(set);
  }, [rows]);

  const filtered = useMemo(
    () => (filter === "Tümü" ? rows ?? [] : (rows ?? []).filter((r) => r.status === filter)),
    [rows, filter],
  );

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm text-muted">
          Başvuru yönetimi yalnızca giriş yapmış yetkili personelde ve Firebase aktifken görünür.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Başvuru Yönetimi</h2>
          <span className="text-xs text-muted">{filtered.length}</span>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="text-muted transition hover:text-content disabled:opacity-50"
            aria-label="Yenile"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <SelectField
            label="Durum Filtresi"
            items={["Tümü", ...statuses]}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-56"
          />
          {filtered.length > 0 && (
            <DataExportButtons
              filename="bursluluk-basvurulari"
              title="Bursluluk Başvuruları"
              formats={["pdf", "csv"]}
              columns={[
                { key: "applicationNo", label: "Başvuru No" },
                { key: "studentName", label: "Öğrenci" },
                { key: "parentName", label: "Veli" },
                { key: "parentPhone", label: "Telefon" },
                { key: "parentEmail", label: "E-posta" },
                { key: "status", label: "Durum" },
                { key: "examScore", label: "Sınav Puanı" },
                { key: "scholarshipRate", label: "Burs Oranı" },
                { key: "resultStatus", label: "Sonuç" },
              ]}
              rows={filtered as unknown as Record<string, unknown>[]}
            />
          )}
        </div>
      </div>

      {rows === null || loading ? (
        <p className="text-sm text-muted">Yükleniyor…</p>
      ) : filtered.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> Henüz başvuru yok.
        </p>
      ) : (
        <div className="-mx-6 overflow-x-auto px-6">
          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-overlay/10 text-xs uppercase tracking-wide text-muted">
                {["Başvuru No", "Öğrenci", "Veli", "Telefon", "Durum", "Sınav Puanı", "Burs Oranı", "Salon", "Sıra No"].map((c) => (
                  <th key={c} className="whitespace-nowrap px-3 py-3 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-overlay/5 transition-colors hover:bg-overlay/[0.03]">
                  <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-muted">{row.applicationNo || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-content">{row.studentName || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{row.parentName || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{row.parentPhone || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {row.status ? (
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(row.status)}`}>
                        {row.status}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-content">{row.examScore || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-content">{row.scholarshipRate || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{row.room || "—"}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">{row.seatNo || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
