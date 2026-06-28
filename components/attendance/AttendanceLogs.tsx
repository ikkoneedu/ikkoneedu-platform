"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList, RefreshCw, AlertCircle, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listStaffAttendance,
  formatAttendanceTime,
  type StaffAttendanceLog,
} from "@/lib/services/staff-attendance";
import { departmentLabel } from "@/lib/staff/departments";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Personel Giriş-Çıkış Kayıtları — yönetim raporu (salt okunur).
 * Tarih aralığı seçilir; isim/departman/tarih/giriş/çıkış + CSV/PDF export.
 */
export function AttendanceLogs() {
  const { profile, firebaseReady } = useAuth();
  const t = useT();
  const tenantId = profile?.tenantId;
  const canView = profile != null && MANAGER_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canView;

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const [from, setFrom] = useState(ymd(monthStart));
  const [to, setTo] = useState(ymd(today));
  const [rows, setRows] = useState<StaffAttendanceLog[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setRows(await listStaffAttendance(tenantId, from, to));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId, from, to]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm text-muted">{t("att.logs.unavailable")}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <ClipboardList size={18} className="mb-1 text-accent" aria-hidden="true" />
        <h2 className="mb-0.5 text-lg font-semibold text-content">{t("att.logs.title")}</h2>
        <div className="ml-auto flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t("att.logs.from")}
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1.5 text-sm text-content outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t("att.logs.to")}
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1.5 text-sm text-content outline-none focus:border-accent"
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="mb-0.5 rounded-lg border border-overlay/10 bg-overlay/[0.04] p-2 text-muted transition hover:text-content disabled:opacity-50"
            aria-label={t("att.logs.refresh")}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted">{t("att.logs.desc")}</p>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs text-muted">{t("att.logs.count", { count: rows?.length ?? 0 })}</span>
        {(rows?.length ?? 0) > 0 && (
          <DataExportButtons
            className="ml-auto"
            filename="personel-giris-cikis"
            title={t("att.logs.exportTitle")}
            formats={["pdf", "csv"]}
            columns={[
              { key: "name", label: t("att.logs.col.name") },
              { key: "departmentLabel", label: t("att.logs.col.department") },
              { key: "date", label: t("att.logs.col.date") },
              { key: "inTime", label: t("att.logs.col.in") },
              { key: "outTime", label: t("att.logs.col.out") },
            ]}
            rows={(rows ?? []).map((r) => ({
              name: r.name,
              departmentLabel: r.department ? departmentLabel(r.department) : "—",
              date: r.date,
              inTime: formatAttendanceTime(r.checkIn),
              outTime: formatAttendanceTime(r.checkOut),
            }))}
          />
        )}
      </div>

      {rows === null || loading ? (
        <p className="text-sm text-muted">{t("att.logs.loading")}</p>
      ) : rows.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> {t("att.logs.empty")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-overlay/10 text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">{t("att.logs.col.name")}</th>
                <th className="py-2 pr-4 font-medium">{t("att.logs.col.department")}</th>
                <th className="py-2 pr-4 font-medium">{t("att.logs.col.date")}</th>
                <th className="py-2 pr-4 font-medium">{t("att.logs.col.in")}</th>
                <th className="py-2 font-medium">{t("att.logs.col.out")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-overlay/[0.06]">
                  <td className="py-2.5 pr-4 font-medium text-content">{r.name || "—"}</td>
                  <td className="py-2.5 pr-4 text-muted">{r.department ? departmentLabel(r.department) : "—"}</td>
                  <td className="py-2.5 pr-4 text-muted">{r.date}</td>
                  <td className="py-2.5 pr-4 text-emerald-300">{formatAttendanceTime(r.checkIn)}</td>
                  <td className="py-2.5 text-sky-300">{formatAttendanceTime(r.checkOut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}
