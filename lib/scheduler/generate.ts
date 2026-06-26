/**
 * Ders programı üretici (SAF MANTIK, demo-safe).
 *
 * Gerçek LLM YOK: greedy kısıt-çözümü ile çakışmasız haftalık ders programı
 * üretir. Temel kısıt: bir öğretmen aynı slotta yalnızca tek sınıfta olabilir.
 * Deterministiktir (aynı girdi → aynı program). Yerleştirilemeyen dersler
 * "unplaced" olarak raporlanır.
 */

export interface LessonRequirement {
  subject: string;
  teacher: string;
  /** Haftalık ders saati (her sınıf için). */
  perWeek: number;
}

export interface ScheduleInput {
  /** Sınıf adları (ör. ["9-A", "9-B"]). */
  classes: string[];
  /** Gün adları (ör. ["Pzt", "Sal", ...]). */
  days: string[];
  /** Günlük ders saati sayısı. */
  hoursPerDay: number;
  /** Her sınıfa uygulanan ders gereksinimleri. */
  lessons: LessonRequirement[];
}

export interface ScheduledCell {
  subject: string;
  teacher: string;
}

export interface UnplacedLesson {
  className: string;
  subject: string;
  teacher: string;
  /** Yerleştirilemeyen saat sayısı. */
  missing: number;
}

export interface ScheduleResult {
  /** grid[className][dayIndex][hourIndex] = hücre | null */
  grid: Record<string, (ScheduledCell | null)[][]>;
  unplaced: UnplacedLesson[];
  totalRequired: number;
  totalPlaced: number;
  /** Öğretmen başına yerleştirilen ders saati. */
  teacherLoad: Record<string, number>;
}

function emptyGrid(days: number, hours: number): (ScheduledCell | null)[][] {
  return Array.from({ length: days }, () =>
    Array.from({ length: hours }, () => null as ScheduledCell | null),
  );
}

/**
 * Haftalık programı greedy olarak üretir. Slotlar gün-major sırayla taranır;
 * her ders en erken uygun slota yerleştirilir (sınıf boş + öğretmen o slotta
 * başka sınıfta değil).
 */
export function generateSchedule(input: ScheduleInput): ScheduleResult {
  const dayCount = input.days.length;
  const hours = Math.max(0, Math.floor(input.hoursPerDay));
  const grid: Record<string, (ScheduledCell | null)[][]> = {};
  // teacherBusy[`${d}-${h}`] = Set<teacher>
  const teacherBusy = new Map<string, Set<string>>();
  const unplaced: UnplacedLesson[] = [];
  const teacherLoad: Record<string, number> = {};
  let totalRequired = 0;
  let totalPlaced = 0;

  for (const className of input.classes) {
    grid[className] = emptyGrid(dayCount, hours);
  }

  const slotKey = (d: number, h: number) => `${d}-${h}`;
  const isTeacherFree = (d: number, h: number, teacher: string) => {
    const set = teacherBusy.get(slotKey(d, h));
    return !set || !set.has(teacher);
  };
  const markTeacher = (d: number, h: number, teacher: string) => {
    const k = slotKey(d, h);
    let set = teacherBusy.get(k);
    if (!set) {
      set = new Set();
      teacherBusy.set(k, set);
    }
    set.add(teacher);
  };

  for (const className of input.classes) {
    const classGrid = grid[className];
    for (const lesson of input.lessons) {
      const need = Math.max(0, Math.floor(lesson.perWeek));
      totalRequired += need;
      let placed = 0;
      // Slotları gün-major tara (önce tüm günlerin 1. saati daha dengeli olur
      // ama basit demo için gün-major yeterli ve deterministik).
      for (let d = 0; d < dayCount && placed < need; d++) {
        for (let h = 0; h < hours && placed < need; h++) {
          if (classGrid[d][h] !== null) continue;
          if (!isTeacherFree(d, h, lesson.teacher)) continue;
          classGrid[d][h] = { subject: lesson.subject, teacher: lesson.teacher };
          markTeacher(d, h, lesson.teacher);
          placed++;
          totalPlaced++;
          teacherLoad[lesson.teacher] = (teacherLoad[lesson.teacher] ?? 0) + 1;
        }
      }
      if (placed < need) {
        unplaced.push({
          className,
          subject: lesson.subject,
          teacher: lesson.teacher,
          missing: need - placed,
        });
      }
    }
  }

  return { grid, unplaced, totalRequired, totalPlaced, teacherLoad };
}

/** Demo için gerçekçi örnek girdi. */
export function sampleScheduleInput(): ScheduleInput {
  return {
    classes: ["9-A", "9-B", "9-C"],
    days: ["Pzt", "Sal", "Çar", "Per", "Cum"],
    hoursPerDay: 6,
    lessons: [
      { subject: "Matematik", teacher: "Ahmet Yılmaz", perWeek: 5 },
      { subject: "Türkçe", teacher: "Elif Demir", perWeek: 4 },
      { subject: "İngilizce", teacher: "Ayşe Kaya", perWeek: 4 },
      { subject: "Fen Bilimleri", teacher: "Mehmet Can", perWeek: 4 },
      { subject: "Sosyal Bilgiler", teacher: "Zeynep Ak", perWeek: 3 },
      { subject: "Beden Eğitimi", teacher: "Burak Şen", perWeek: 2 },
    ],
  };
}
