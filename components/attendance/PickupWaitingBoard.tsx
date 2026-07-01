"use client";

import { useEffect, useMemo, useState } from "react";
import { UserCheck, Clock, CheckCircle2, AlertCircle, Inbox } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  watchTodayAttendanceSchoolWide,
  watchTodayAttendanceForClasses,
  type StudentAttendanceLog,
} from "@/lib/services/student-attendance";
import { formatAttendanceTime } from "@/lib/services/staff-attendance";

const SCHOOL_WIDE_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR, ROLES.SUPPORT, ROLES.SUPER_ADMIN,
];

/**
 * Bekleme Odası / Çağırma Ekranı — veli QR'ı ile "velisi bekliyor" durumuna
 * geçen öğrencileri CANLI listeler. Yönetim/danışma (SUPPORT) tüm okulu,
 * öğretmen yalnız kendi sınıf(lar)ını görür (Firestore kuralları zorlar).
 * "Teslim Edildi" ile öğrenci listeden kalkar (sunucu API — bkz.
 * `/api/attendance/mark-picked-up`).
 */
export function PickupWaitingBoard() {
  const { user, profile, firebaseReady } = useAuth();
  const t = useT();
  const tenantId = profile?.tenantId;
  const isSchoolWide = profile != null && SCHOOL_WIDE_ROLES.includes(profile.role);
  const isTeacher = profile?.role === ROLES.TEACHER;
  const teacherClassIds = useMemo(() => profile?.classIds ?? [], [profile?.classIds]);
  const usable =
    firebaseReady && Boolean(tenantId) && Boolean(user) && (isSchoolWide || isTeacher);

  const [rows, setRows] = useState<StudentAttendanceLog[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usable || !tenantId) return;
    if (isSchoolWide) {
      return watchTodayAttendanceSchoolWide(tenantId, setRows);
    }
    if (isTeacher && teacherClassIds.length > 0) {
      return watchTodayAttendanceForClasses(tenantId, teacherClassIds, setRows);
    }
    setRows([]);
  }, [usable, tenantId, isSchoolWide, isTeacher, teacherClassIds]);

  const waiting = (rows ?? []).filter((r) => r.status === "awaiting_pickup");
  const inSchoolCount = (rows ?? []).filter((r) => r.status === "in_school").length;

  const markPickedUp = async (logId: string) => {
    if (!user || busyId) return;
    setBusyId(logId);
    setError(null);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/attendance/mark-picked-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, logId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    } catch (e) {
      setError(String((e as Error)?.message ?? e));
    } finally {
      setBusyId(null);
    }
  };

  if (!usable) {
    return (
      <GlassCard tone="navy" className="flex items-start gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm text-muted">{t("att.pickup.unavailable")}</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard tone="navy">
      <div className="mb-3 flex items-center gap-2">
        <UserCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">{t("att.pickup.title")}</h2>
        <span className="ml-auto text-xs text-muted">
          {t("att.pickup.inSchoolCount", { count: inSchoolCount })}
        </span>
      </div>
      <p className="mb-4 text-sm text-muted">{t("att.pickup.desc")}</p>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {rows === null ? (
        <p className="text-sm text-muted">{t("att.pickup.loading")}</p>
      ) : waiting.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> {t("att.pickup.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {waiting.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/[0.06] px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300">
                <Clock size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-content">{row.studentName}</p>
                <p className="text-xs text-muted">
                  {t("att.pickup.waitingSince", { time: formatAttendanceTime(row.checkOut) })}
                </p>
              </div>
              <PrimaryButton
                type="button"
                size="sm"
                disabled={busyId === row.id}
                onClick={() => void markPickedUp(row.id)}
              >
                <CheckCircle2 size={14} aria-hidden="true" /> {t("att.pickup.markDone")}
              </PrimaryButton>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
