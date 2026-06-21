"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Wand2,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  UserCheck,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROLES } from "@/lib/auth/role-constants";
import { listStructureClasses, type SchoolClass } from "@/lib/services/classes";
import { listTenantUsers, type TenantUser } from "@/lib/services/users";
import { getSettings } from "@/lib/services/settings";
import {
  buildTimeSlots,
  listSchedule,
  WEEKDAYS,
  type ScheduleEntry,
} from "@/lib/services/schedule";
import {
  setClassTeacher,
  listClassLessons,
  addClassLesson,
  deleteClassLesson,
  generateTimetable,
  applyGeneratedTimetable,
  type ClassLesson,
  type Unplaced,
} from "@/lib/services/timetable-engine";
import { printToPDF } from "@/lib/export/download";
import { getAuthErrorMessage } from "@/lib/auth/auth-errors";

const MANAGER_ROLES: string[] = [
  ROLES.SCHOOL_ADMIN,
  ROLES.FOUNDER,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.COORDINATOR,
  ROLES.SUPER_ADMIN,
];

/**
 * Otomatik ders programı oluşturucu (AI'sız, kurallı).
 *
 * Sınıf öğretmeni ata → ders havuzunu gir (ders + haftalık saat + öğretmen) →
 * tüm okul için çakışmasız otomatik oluştur → sınıf bazlı PDF çıktısı.
 */
export function TimetableGenerator() {
  const { profile, firebaseReady } = useAuth();
  const tenantId = profile?.tenantId;
  const canManage = profile != null && MANAGER_ROLES.includes(profile.role);

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<TenantUser[]>([]);
  const [lessons, setLessons] = useState<ClassLesson[]>([]);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unplaced, setUnplaced] = useState<Unplaced[]>([]);

  const selectedClass = classes.find((c) => c.id === selectedId) ?? null;
  const classLessons = lessons.filter((l) => l.classId === selectedId);

  const loadCore = useCallback(async () => {
    if (!tenantId) return;
    const [cls, users, ls, tt, sched] = await Promise.all([
      listStructureClasses(tenantId),
      listTenantUsers(tenantId),
      listClassLessons(tenantId),
      getSettings(tenantId, "timetable"),
      listSchedule(tenantId),
    ]);
    setClasses(cls);
    setTeachers(users.filter((u) => u.role === ROLES.TEACHER));
    setLessons(ls);
    setEntries(sched);
    setSlots(
      buildTimeSlots(
        tt.lessonStart || "09:00",
        Number(tt.lessonDuration) || 40,
        Number(tt.breakDuration) || 10,
        8,
      ),
    );
    if (cls.length > 0) setSelectedId((prev) => prev || cls[0].id);
    setLoaded(true);
  }, [tenantId]);

  useEffect(() => {
    if (firebaseReady && tenantId) {
      void loadCore().catch((err) => setError(getAuthErrorMessage(err)));
    }
  }, [firebaseReady, tenantId, loadCore]);

  const teacherName = (uid: string) =>
    teachers.find((t) => t.uid === uid)?.displayName ?? "";

  const assignTeacher = async (uid: string) => {
    if (!tenantId || !selectedClass || !uid) return;
    setBusy(true);
    setError(null);
    try {
      await setClassTeacher(tenantId, selectedClass.id, uid, teacherName(uid));
      setClasses((prev) =>
        prev.map((c) =>
          c.id === selectedClass.id
            ? { ...c, classTeacherUid: uid, classTeacherName: teacherName(uid) }
            : c,
        ),
      );
      setNotice(`${selectedClass.name} sınıf öğretmeni atandı.`);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleAddLesson = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tenantId || !selectedClass || busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = String(data.get("subject") ?? "").trim();
    const weeklyHours = Number(data.get("weeklyHours") ?? 0);
    const teacherUid = String(data.get("teacherUid") ?? "");
    if (!subject || weeklyHours < 1) return;

    setBusy(true);
    setError(null);
    try {
      await addClassLesson(tenantId, {
        classId: selectedClass.id,
        className: selectedClass.name,
        subject,
        weeklyHours,
        teacherUid,
        teacherName: teacherName(teacherUid),
      });
      form.reset();
      setLessons(await listClassLessons(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const removeLesson = async (id: string) => {
    if (!tenantId || busy) return;
    setBusy(true);
    try {
      await deleteClassLesson(tenantId, id);
      setLessons(await listClassLessons(tenantId));
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async () => {
    if (!tenantId || generating || classes.length === 0) return;
    setGenerating(true);
    setError(null);
    setNotice(null);
    setUnplaced([]);
    try {
      const result = generateTimetable({
        dayCount: WEEKDAYS.length,
        slots,
        classes: classes.map((c) => ({ id: c.id, name: c.name })),
        lessons,
      });
      await applyGeneratedTimetable(
        tenantId,
        classes.map((c) => c.id),
        result.entries,
      );
      setEntries(await listSchedule(tenantId));
      setUnplaced(result.unplaced);
      setNotice(
        `Program oluşturuldu: ${result.entries.length} ders, ${classes.length} sınıf` +
          (result.unplaced.length > 0
            ? ` · ${result.unplaced.length} ders yerleştirilemedi.`
            : " · çakışma yok."),
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  /** Seçili sınıfın gün×saat ızgarası (önizleme + PDF). */
  const grid = useMemo(() => {
    const map = new Map<string, ScheduleEntry>();
    for (const e of entries) {
      if (e.classId === selectedId) map.set(`${e.day}|${e.startTime}`, e);
    }
    return map;
  }, [entries, selectedId]);

  const totalHours = classLessons.reduce((s, l) => s + l.weeklyHours, 0);
  const capacity = WEEKDAYS.length * slots.length;

  const exportPDF = () => {
    if (!selectedClass) return;
    const head = `<tr><th>Saat</th>${WEEKDAYS.map((d) => `<th>${d}</th>`).join("")}</tr>`;
    const body = slots
      .map((slot) => {
        const cells = WEEKDAYS.map((_, day) => {
          const e = grid.get(`${day}|${slot}`);
          return `<td>${
            e ? `<strong>${e.subject}</strong><br/><small>${e.teacherName ?? ""}</small>` : ""
          }</td>`;
        }).join("");
        return `<tr><td><strong>${slot}</strong></td>${cells}</tr>`;
      })
      .join("");
    const ct = selectedClass.classTeacherName;
    printToPDF(
      `${selectedClass.name} Ders Programı`,
      `<h1>${selectedClass.name} Ders Programı</h1>` +
        (ct ? `<p>Sınıf Öğretmeni: <strong>${ct}</strong></p>` : "") +
        `<table border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse;width:100%;text-align:center;font-size:12px">` +
        `<thead>${head}</thead><tbody>${body}</tbody></table>`,
    );
  };

  if (!firebaseReady || !profile || !tenantId) return null;
  if (!canManage) {
    return (
      <GlassCard tone="navy">
        <p className="text-sm text-muted">
          Otomatik programı yalnızca okul yöneticileri oluşturabilir.
        </p>
      </GlassCard>
    );
  }

  const currentTeacher = selectedClass?.classTeacherUid;

  return (
    <div className="flex flex-col gap-6">
      {/* Sınıf seçimi + sınıf öğretmeni */}
      <GlassCard tone="navy">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <UserCheck size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">
            Sınıf ve Sınıf Öğretmeni
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <label className="text-xs font-medium text-muted">Sınıf</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id} className="bg-surface">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!loaded ? (
          <p className="text-sm text-muted">Yükleniyor…</p>
        ) : classes.length === 0 ? (
          <p className="text-sm text-muted">
            Önce <span className="text-accent">Sınıf Yapısı</span> bölümünden
            kademe ve şube oluşturun.
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">
                Sınıf öğretmeni
              </label>
              <select
                value={currentTeacher ?? ""}
                onChange={(e) => void assignTeacher(e.target.value)}
                disabled={busy || teachers.length === 0}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent disabled:opacity-60"
              >
                <option value="" className="bg-surface">
                  {teachers.length === 0 ? "Önce öğretmen ekleyin" : "Seçiniz…"}
                </option>
                {teachers.map((t) => (
                  <option key={t.uid} value={t.uid} className="bg-surface">
                    {t.displayName || t.email}
                  </option>
                ))}
              </select>
            </div>
            {currentTeacher && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">
                <CheckCircle2 size={14} aria-hidden="true" /> Atandı
              </span>
            )}
          </div>
        )}
      </GlassCard>

      {/* Ders havuzu */}
      {classes.length > 0 && (
        <GlassCard tone="navy">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Plus size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">
              {selectedClass?.name} · Ders Havuzu
            </h2>
            <span
              className={`ml-auto text-xs ${
                totalHours > capacity ? "text-brand" : "text-muted"
              }`}
            >
              {totalHours}/{capacity} saat
            </span>
          </div>

          <form
            onSubmit={handleAddLesson}
            className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Ders</label>
              <input
                name="subject"
                placeholder="Matematik"
                required
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">
                Haftalık saat
              </label>
              <input
                name="weeklyHours"
                type="number"
                min={1}
                max={capacity || 40}
                placeholder="5"
                required
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted">Öğretmen</label>
              <select
                name="teacherUid"
                defaultValue={currentTeacher ?? ""}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-content outline-none focus:border-accent"
              >
                <option value="" className="bg-surface">
                  (Öğretmensiz)
                </option>
                {teachers.map((t) => (
                  <option key={t.uid} value={t.uid} className="bg-surface">
                    {t.displayName || t.email}
                  </option>
                ))}
              </select>
            </div>
            <PrimaryButton type="submit" size="md" disabled={busy}>
              <Plus size={16} aria-hidden="true" /> Ekle
            </PrimaryButton>
          </form>

          <div className="mt-4">
            {classLessons.length === 0 ? (
              <p className="text-sm text-muted">
                Bu sınıf için henüz ders eklenmedi.
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {classLessons.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-content">{l.subject}</span>
                    <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs text-accent">
                      {l.weeklyHours} saat
                    </span>
                    <span className="text-xs text-muted">
                      {l.teacherName || "öğretmensiz"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void removeLesson(l.id)}
                      disabled={busy}
                      aria-label={`${l.subject} dersini sil`}
                      className="ml-auto text-muted transition-colors hover:text-brand"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {totalHours > capacity && (
              <p className="mt-2 text-xs text-brand">
                Toplam ders saati ({totalHours}) haftalık kapasiteyi ({capacity})
                aşıyor; fazlası yerleştirilemez. Ders saatini azaltın veya
                ayarlardan günlük ders sayısını artırın.
              </p>
            )}
          </div>
        </GlassCard>
      )}

      {/* Otomatik oluştur */}
      {classes.length > 0 && (
        <GlassCard tone="navy">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Wand2 size={18} className="text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-content">
              Otomatik Oluştur (tüm okul · çakışmasız)
            </h2>
          </div>
          <p className="mb-4 text-sm text-muted">
            Tüm sınıfların ders havuzunu günlere dengeli ve çakışmasız yerleştirir
            (aynı öğretmen aynı saatte iki sınıfa düşmez). Saat dilimleri okul
            ayarlarındaki giriş/çıkış ve teneffüs sürelerine göre üretilir.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryButton
              type="button"
              size="md"
              onClick={() => void handleGenerate()}
              disabled={generating || lessons.length === 0}
            >
              {generating ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <Wand2 size={16} aria-hidden="true" />
              )}
              Programı Otomatik Oluştur
            </PrimaryButton>
            <PrimaryButton
              type="button"
              variant="secondary"
              size="md"
              onClick={exportPDF}
              disabled={!selectedClass}
            >
              <FileText size={16} aria-hidden="true" /> Sınıf PDF’i
            </PrimaryButton>
          </div>

          {notice && (
            <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
              {notice}
            </p>
          )}
          {unplaced.length > 0 && (
            <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
              <p className="font-medium">Yerleştirilemeyen dersler:</p>
              <ul className="mt-1 list-inside list-disc">
                {unplaced.map((u, i) => (
                  <li key={i}>
                    {u.className} · {u.subject} ({u.remaining} saat)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && (
            <p className="mt-3 flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm text-brand">
              <AlertCircle size={16} aria-hidden="true" /> {error}
            </p>
          )}
        </GlassCard>
      )}

      {/* Önizleme ızgarası (seçili sınıf) */}
      {classes.length > 0 && entries.some((e) => e.classId === selectedId) && (
        <GlassCard tone="navy">
          <h2 className="mb-4 text-lg font-semibold text-content">
            {selectedClass?.name} · Haftalık Program
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
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
                    <td className="border border-white/10 px-2 py-2 font-mono text-xs text-muted">
                      {slot}
                    </td>
                    {WEEKDAYS.map((_, day) => {
                      const e = grid.get(`${day}|${slot}`);
                      return (
                        <td
                          key={day}
                          className="border border-white/10 px-2 py-2 align-top"
                        >
                          {e ? (
                            <div>
                              <div className="font-medium text-content">
                                {e.subject}
                              </div>
                              {e.teacherName && (
                                <div className="text-[11px] text-muted">
                                  {e.teacherName}
                                </div>
                              )}
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
        </GlassCard>
      )}
    </div>
  );
}
