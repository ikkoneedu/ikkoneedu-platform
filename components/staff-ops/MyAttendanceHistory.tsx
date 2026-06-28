"use client";

import { useCallback, useEffect, useState } from "react";
import { History, RefreshCw, AlertCircle, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import {
  listMyAttendance,
  formatAttendanceTime,
  type StaffAttendanceLog,
} from "@/lib/services/staff-attendance";

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Personelin kendi giriş-çıkış geçmişi (salt okunur). */
export function MyAttendanceHistory() {
  const { user, profile, firebaseReady } = useAuth();
  const t = useT();
  const tenantId = profile?.tenantId;
  const usable = firebaseReady && Boolean(tenantId) && Boolean(user);

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const [from, setFrom] = useState(ymd(monthStart));
  const [to, setTo] = useState(ymd(today));
  const [rows, setRows] = useState<StaffAttendanceLog[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId || !user) return;
    setLoading(true);
    try {
      setRows(await listMyAttendance(tenantId, user.uid, from, to));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId, user, from, to]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm text-muted">{t("hist.unavailable")}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <History size={18} className="mb-1 text-accent" aria-hidden="true" />
        <h2 className="mb-0.5 text-lg font-semibold text-content">{t("hist.title")}</h2>
        <div className="ml-auto flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t("hist.from")}
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1.5 text-sm text-content outline-none focus:border-accent" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            {t("hist.to")}
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1.5 text-sm text-content outline-none focus:border-accent" />
          </label>
          <button type="button" onClick={() => void load()} disabled={loading}
            className="mb-0.5 rounded-lg border border-overlay/10 bg-overlay/[0.04] p-2 text-muted transition hover:text-content disabled:opacity-50"
            aria-label={t("hist.refresh")}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted">{t("hist.desc")}</p>
      <p className="mb-3 text-xs text-muted">{t("hist.count", { count: rows?.length ?? 0 })}</p>

      {rows === null || loading ? (
        <p className="text-sm text-muted">{t("hist.loading")}</p>
      ) : rows.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> {t("hist.empty")}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-overlay/10 text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-medium">{t("hist.col.date")}</th>
                <th className="py-2 pr-4 font-medium">{t("hist.col.in")}</th>
                <th className="py-2 pr-4 font-medium">{t("hist.col.out")}</th>
                <th className="py-2 font-medium">{t("hist.col.status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-overlay/[0.06]">
                  <td className="py-2.5 pr-4 text-content">{r.date}</td>
                  <td className="py-2.5 pr-4 text-emerald-300">{formatAttendanceTime(r.checkIn)}</td>
                  <td className="py-2.5 pr-4 text-sky-300">{formatAttendanceTime(r.checkOut)}</td>
                  <td className="py-2.5">
                    {r.late ? (
                      <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-xs text-rose-300">
                        {t("hist.late")}{r.lateMinutes ? ` · ${r.lateMinutes} dk` : ""}
                      </span>
                    ) : r.checkIn ? (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-300">
                        {t("hist.onTime")}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
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
