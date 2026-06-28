"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Save,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES, ROLE_LABELS } from "@/lib/auth/role-constants";
import { listTenantUsers, type TenantUser } from "@/lib/services/users";
import {
  getStaffSchedule,
  saveStaffSchedule,
  DEFAULT_SCHEDULE,
  type StaffSchedule,
} from "@/lib/services/staff-schedule";
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
const NON_STAFF: string[] = [ROLES.PARENT, ROLES.STUDENT, ROLES.PUBLIC];
const DAYS = [1, 2, 3, 4, 5, 6, 7];

/**
 * Personel Mesai & İzin yönetimi (yönetim).
 * Personeli listeden seçer (isim aramadan), mesai saatlerini, çalışma günlerini
 * ve yıllık izin aralığını düzenler. WhatsApp ile doğrudan mesaj.
 */
export function StaffScheduleManager() {
  const { user, profile, firebaseReady } = useAuth();
  const t = useT();
  const tenantId = profile?.tenantId;
  const canManage = profile != null && MANAGER_ROLES.includes(profile.role);
  const usable = firebaseReady && Boolean(tenantId) && canManage;

  const [staff, setStaff] = useState<TenantUser[]>([]);
  const [selectedUid, setSelectedUid] = useState("");
  const [form, setForm] = useState<Omit<StaffSchedule, "uid">>(DEFAULT_SCHEDULE);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usable || !tenantId) return;
    let active = true;
    void (async () => {
      const rows = await listTenantUsers(tenantId);
      if (active) setStaff(rows.filter((u) => !NON_STAFF.includes(u.role)));
    })();
    return () => {
      active = false;
    };
  }, [usable, tenantId]);

  const selected = useMemo(
    () => staff.find((s) => s.uid === selectedUid) ?? null,
    [staff, selectedUid],
  );

  const loadSchedule = useCallback(
    async (uid: string) => {
      if (!tenantId) return;
      const sch = await getStaffSchedule(tenantId, uid);
      setForm(sch ? { ...sch } : { ...DEFAULT_SCHEDULE });
      setSaved(false);
      setError(null);
    },
    [tenantId],
  );

  const onSelect = (uid: string) => {
    setSelectedUid(uid);
    if (uid) void loadSchedule(uid);
  };

  const toggleDay = (d: number) =>
    setForm((f) => ({
      ...f,
      workdays: f.workdays.includes(d)
        ? f.workdays.filter((x) => x !== d)
        : [...f.workdays, d].sort((a, b) => a - b),
    }));

  const save = async () => {
    if (!tenantId || !selected || !user) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await saveStaffSchedule(
        tenantId,
        selected.uid,
        { ...form, name: selected.displayName, department: selected.department },
        user.uid,
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError(t("sched2.err"));
    } finally {
      setBusy(false);
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

  const wa = selected ? whatsappLink(selected.phone) : null;

  return (
    <GlassCard tone="navy">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("sched2.title")}</h2>
      </div>
      <p className="mb-5 text-sm text-muted">{t("sched2.desc")}</p>

      {/* Personel seçimi */}
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
          {t("sched2.selectStaff")}
          <select
            value={selectedUid}
            onChange={(e) => onSelect(e.target.value)}
            className="min-w-[240px] rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
          >
            <option value="" className="bg-surface">{t("sched2.selectPlaceholder")}</option>
            {staff.map((s) => (
              <option key={s.uid} value={s.uid} className="bg-surface">
                {(s.displayName || s.email)} · {ROLE_LABELS[s.role] ?? s.role}
                {s.department ? ` · ${departmentLabel(s.department)}` : ""}
              </option>
            ))}
          </select>
        </label>
        {selected && (
          <a
            href={wa ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`mb-0.5 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
              wa
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                : "pointer-events-none border-overlay/10 bg-overlay/[0.03] text-muted/50"
            }`}
            title={wa ? undefined : t("sched2.noPhone")}
          >
            <MessageCircle size={15} aria-hidden="true" />
            {t("sched2.whatsapp")}
          </a>
        )}
      </div>

      {selected && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
              {t("sched2.startTime")}
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
              {t("sched2.endTime")}
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
              {t("sched2.grace")}
              <input
                type="number"
                min={0}
                max={120}
                value={form.graceMinutes}
                onChange={(e) => setForm((f) => ({ ...f, graceMinutes: Number(e.target.value) || 0 }))}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-muted">{t("sched2.workdays")}</p>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    form.workdays.includes(d)
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : "border-overlay/10 bg-overlay/[0.03] text-muted hover:text-content"
                  }`}
                >
                  {t(`sched2.day.${d}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
              {t("sched2.leaveStart")}
              <input
                type="date"
                value={form.leaveStart}
                onChange={(e) => setForm((f) => ({ ...f, leaveStart: e.target.value }))}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-muted">
              {t("sched2.leaveEnd")}
              <input
                type="date"
                value={form.leaveEnd}
                onChange={(e) => setForm((f) => ({ ...f, leaveEnd: e.target.value }))}
                className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
              />
            </label>
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-brand">
              <AlertCircle size={15} aria-hidden="true" /> {error}
            </p>
          )}

          <PrimaryButton type="button" size="md" className="w-full sm:w-fit" onClick={save} disabled={busy}>
            {saved ? <CheckCircle2 size={16} aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
            {busy ? t("sched2.saving") : saved ? t("sched2.saved") : t("sched2.save")}
          </PrimaryButton>
        </div>
      )}
    </GlassCard>
  );
}
