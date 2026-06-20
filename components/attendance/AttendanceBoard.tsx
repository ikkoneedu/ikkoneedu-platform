"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CalendarCheck, Send, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listMyCodes } from "@/lib/services/access-codes";
import {
  markAttendance,
  getAttendance,
  ATTENDANCE_LABELS,
  type AttendanceEntry,
  type AttendanceStatus,
} from "@/lib/services/attendance";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

interface Student {
  uid: string;
  name: string;
}

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  present: "border-emerald-400/30 bg-emerald-400/10 text-emerald-400",
  absent: "border-brand/30 bg-brand/10 text-brand",
  late: "border-amber-400/30 bg-amber-400/10 text-amber-400",
  excused: "border-accent/30 bg-accent/10 text-accent",
};

/**
 * Yoklama panosu. Öğretmen yoklama girer; öğrenci kendi, veli bağlı öğrencisinin
 * yoklamasını görür. Yalnızca giriş yapmış kullanıcı + Firebase aktifken görünür.
 */
export function AttendanceBoard() {
  const { user, profile, firebaseReady } = useAuth();
  const myUid = user?.uid;
  const tenantId = profile?.tenantId;
  const isTeacher = profile?.role === ROLES.TEACHER;
  const isStudent = profile?.role === ROLES.STUDENT;
  const isParent = profile?.role === ROLES.PARENT;

  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [records, setRecords] = useState<AttendanceEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const viewedUid = isStudent
    ? myUid
    : isParent
      ? profile?.linkedStudentIds?.[0]
      : selected;

  useEffect(() => {
    if (!firebaseReady || !profile || !tenantId || !isTeacher || !myUid) return;
    let active = true;
    void (async () => {
      const codes = await listMyCodes(tenantId, myUid);
      const list = codes
        .filter((c) => c.role === ROLES.STUDENT)
        .map((c) => ({ uid: c.uid, name: c.displayName }));
      if (active) {
        setStudents(list);
        setSelected(list[0]?.uid ?? "");
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, profile, tenantId, isTeacher, myUid]);

  const load = useCallback(async () => {
    if (!viewedUid) {
      setRecords([]);
      return;
    }
    setRecords(await getAttendance(viewedUid));
  }, [viewedUid]);

  useEffect(() => {
    if (firebaseReady && profile) void load();
  }, [firebaseReady, profile, load]);

  const handleMark = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !selected || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const date = String(data.get("date") ?? "").trim();
    const status = String(data.get("status") ?? "present") as AttendanceStatus;
    if (!date) return;

    setBusy(true);
    setError(null);
    try {
      await markAttendance({
        tenantId,
        studentUid: selected,
        date,
        status,
        byName: profile?.displayName ?? "Öğretmen",
      });
      await load();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!firebaseReady || !profile || records === null) return null;
  if (!isTeacher && !isStudent && !isParent) return null;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      {isTeacher && (
        <GlassCard tone="navy">
          <div className="mb-4 flex items-center gap-2">
            <CalendarCheck size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">Yoklama Gir</h2>
          </div>
          {students.length === 0 ? (
            <p className="text-sm text-muted">Önce öğrenci kodu üretin.</p>
          ) : (
            <form onSubmit={handleMark} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Öğrenci</label>
                <select value={selected} onChange={(e) => setSelected(e.target.value)} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                  {students.map((s) => (
                    <option key={s.uid} value={s.uid} className="bg-surface">{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Tarih</label>
                <input type="date" name="date" defaultValue={today} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted">Durum</label>
                <select name="status" defaultValue="present" className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent">
                  {(Object.keys(ATTENDANCE_LABELS) as AttendanceStatus[]).map((s) => (
                    <option key={s} value={s} className="bg-surface">{ATTENDANCE_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <PrimaryButton type="submit" size="md" disabled={busy}>
                <Send size={16} aria-hidden="true" />
                Kaydet
              </PrimaryButton>
            </form>
          )}
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
          <CalendarCheck size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">
            {isTeacher ? "Öğrenci Yoklaması" : "Yoklama Geçmişim"}
          </h2>
        </div>
        {records.length === 0 ? (
          <p className="text-sm text-muted">Henüz yoklama kaydı yok.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {records.map((r, i) => (
              <li
                key={`${r.date}-${i}`}
                className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
              >
                <span className="font-mono text-muted">{r.date}</span>
                <span
                  className={["ml-auto rounded-full border px-2.5 py-0.5 text-xs", STATUS_STYLE[r.status]].join(" ")}
                >
                  {ATTENDANCE_LABELS[r.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
