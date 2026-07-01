"use client";

import { useEffect, useMemo, useState } from "react";
import { UserCheck, Clock, CheckCircle2, AlertCircle, Inbox, Users, DoorOpen } from "lucide-react";
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

/** "Teslim Edildi" sonrası yeşil onay animasyonu ne kadar ekranda kalsın. */
const CONFIRM_FLASH_MS = 1800;

type ViewMode = "class" | "schoolwide";

/**
 * Bekleme Odası / Sınıf Çağırma Ekranı — veli QR'ı ile "velisi bekliyor"
 * durumuna geçen öğrencileri CANLI listeler.
 *
 * İki görünüm modu vardır (öğretmen ikisini de değiştirebilir):
 *  - "Sınıfım": mesai saatleri içinde sınıfın kendi ekranı — yalnız o
 *    sınıf(lar)ın öğrencileri.
 *  - "Bekleme Odası": mesai bitiminden sonra farklı sınıflardan öğrencilerin
 *    toplandığı ortak oda ekranı — TÜM okul (danışma/SUPPORT ve yönetim
 *    yalnızca bunu görür, çünkü kendi sınıfları yoktur).
 *
 * "Teslim Edildi" — sınıfın kendi öğretmeniyle SINIRLI DEĞİLDİR; herhangi bir
 * öğretmen veya danışma/yönetim onaylayabilir (bekleme odasında nöbetçi kim
 * varsa). Sunucu API — bkz. `/api/attendance/mark-picked-up`.
 */
export function PickupWaitingBoard() {
  const { user, profile, firebaseReady } = useAuth();
  const t = useT();
  const tenantId = profile?.tenantId;
  const isSchoolWideRole = profile != null && SCHOOL_WIDE_ROLES.includes(profile.role);
  const isTeacher = profile?.role === ROLES.TEACHER;
  const teacherClassIds = useMemo(() => profile?.classIds ?? [], [profile?.classIds]);
  const usable =
    firebaseReady && Boolean(tenantId) && Boolean(user) && (isSchoolWideRole || isTeacher);

  // Öğretmen iki sekme arasında geçebilir; yönetim/danışma hep "Bekleme Odası".
  const [viewMode, setViewMode] = useState<ViewMode>("class");
  const effectiveMode: ViewMode = isSchoolWideRole ? "schoolwide" : viewMode;

  const [rows, setRows] = useState<StudentAttendanceLog[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [justConfirmed, setJustConfirmed] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!usable || !tenantId) return;
    if (effectiveMode === "schoolwide") {
      return watchTodayAttendanceSchoolWide(tenantId, setRows);
    }
    if (teacherClassIds.length > 0) {
      return watchTodayAttendanceForClasses(tenantId, teacherClassIds, setRows);
    }
    setRows([]);
  }, [usable, tenantId, effectiveMode, teacherClassIds]);

  const waiting = (rows ?? []).filter((r) => r.status === "awaiting_pickup");
  // Az önce "Teslim Edildi" denen ama Firestore'da hâlâ o kaydı gösteren
  // satırlar — kısa süre yeşil onay olarak ekranda kalsın (aniden kaybolmasın).
  const justDelivered = (rows ?? []).filter(
    (r) => r.status !== "awaiting_pickup" && justConfirmed[r.id],
  );
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
      setJustConfirmed((prev) => ({ ...prev, [logId]: true }));
      setTimeout(() => {
        setJustConfirmed((prev) => {
          const next = { ...prev };
          delete next[logId];
          return next;
        });
      }, CONFIRM_FLASH_MS);
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
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <UserCheck size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">
          {effectiveMode === "schoolwide" ? t("att.pickup.title") : t("att.pickup.classTitle")}
        </h2>
        <span className="ml-auto text-xs text-muted">
          {t("att.pickup.inSchoolCount", { count: inSchoolCount })}
        </span>
      </div>

      {/* Öğretmen için sekme geçişi — yönetim/danışmanın "sınıfı" olmadığından görmez. */}
      {isTeacher && (
        <div className="mb-4 inline-flex rounded-xl border border-overlay/10 bg-overlay/[0.03] p-1">
          <button
            type="button"
            onClick={() => setViewMode("class")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              viewMode === "class" ? "bg-accent/15 text-accent" : "text-muted hover:text-content"
            }`}
          >
            <Users size={13} aria-hidden="true" /> {t("att.pickup.tabClass")}
          </button>
          <button
            type="button"
            onClick={() => setViewMode("schoolwide")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              viewMode === "schoolwide" ? "bg-accent/15 text-accent" : "text-muted hover:text-content"
            }`}
          >
            <DoorOpen size={13} aria-hidden="true" /> {t("att.pickup.tabWaitingRoom")}
          </button>
        </div>
      )}

      <p className="mb-4 text-sm text-muted">
        {effectiveMode === "schoolwide" ? t("att.pickup.desc") : t("att.pickup.classDesc")}
      </p>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
          <AlertCircle size={16} aria-hidden="true" /> {error}
        </p>
      )}

      {rows === null ? (
        <p className="text-sm text-muted">{t("att.pickup.loading")}</p>
      ) : waiting.length === 0 && justDelivered.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Inbox size={15} aria-hidden="true" /> {t("att.pickup.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {justDelivered.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 transition-colors"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/15 text-emerald-300">
                <CheckCircle2 size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-content">{row.studentName}</p>
                <p className="text-xs text-emerald-300">{t("att.pickup.delivered")}</p>
              </div>
            </li>
          ))}
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
