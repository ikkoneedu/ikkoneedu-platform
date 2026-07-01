"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlarmClock,
  RefreshCw,
  AlertCircle,
  Inbox,
  Send,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listStaffAlerts,
  askAlertReason,
  type StaffAlert,
} from "@/lib/services/staff-alerts";
import { formatAttendanceTime } from "@/lib/services/staff-attendance";
import { departmentLabel } from "@/lib/staff/departments";
import { whatsappLink } from "@/lib/util/whatsapp";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

// Sebep sorma yalnızca Genel Müdür (+Kurucu/Süper Admin) — Firestore kuralları
// (isGeneralManager()) ile birebir eşleşir. Diğer yönetim rolleri salt okur.
const GENERAL_MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.SUPER_ADMIN,
];

const STATUS_STYLE: Record<string, string> = {
  open: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  asked: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  answered: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
};

/** Geç Giriş Uyarıları (yönetim) — sebep sor + WhatsApp. */
export function StaffAlertsManager() {
  const { profile, firebaseReady } = useAuth();
  const t = useT();
  const tenantId = profile?.tenantId;
  const usable = firebaseReady && Boolean(tenantId) && profile != null && MANAGER_ROLES.includes(profile.role);
  const canAsk = profile != null && GENERAL_MANAGER_ROLES.includes(profile.role);

  const [rows, setRows] = useState<StaffAlert[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      setRows(await listStaffAlerts(tenantId));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (usable) void load();
  }, [usable, load]);

  const ask = async (a: StaffAlert) => {
    if (!tenantId) return;
    const q = (drafts[a.id] ?? "").trim();
    if (!q) return;
    setBusyId(a.id);
    try {
      await askAlertReason(tenantId, a.id, q);
      await load();
    } catch {
      /* sessizce */
    } finally {
      setBusyId(null);
    }
  };

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm text-muted">{t("sched2.unavailable")}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard tone="navy">
      <div className="mb-3 flex items-center gap-2">
        <AlarmClock size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("alert.title")}</h2>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
          aria-label={t("hist.refresh")}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      <p className="mb-4 text-sm text-muted">{t("alert.desc")}</p>

      {rows === null || loading ? (
        <p className="text-sm text-muted">{t("hist.loading")}</p>
      ) : rows.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> {t("alert.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((a) => {
            const badgeLabel =
              a.type === "early_leave"
                ? t("alert.earlyBy", { minutes: a.lateMinutes, time: formatAttendanceTime(a.checkOut) })
                : t("alert.lateBy", { minutes: a.lateMinutes, time: formatAttendanceTime(a.checkIn) });
            const wa = whatsappLink(a.phone, badgeLabel);
            return (
              <li key={a.id} className="rounded-xl border border-overlay/10 bg-overlay/[0.03] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-content">{a.name || a.uid}</span>
                  {a.department && (
                    <span className="text-xs text-muted">· {departmentLabel(a.department)}</span>
                  )}
                  <span className="text-xs text-muted">· {a.date}</span>
                  <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2 py-0.5 text-xs text-rose-300">
                    {badgeLabel}
                  </span>
                  <span className={`ml-auto rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[a.status]}`}>
                    {t(`alert.status.${a.status}`)}
                  </span>
                </div>

                {a.status === "open" && canAsk && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      value={drafts[a.id] ?? ""}
                      onChange={(e) => setDrafts((d) => ({ ...d, [a.id]: e.target.value }))}
                      placeholder={t("alert.questionPlaceholder")}
                      className="min-w-[200px] flex-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
                    />
                    <PrimaryButton type="button" size="sm" onClick={() => void ask(a)} disabled={busyId === a.id}>
                      <Send size={14} aria-hidden="true" /> {t("alert.send")}
                    </PrimaryButton>
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-400/20"
                      >
                        <MessageCircle size={14} aria-hidden="true" /> WhatsApp
                      </a>
                    )}
                  </div>
                )}

                {a.status === "open" && !canAsk && (
                  <p className="mt-3 text-xs text-muted">{t("alert.askOnlyGeneralManager")}</p>
                )}

                {a.status !== "open" && (
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-muted">
                      <span className="font-medium text-content/70">{t("alert.question")}:</span> {a.question}
                    </p>
                    {a.answer ? (
                      <p className="flex items-start gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-content">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true" />
                        <span><span className="font-medium text-content/70">{t("alert.answer")}:</span> {a.answer}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-muted">{t("alert.noAnswer")}</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}
