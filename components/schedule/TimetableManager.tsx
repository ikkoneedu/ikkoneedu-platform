"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, AlertCircle, Loader2, Save, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listStructureClasses, type SchoolClass } from "@/lib/services/classes";
import {
  buildTimeSlots,
  createScheduleEntry,
  deleteScheduleEntry,
  listClassSchedule,
  updateScheduleEntry,
  WEEKDAYS,
  type ScheduleEntry,
} from "@/lib/services/schedule";
import { getSettings } from "@/lib/services/settings";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

interface CellDraft {
  subject: string;
  teacherName: string;
}

/**
 * Ders programı düzenleyici — sınıf bazlı haftalık ızgara.
 *
 * Yönetici bir sınıf seçer; sistem ayarlardaki ders saatlerinden (başlangıç,
 * süre, teneffüs) saat dilimlerini üretir ve gün × saat ızgarası gösterir.
 * Her hücreye ders + öğretmen yazılır; kayıt `scheduleEntries`'e `classId` ile
 * bağlanır. Hücre boşaltılırsa kayıt silinir.
 */
export function TimetableManager() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canManage = profile != null && MANAGER_ROLES.includes(profile.role);

  const [classes, setClasses] = useState<SchoolClass[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [slots, setSlots] = useState<string[]>([]);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CellDraft>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedClass = classes?.find((c) => c.id === selectedId) ?? null;

  /** Sınıf listesi + ayar saat dilimleri yüklenir. */
  useEffect(() => {
    if (!firebaseReady || !tenantId) return;
    let active = true;
    void (async () => {
      try {
        const [cls, tt] = await Promise.all([
          listStructureClasses(tenantId),
          getSettings(tenantId, "timetable"),
        ]);
        if (!active) return;
        setClasses(cls);
        setSlots(
          buildTimeSlots(
            tt.lessonStart || "09:00",
            Number(tt.lessonDuration) || 40,
            Number(tt.breakDuration) || 10,
            8,
          ),
        );
        if (cls.length > 0) setSelectedId((prev) => prev || cls[0].id);
      } catch (err) {
        if (active) setError(getAuthErrorMessage(err));
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseReady, tenantId]);

  /** Seçili sınıfın mevcut programını yükler. */
  const refreshEntries = useCallback(async () => {
    if (!tenantId || !selectedId) {
      setEntries([]);
      return;
    }
    try {
      setEntries(await listClassSchedule(tenantId, selectedId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  }, [tenantId, selectedId]);

  useEffect(() => {
    void refreshEntries();
  }, [refreshEntries]);

  /** (gün, saat) → mevcut kayıt eşlemesi. */
  const entryMap = useMemo(() => {
    const map = new Map<string, ScheduleEntry>();
    for (const e of entries) map.set(`${e.day}|${e.startTime}`, e);
    return map;
  }, [entries]);

  const cellKey = (day: number, slot: string) => `${day}|${slot}`;

  const draftFor = (day: number, slot: string): CellDraft => {
    const key = cellKey(day, slot);
    if (drafts[key]) return drafts[key];
    const existing = entryMap.get(key);
    return {
      subject: existing?.subject ?? "",
      teacherName: existing?.teacherName ?? "",
    };
  };

  const setDraft = (day: number, slot: string, patch: Partial<CellDraft>) => {
    const key = cellKey(day, slot);
    setDrafts((prev) => ({
      ...prev,
      [key]: { ...draftFor(day, slot), ...patch },
    }));
  };

  const saveCell = async (day: number, slot: string) => {
    if (!tenantId || !selectedClass) return;
    const key = cellKey(day, slot);
    const draft = draftFor(day, slot);
    const existing = entryMap.get(key);
    const subject = draft.subject.trim();

    setSavingKey(key);
    setError(null);
    try {
      if (!subject) {
        // Ders boşaltıldı → varsa kaydı sil.
        if (existing) await deleteScheduleEntry(tenantId, existing.id);
      } else if (existing) {
        await updateScheduleEntry(tenantId, existing.id, {
          subject,
          teacherName: draft.teacherName.trim(),
        });
      } else {
        await createScheduleEntry({
          tenantId,
          classId: selectedClass.id,
          className: selectedClass.name,
          day,
          startTime: slot,
          subject,
          teacherName: draft.teacherName.trim(),
        });
      }
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      await refreshEntries();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSavingKey(null);
    }
  };

  if (!firebaseReady || !profile || !tenantId) return null;

  if (!canManage) {
    return (
      <GlassCard tone="navy">
        <p className="text-sm text-muted">
          Ders programını yalnızca okul yöneticileri düzenleyebilir.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <CalendarDays size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">
            Ders Programı Düzenleyici
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs font-medium text-muted">Sınıf</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            >
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id} className="bg-surface">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {classes === null ? (
          <p className="text-sm text-muted">Yükleniyor…</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-muted">
            Önce <span className="text-accent">Sınıf Yapısı</span> bölümünden
            kademe ve şube oluşturun. Ders programı sınıflara bağlanır.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-muted">
              Saat dilimleri okul ayarlarından üretilir. Bir hücreye ders ve
              öğretmen yazıp <span className="text-accent">kaydet</span>’e basın;
              dersi silmek için ders alanını boşaltıp kaydedin.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border border-white/10 bg-white/[0.03] px-2 py-2 text-left text-xs font-semibold text-muted">
                      Saat
                    </th>
                    {WEEKDAYS.map((d) => (
                      <th
                        key={d}
                        className="border border-white/10 bg-white/[0.03] px-2 py-2 text-left text-xs font-semibold text-accent"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot}>
                      <td className="border border-white/10 px-2 py-2 align-top font-mono text-xs text-muted">
                        {slot}
                      </td>
                      {WEEKDAYS.map((_, dayIdx) => {
                        const key = cellKey(dayIdx, slot);
                        const draft = draftFor(dayIdx, slot);
                        const dirty = drafts[key] != null;
                        const saving = savingKey === key;
                        return (
                          <td
                            key={key}
                            className="border border-white/10 p-1.5 align-top"
                          >
                            <div className="flex flex-col gap-1">
                              <input
                                value={draft.subject}
                                onChange={(e) =>
                                  setDraft(dayIdx, slot, {
                                    subject: e.target.value,
                                  })
                                }
                                placeholder="Ders"
                                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-content outline-none focus:border-accent"
                              />
                              <input
                                value={draft.teacherName}
                                onChange={(e) =>
                                  setDraft(dayIdx, slot, {
                                    teacherName: e.target.value,
                                  })
                                }
                                placeholder="Öğretmen"
                                className="w-full rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-muted outline-none focus:border-accent"
                              />
                              {dirty && (
                                <button
                                  type="button"
                                  onClick={() => void saveCell(dayIdx, slot)}
                                  disabled={saving}
                                  className="inline-flex items-center justify-center gap-1 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/20 disabled:opacity-60"
                                >
                                  {saving ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                      aria-hidden="true"
                                    />
                                  ) : draft.subject.trim() ? (
                                    <Save size={12} aria-hidden="true" />
                                  ) : (
                                    <Trash2 size={12} aria-hidden="true" />
                                  )}
                                  {draft.subject.trim() ? "Kaydet" : "Sil"}
                                </button>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {error && (
          <p className="mt-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
            <AlertCircle size={16} aria-hidden="true" />
            {error}
          </p>
        )}
      </GlassCard>
    </div>
  );
}
