"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarDays, Plus, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { TextField } from "@/components/shared/TextField";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listMyClasses, type ClassRecord } from "@/lib/services/access-codes";
import {
  createScheduleEntry,
  listSchedule,
  WEEKDAYS,
  type ScheduleEntry,
} from "@/lib/services/schedule";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";
import { useT } from "@/components/i18n/LocaleProvider";

const STAFF_ROLES = [
  ROLES.TEACHER,
  ROLES.COORDINATOR,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.SUPER_ADMIN,
] as const;

/**
 * Ders programı panosu — personel program ekler; öğrenci/veli kendi sınıfının
 * programını görür. Yalnızca giriş yapmış kullanıcı + Firebase aktifken görünür.
 */
export function ScheduleBoard({ readOnly = false }: { readOnly?: boolean }) {
  const t = useT();
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isStaff =
    profile != null && (STAFF_ROLES as readonly string[]).includes(profile.role);
  const isTeacher = profile?.role === ROLES.TEACHER;
  // Veli/öğrenci paneli (readOnly): program düzenleme formu hiç gösterilmez.
  const canCompose = !readOnly && isStaff;

  const [entries, setEntries] = useState<ScheduleEntry[] | null>(null);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setEntries(await listSchedule(tenantId));
      if (isTeacher && user) setClasses(await listMyClasses(tenantId, user.uid));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, isTeacher, user]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = String(data.get("subject") ?? "").trim();
    const startTime = String(data.get("startTime") ?? "").trim();
    const day = Number(data.get("day") ?? 0);
    const classId = String(data.get("classId") ?? "").trim() || undefined;
    const className = classes.find((c) => c.id === classId)?.name;
    if (!subject || !startTime) return;

    setBusy(true);
    setError(null);
    try {
      await createScheduleEntry({
        tenantId,
        classId,
        className,
        day,
        startTime,
        subject,
        teacherName: profile?.displayName ?? "Öğretmen",
      });
      form.reset();
      await refresh();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || !tenantId || entries === null) return null;

  // Öğrenci/veli yalnızca kendi sınıfının (veya okul geneli) programını görür.
  const myClassId = profile.classId;
  const visible = isStaff
    ? entries
    : entries.filter((e) => !e.classId || e.classId === myClassId);

  return (
    <div className="flex flex-col gap-6">
      {canCompose && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">{t("boardB.schedule.addHeading")}</h2>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">{t("boardB.schedule.dayLabel")}</label>
              <select name="day" defaultValue="0" className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                {WEEKDAYS.map((d, i) => (
                  <option key={d} value={i} className="bg-surface">{d}</option>
                ))}
              </select>
            </div>
            <TextField label={t("boardB.schedule.timeLabel")} name="startTime" type="time" required />
            <TextField label={t("boardB.schedule.subjectLabel")} name="subject" placeholder={t("boardB.schedule.subjectPlaceholder")} required />
            {isTeacher && classes.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">{t("boardB.schedule.classLabel")}</label>
                <select name="classId" defaultValue="" className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                  <option value="" className="bg-surface">{t("boardB.schedule.wholeSchool")}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <input type="hidden" name="classId" value="" />
            )}
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Plus size={16} aria-hidden="true" />
              {t("boardB.schedule.add")}
            </PrimaryButton>
          </form>
          {error && (
            <p className="mt-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
              <AlertCircle size={16} aria-hidden="true" />
              {error}
            </p>
          )}
        </GlassCard>
      )}

      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <CalendarDays size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("boardB.schedule.heading")}</h2>
        </div>
        {visible.length === 0 ? (
          <p className="text-sm text-muted">{t("boardB.schedule.empty")}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {WEEKDAYS.map((dayName, dayIdx) => {
              const dayEntries = visible.filter((e) => e.day === dayIdx);
              if (dayEntries.length === 0) return null;
              return (
                <div key={dayName}>
                  <h3 className="mb-2 text-sm font-semibold text-accent">{dayName}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {dayEntries.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center gap-3 rounded-lg border border-overlay/10 bg-overlay/[0.03] px-3 py-2 text-sm"
                      >
                        <span className="font-mono text-muted">{e.startTime}</span>
                        <span className="font-medium text-content">{e.subject}</span>
                        <span className="ml-auto text-xs text-muted">
                          {e.className || t("boardB.schedule.wholeSchool")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
