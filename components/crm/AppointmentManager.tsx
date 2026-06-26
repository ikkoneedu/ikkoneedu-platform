"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarClock, Plus, AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { DataExportButtons } from "@/components/shared/DataExportButtons";
import { useT } from "@/components/i18n/LocaleProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  APPOINTMENT_STATUSES,
  createAppointment,
  listAppointments,
  setAppointmentStatus,
  type AppointmentRecord,
  type AppointmentStatus,
} from "@/lib/services/appointments";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const STAFF_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.PR,
  ROLES.SALES,
  ROLES.SUPER_ADMIN,
];

const STATUS_STYLE: Record<string, string> = {
  SCHEDULED: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  VISITED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  CANCELLED: "border-brand/30 bg-brand/10 text-brand",
};

/**
 * Randevu Yönetimi — GERÇEK Firestore (`appointments`). CRM pipeline'ının
 * APPOINTMENT aşaması: aday veli görüşme randevuları. Tenant izole.
 */
export function AppointmentManager() {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canManage = profile != null && STAFF_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canManage;

  const [rows, setRows] = useState<AppointmentRecord[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!tenantId) return;
    setRefreshing(true);
    try {
      setRows(await listAppointments(tenantId));
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

  const add = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tenantId || !user || busy) return;
    const f = new FormData(e.currentTarget);
    const parentName = String(f.get("parentName") ?? "").trim();
    const studentName = String(f.get("studentName") ?? "").trim();
    const phone = String(f.get("phone") ?? "").trim();
    const date = String(f.get("date") ?? "");
    const time = String(f.get("time") ?? "");
    if (!parentName || !date) {
      setError(t("panelCrm.appointments.requiredError"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await createAppointment(tenantId, { parentName, studentName, phone, date, time, createdBy: user.uid });
      e.currentTarget.reset();
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (id: string, status: AppointmentStatus) => {
    if (!tenantId || savingId) return;
    setSavingId(id);
    try {
      await setAppointmentStatus(tenantId, id, status);
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <CalendarClock size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("panelCrm.appointments.title")}</h2>
        <span className="text-xs text-muted">{rows?.length ?? 0}</span>
        <button
          type="button"
          onClick={() => void load()}
          disabled={refreshing}
          className="ml-auto text-muted transition hover:text-content disabled:opacity-50"
          aria-label={t("panelCrm.appointments.refresh")}
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
        {(rows?.length ?? 0) > 0 && (
          <DataExportButtons
            filename={t("panelCrm.appointments.exportFilename")}
            title={t("panelCrm.appointments.exportTitle")}
            formats={["pdf", "csv"]}
            columns={[
              { key: "date", label: t("panelCrm.appointments.colDate") },
              { key: "time", label: t("panelCrm.appointments.colTime") },
              { key: "parentName", label: t("panelCrm.appointments.colParent") },
              { key: "studentName", label: t("panelCrm.appointments.colStudent") },
              { key: "phone", label: t("panelCrm.appointments.colPhone") },
              { key: "status", label: t("panelCrm.appointments.colStatus") },
            ]}
            rows={(rows ?? []) as unknown as Record<string, unknown>[]}
          />
        )}
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm text-brand">
          <AlertCircle size={15} aria-hidden="true" /> {error}
        </p>
      )}

      <form onSubmit={add} className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
        <TextField label={t("panelCrm.appointments.parent")} name="parentName" placeholder={t("panelCrm.appointments.parentPlaceholder")} required />
        <TextField label={t("panelCrm.appointments.student")} name="studentName" placeholder={t("panelCrm.appointments.studentPlaceholder")} />
        <TextField label={t("panelCrm.appointments.phone")} name="phone" type="tel" placeholder={t("panelCrm.appointments.phonePlaceholder")} />
        <TextField label={t("panelCrm.appointments.date")} name="date" type="date" required />
        <TextField label={t("panelCrm.appointments.time")} name="time" type="time" />
        <PrimaryButton type="submit" size="md" disabled={busy}>
          <Plus size={16} aria-hidden="true" />
          {busy ? t("panelCrm.appointments.adding") : t("panelCrm.appointments.add")}
        </PrimaryButton>
      </form>

      {rows === null ? (
        <p className="text-sm text-muted">{t("panelCrm.appointments.loading")}</p>
      ) : rows.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> {t("panelCrm.appointments.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 rounded-lg border border-overlay/10 bg-overlay/[0.03] p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-medium text-content">{r.parentName}</span>
                {r.studentName && <span className="ml-2 text-xs text-muted">{r.studentName}</span>}
                <p className="mt-0.5 text-xs text-muted">
                  {r.date} {r.time} {r.phone ? `· ${r.phone}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLE[r.status]}`}>
                  {t(`panelCrm.appointmentStatus.${r.status}`)}
                </span>
                <select
                  value={r.status}
                  disabled={savingId === r.id}
                  onChange={(e) => changeStatus(r.id, e.target.value as AppointmentStatus)}
                  className="rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2 py-1 text-xs text-content outline-none focus:border-accent disabled:opacity-50"
                  aria-label={t("panelCrm.appointments.statusAriaLabel")}
                >
                  {APPOINTMENT_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-surface">
                      {t(`panelCrm.appointmentStatus.${s}`)}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
