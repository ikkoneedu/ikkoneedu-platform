"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, Clock, Bell, FileText, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import {
  listSchedule,
  WEEKDAYS,
  type ScheduleEntry,
} from "@/lib/services/schedule";
import {
  nextLessonForTeacher,
  REMINDER_OFFSET_MIN,
} from "@/lib/services/lesson-reminders";
import { printToPDF } from "@/lib/export/download";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

/**
 * Öğretmenin kendi ders programı — giriş yaptığında haftalık programını görür.
 *
 * Ek olarak BUGÜNKÜ sıradaki dersi canlı geri sayımla gösterir ve ders
 * başlamadan 10 dk önce tarayıcı/uygulama içi hatırlatma verir. (Uygulama açık
 * değilken gönderim için cron/Cloud Function altyapısı `lesson-reminders`
 * servisinde hazırdır; bağlanması sonraki adımda.)
 */
export function MyTimetable() {
  const { user, profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const isTeacher = profile?.role === ROLES.TEACHER;
  const uid = user?.uid ?? "";
  const displayName = profile?.displayName ?? "";

  const [entries, setEntries] = useState<ScheduleEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const notifiedRef = useRef<Set<string>>(new Set());
  const [banner, setBanner] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!tenantId) return;
    try {
      setEntries(await listSchedule(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId]);

  useEffect(() => {
    if (firebaseReady && tenantId) void refresh();
  }, [firebaseReady, tenantId, refresh]);

  // Canlı saat — 30 sn'de bir geri sayımı tazeler.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Tarayıcı bildirim izni (kullanıcı reddederse uygulama içi banner'a düşer).
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      void Notification.requestPermission();
    }
  }, []);

  /** Yalnızca bu öğretmenin dersleri. */
  const mine = useMemo(
    () =>
      (entries ?? []).filter(
        (e) =>
          e.teacherUid === uid ||
          (!!displayName && e.teacherName === displayName),
      ),
    [entries, uid, displayName],
  );

  const next = useMemo(
    () =>
      entries
        ? nextLessonForTeacher(entries, uid, displayName, now)
        : null,
    [entries, uid, displayName, now],
  );

  // 10 dk eşiği — ders başına bir kez hatırlat.
  useEffect(() => {
    if (!next) return;
    if (next.minutesUntil > REMINDER_OFFSET_MIN || next.minutesUntil < 0) return;
    const key = `${next.entry.day}-${next.entry.startTime}-${next.entry.subject}`;
    if (notifiedRef.current.has(key)) return;
    notifiedRef.current.add(key);
    const msg = `${next.minutesUntil} dk sonra ${next.entry.className} · ${next.entry.subject} (${next.entry.startTime})`;
    setBanner(msg);
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("Ders Hatırlatması", { body: msg });
      } catch {
        /* sessiz geç */
      }
    }
  }, [next]);

  const slots = useMemo(() => {
    const set = new Set(mine.map((e) => e.startTime));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [mine]);

  const grid = useMemo(() => {
    const map = new Map<string, ScheduleEntry>();
    for (const e of mine) map.set(`${e.day}|${e.startTime}`, e);
    return map;
  }, [mine]);

  const exportPDF = () => {
    const head = `<tr><th>Saat</th>${WEEKDAYS.map((d) => `<th>${d}</th>`).join("")}</tr>`;
    const body = slots
      .map((slot) => {
        const cells = WEEKDAYS.map((_, day) => {
          const e = grid.get(`${day}|${slot}`);
          return `<td>${
            e ? `<strong>${e.subject}</strong><br/><small>${e.className}</small>` : ""
          }</td>`;
        }).join("");
        return `<tr><td><strong>${slot}</strong></td>${cells}</tr>`;
      })
      .join("");
    printToPDF(
      `${displayName} — Ders Programım`,
      `<h1>${displayName} — Ders Programım</h1>` +
        `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;text-align:center;font-size:12px"><thead>${head}</thead><tbody>${body}</tbody></table>`,
    );
  };

  if (!firebaseReady || !profile || !tenantId || !isTeacher) return null;
  if (entries === null) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Sıradaki ders + canlı hatırlatma */}
      <GlassCard tone="navy">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent">
            <Clock size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted">Bugünkü sıradaki dersiniz</p>
            {next ? (
              <p className="text-base font-semibold text-content">
                {next.entry.startTime} · {next.entry.className} ·{" "}
                {next.entry.subject}
                <span className="ml-2 text-sm font-normal text-accent">
                  {next.minutesUntil === 0
                    ? "şimdi"
                    : `${next.minutesUntil} dk sonra`}
                </span>
              </p>
            ) : (
              <p className="text-base font-semibold text-content">
                Bugün başka dersiniz yok.
              </p>
            )}
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-overlay/10 bg-overlay/[0.03] px-3 py-1 text-xs text-muted">
            <Bell size={13} aria-hidden="true" />
            Ders öncesi {REMINDER_OFFSET_MIN} dk hatırlatma
          </span>
        </div>
        {banner && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
            <Bell size={16} aria-hidden="true" />
            {banner}
          </p>
        )}
      </GlassCard>

      {/* Haftalık program */}
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <CalendarDays size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">Ders Programım</h2>
          {mine.length > 0 && (
            <PrimaryButton
              type="button"
              variant="secondary"
              size="sm"
              className="ml-auto"
              onClick={exportPDF}
            >
              <FileText size={15} aria-hidden="true" /> PDF
            </PrimaryButton>
          )}
        </div>

        {mine.length === 0 ? (
          <p className="text-sm text-muted">
            Henüz size atanmış ders yok. Okul yönetimi ders programını
            oluşturduğunda burada görünür.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border border-overlay/10 bg-overlay/[0.03] px-2 py-2 text-left text-xs font-semibold text-muted">
                    Saat
                  </th>
                  {WEEKDAYS.map((d) => (
                    <th
                      key={d}
                      className="border border-overlay/10 bg-overlay/[0.03] px-2 py-2 text-left text-xs font-semibold text-accent"
                    >
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot}>
                    <td className="border border-overlay/10 px-2 py-2 font-mono text-xs text-muted">
                      {slot}
                    </td>
                    {WEEKDAYS.map((_, day) => {
                      const e = grid.get(`${day}|${slot}`);
                      return (
                        <td
                          key={day}
                          className="border border-overlay/10 px-2 py-2 align-top"
                        >
                          {e ? (
                            <div>
                              <div className="font-medium text-content">
                                {e.subject}
                              </div>
                              <div className="text-[11px] text-muted">
                                {e.className}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted/40">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" /> {error}
          </p>
        )}
      </GlassCard>
    </div>
  );
}
