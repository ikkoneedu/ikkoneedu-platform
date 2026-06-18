import { CalendarDays } from "lucide-react";
import { GlassCard } from "@/components/shared/GlassCard";
import type { ScheduleEntry } from "@/lib/scheduler-mock-data";

interface WeeklyTimetableProps {
  days: string[];
  hours: string[];
  /** timetable[saat][gün] — boş hücreler null. */
  timetable: (ScheduleEntry | null)[][];
}

/** Derse göre renk teması (premium, yumuşak tonlar). */
const LESSON_STYLES: Record<string, string> = {
  İngilizce: "border-accent/30 bg-accent/10 text-accent",
  Matematik: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  "Fen Bilimleri": "border-sky-400/30 bg-sky-400/10 text-sky-300",
  Türkçe: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  "Görsel Sanatlar": "border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300",
  "Beden Eğitimi": "border-orange-400/30 bg-orange-400/10 text-orange-300",
};

const DEFAULT_STYLE = "border-white/10 bg-white/[0.04] text-content";

/**
 * Haftalık ders programı — timetable/grid görünümü.
 * Mobilde yatay scroll ile görüntülenir.
 */
export function WeeklyTimetable({ days, hours, timetable }: WeeklyTimetableProps) {
  return (
    <GlassCard tone="navy">
      <div className="mb-5 flex items-center gap-2">
        <CalendarDays size={18} className="text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-content">Haftalık Ders Programı</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Başlık satırı */}
          <div className="grid grid-cols-[80px_repeat(5,1fr)] gap-2">
            <div />
            {days.map((day) => (
              <div
                key={day}
                className="rounded-lg bg-white/[0.03] py-2 text-center text-sm font-semibold text-content"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Saat satırları */}
          {hours.map((hour, hourIndex) => (
            <div
              key={hour}
              className="mt-2 grid grid-cols-[80px_repeat(5,1fr)] gap-2"
            >
              <div className="flex items-center justify-center rounded-lg bg-white/[0.03] text-xs font-medium text-muted">
                {hour}
              </div>

              {days.map((day, dayIndex) => {
                const entry = timetable[hourIndex]?.[dayIndex] ?? null;
                if (!entry) {
                  return (
                    <div
                      key={day}
                      className="min-h-[76px] rounded-lg border border-dashed border-white/5 bg-white/[0.01]"
                    />
                  );
                }
                const style = LESSON_STYLES[entry.lesson] ?? DEFAULT_STYLE;
                return (
                  <div
                    key={day}
                    className={`min-h-[76px] rounded-lg border p-2.5 ${style}`}
                  >
                    <p className="text-xs font-semibold">{entry.lesson}</p>
                    <p className="mt-1 text-[11px] text-muted">{entry.teacher}</p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
                      <span>{entry.classGroup}</span>
                      <span>{entry.room}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
