"use client";

import { useState } from "react";
import { CalendarRange, Plus, Trash2, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { useT } from "@/components/i18n/LocaleProvider";
import {
  generateSchedule,
  sampleScheduleInput,
  type LessonRequirement,
  type ScheduleResult,
} from "@/lib/scheduler/generate";

interface LessonRow extends LessonRequirement {
  id: number;
}

const DAY_INDICES = [0, 1, 2, 3, 4];

function classNames(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `9-${String.fromCharCode(65 + i)}`);
}

/**
 * Akıllı Ders Programı Oluşturucu — çalışan demo (gerçek AI optimizasyonu sonra).
 * Çakışmasız haftalık program üretir; yazma yok (yalnızca tarayıcı belleği).
 */
export function SmartScheduleBuilder() {
  const t = useT();
  const sample = sampleScheduleInput();
  const [classCount, setClassCount] = useState(3);
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [lessons, setLessons] = useState<LessonRow[]>(
    sample.lessons.map((l, i) => ({ ...l, id: i + 1 })),
  );
  const [nextId, setNextId] = useState(sample.lessons.length + 1);
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [activeClass, setActiveClass] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const days = DAY_INDICES.map((i) => t(`sched.day.${i}`));

  const setLesson = (id: number, patch: Partial<LessonRow>) =>
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const addLesson = () => {
    setLessons((prev) => [...prev, { id: nextId, subject: "", teacher: "", perWeek: 1 }]);
    setNextId((n) => n + 1);
  };
  const removeLesson = (id: number) =>
    setLessons((prev) => prev.filter((l) => l.id !== id));

  const fillSample = () => {
    const s = sampleScheduleInput();
    setClassCount(s.classes.length);
    setHoursPerDay(s.hoursPerDay);
    setLessons(s.lessons.map((l, i) => ({ ...l, id: i + 1 })));
    setNextId(s.lessons.length + 1);
    setResult(null);
    setError(null);
  };

  const generate = () => {
    const valid = lessons.filter((l) => l.subject.trim() && l.teacher.trim() && l.perWeek > 0);
    if (valid.length === 0) {
      setError(t("sched.err.noLessons"));
      setResult(null);
      return;
    }
    setError(null);
    const classes = classNames(Math.max(1, Math.min(8, classCount)));
    const res = generateSchedule({
      classes,
      days,
      hoursPerDay: Math.max(1, Math.min(10, hoursPerDay)),
      lessons: valid.map(({ subject, teacher, perWeek }) => ({ subject, teacher, perWeek })),
    });
    setResult(res);
    setActiveClass(classes[0]);
  };

  const grid = result && activeClass ? result.grid[activeClass] : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Ayarlar */}
      <GlassCard tone="navy">
        <div className="mb-4 flex items-center gap-2">
          <CalendarRange size={18} className="text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-content">{t("sched.cfg.title")}</h2>
          <button
            type="button"
            onClick={fillSample}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-2.5 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-content"
          >
            <Sparkles size={13} aria-hidden="true" /> {t("sched.cfg.sample")}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sched-classes" className="text-sm font-medium text-muted">
              {t("sched.cfg.classes")}
            </label>
            <input
              id="sched-classes"
              type="number"
              min={1}
              max={8}
              value={classCount}
              onChange={(e) => setClassCount(Number.parseInt(e.target.value, 10) || 1)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sched-hours" className="text-sm font-medium text-muted">
              {t("sched.cfg.hours")}
            </label>
            <input
              id="sched-hours"
              type="number"
              min={1}
              max={10}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number.parseInt(e.target.value, 10) || 1)}
              className="rounded-xl border border-overlay/10 bg-overlay/[0.04] px-4 py-3 text-sm text-content outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Dersler editörü */}
        <p className="mb-2 mt-5 text-sm font-medium text-muted">{t("sched.cfg.lessons")}</p>
        <div className="flex flex-col gap-2">
          {lessons.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-2">
              <input
                value={l.subject}
                onChange={(e) => setLesson(l.id, { subject: e.target.value })}
                placeholder={t("sched.cfg.subject")}
                aria-label={t("sched.cfg.subject")}
                className="min-w-[120px] flex-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
              <input
                value={l.teacher}
                onChange={(e) => setLesson(l.id, { teacher: e.target.value })}
                placeholder={t("sched.cfg.teacher")}
                aria-label={t("sched.cfg.teacher")}
                className="min-w-[120px] flex-1 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
              <input
                type="number"
                min={0}
                max={20}
                value={l.perWeek}
                onChange={(e) => setLesson(l.id, { perWeek: Number.parseInt(e.target.value, 10) || 0 })}
                aria-label={t("sched.cfg.perWeek")}
                className="w-20 rounded-lg border border-overlay/10 bg-overlay/[0.04] px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeLesson(l.id)}
                className="text-muted transition hover:text-brand"
                aria-label={t("sched.cfg.removeLesson")}
              >
                <Trash2 size={15} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLesson}
          className="mt-3 inline-flex items-center gap-1 text-xs text-accent transition hover:text-content"
        >
          <Plus size={13} aria-hidden="true" /> {t("sched.cfg.addLesson")}
        </button>

        {error && <p className="mt-3 text-sm text-brand">{error}</p>}

        <PrimaryButton type="button" size="lg" className="mt-5 w-full sm:w-fit" onClick={generate}>
          <CalendarRange size={18} aria-hidden="true" />
          {t("sched.generate")}
        </PrimaryButton>
      </GlassCard>

      {/* Sonuç */}
      {!result ? (
        <GlassCard tone="navy">
          <p className="text-sm text-muted">{t("sched.result.empty")}</p>
        </GlassCard>
      ) : (
        <GlassCard tone="navy">
          {/* Özet */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium ${
                result.unplaced.length === 0
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-amber-400/30 bg-amber-400/10 text-amber-300"
              }`}
            >
              {result.unplaced.length === 0 ? (
                <CheckCircle2 size={15} aria-hidden="true" />
              ) : (
                <AlertTriangle size={15} aria-hidden="true" />
              )}
              {t("sched.result.summary", {
                placed: result.totalPlaced,
                required: result.totalRequired,
              })}
            </span>
          </div>

          {/* Sınıf sekmeleri */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {Object.keys(result.grid).map((cn) => (
              <button
                key={cn}
                type="button"
                onClick={() => setActiveClass(cn)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  cn === activeClass
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-overlay/[0.04] hover:text-content"
                }`}
              >
                {cn}
              </button>
            ))}
          </div>

          {/* Program ızgarası */}
          {grid && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-center text-xs">
                <thead>
                  <tr>
                    <th className="border border-overlay/10 bg-overlay/[0.04] px-2 py-2 text-muted" />
                    {days.map((d) => (
                      <th
                        key={d}
                        className="border border-overlay/10 bg-overlay/[0.04] px-2 py-2 font-semibold text-content"
                      >
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.max(1, Math.min(10, hoursPerDay)) }, (_, h) => (
                    <tr key={h}>
                      <td className="border border-overlay/10 bg-overlay/[0.04] px-2 py-2 font-medium text-muted">
                        {t("sched.hour", { n: h + 1 })}
                      </td>
                      {days.map((_, d) => {
                        const cell = grid[d]?.[h] ?? null;
                        return (
                          <td key={d} className="border border-overlay/10 px-2 py-1.5">
                            {cell ? (
                              <div>
                                <p className="font-medium text-content">{cell.subject}</p>
                                <p className="text-[10px] text-muted">{cell.teacher}</p>
                              </div>
                            ) : (
                              <span className="text-muted/40">{t("sched.result.empty.cell")}</span>
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

          {/* Yerleştirilemeyenler */}
          {result.unplaced.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-300">
                {t("sched.result.unplaced", { count: result.unplaced.length })}
              </p>
              <ul className="flex flex-col gap-1 text-sm text-muted">
                {result.unplaced.map((u, i) => (
                  <li key={`${u.className}-${u.subject}-${i}`} className="flex items-center gap-2">
                    <AlertTriangle size={13} className="shrink-0 text-amber-400" aria-hidden="true" />
                    {t("sched.result.unplacedRow", {
                      className: u.className,
                      subject: u.subject,
                      teacher: u.teacher,
                      missing: u.missing,
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
