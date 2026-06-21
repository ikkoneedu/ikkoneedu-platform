/**
 * Ders hatırlatma altyapısı — her dersten 10 dk önce öğretmene bildirim.
 *
 * Tasarım (cron'a HAZIR):
 *  - `buildLessonReminders` haftalık programdan hatırlatma planı üretir
 *    (öğretmen, gün, saat, "remindAt = ders saati − 10 dk").
 *  - `dueReminders` bir an (now) için "şimdi gönderilmeli" olanları döner.
 *    İleride bir Cloud Function / Vercel Cron her dakika çağırır.
 *  - `nextLessonForTeacher` öğretmen panelinde canlı geri sayım için.
 *  - `dispatchReminderNotification` bildirimi Firestore'a yazar (mevcut
 *    notifications servisi). Push/SMS dondurulmuş; kanal "in_app".
 *
 * Bu modül saf/deterministik fonksiyonlardan oluşur; yapay zeka kullanmaz.
 */

import type { ScheduleEntry } from "@/lib/services/schedule";
import { createNotification } from "@/lib/services/notifications";

/** Ders başlamadan kaç dakika önce hatırlatılsın. */
export const REMINDER_OFFSET_MIN = 10;

export interface LessonReminder {
  teacherUid: string;
  teacherName: string;
  classId: string;
  className: string;
  subject: string;
  /** 0 = Pazartesi … 4 = Cuma. */
  day: number;
  /** Dersin başlangıç saati "HH:MM". */
  startTime: string;
  /** Hatırlatmanın gönderileceği saat "HH:MM" (başlangıç − offset). */
  remindAt: string;
}

/** "HH:MM" → günün dakikası. Geçersizse -1. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((n) => Number(n));
  if (Number.isNaN(h) || Number.isNaN(m)) return -1;
  return h * 60 + m;
}

/** Günün dakikası → "HH:MM" (00:00–23:59 sınırlı). */
export function minutesToTime(total: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, total));
  const hh = String(Math.floor(clamped / 60)).padStart(2, "0");
  const mm = String(clamped % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

/** "09:00" −10dk → "08:50". */
export function shiftTime(time: string, deltaMin: number): string {
  const base = timeToMinutes(time);
  if (base < 0) return time;
  return minutesToTime(base + deltaMin);
}

/** JS Date → bizim gün indeksi (Pzt=0…Cum=4); hafta sonu -1. */
export function weekdayIndex(date: Date): number {
  const js = date.getDay(); // 0=Pazar … 6=Cumartesi
  if (js === 0 || js === 6) return -1;
  return js - 1;
}

/**
 * Programdan hatırlatma planı üretir. Yalnızca öğretmeni (uid) bilinen
 * dersler için (kime bildirim gideceği belli olmalı).
 */
export function buildLessonReminders(
  entries: ScheduleEntry[],
  offset: number = REMINDER_OFFSET_MIN,
): LessonReminder[] {
  return entries
    .filter((e) => e.teacherUid && e.startTime && e.subject)
    .map((e) => ({
      teacherUid: e.teacherUid,
      teacherName: e.teacherName,
      classId: e.classId,
      className: e.className,
      subject: e.subject,
      day: e.day,
      startTime: e.startTime,
      remindAt: shiftTime(e.startTime, -offset),
    }));
}

/**
 * Verilen ana göre "şimdi gönderilmeli" hatırlatmalar.
 * Bir cron her dakika çağırırsa `windowMinutes = 1` yeterlidir (çift gönderimi
 * önlemek için pencere dar tutulur).
 */
export function dueReminders(
  reminders: LessonReminder[],
  now: Date,
  windowMinutes = 1,
): LessonReminder[] {
  const today = weekdayIndex(now);
  if (today < 0) return [];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return reminders.filter((r) => {
    if (r.day !== today) return false;
    const at = timeToMinutes(r.remindAt);
    return at >= nowMin && at < nowMin + windowMinutes;
  });
}

export interface NextLesson {
  entry: ScheduleEntry;
  /** Derse kalan dakika (bugünkü dersler için). */
  minutesUntil: number;
}

/**
 * Öğretmenin BUGÜNKÜ sıradaki dersini ve kalan süreyi döner.
 * Panelde canlı geri sayım ve 10 dk eşiğinde uyarı için kullanılır.
 */
export function nextLessonForTeacher(
  entries: ScheduleEntry[],
  teacherUid: string,
  teacherName: string,
  now: Date,
): NextLesson | null {
  const today = weekdayIndex(now);
  if (today < 0) return null;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const mine = entries
    .filter(
      (e) =>
        e.day === today &&
        (e.teacherUid === teacherUid ||
          (!!teacherName && e.teacherName === teacherName)),
    )
    .map((e) => ({ entry: e, start: timeToMinutes(e.startTime) }))
    .filter((x) => x.start >= nowMin)
    .sort((a, b) => a.start - b.start);
  if (mine.length === 0) return null;
  return { entry: mine[0].entry, minutesUntil: mine[0].start - nowMin };
}

/**
 * Bir hatırlatmayı bildirim olarak yazar (cron / Cloud Function çağırır).
 * audience = öğretmen uid (kişiye özel filtre için). Kanal "in_app".
 */
export async function dispatchReminderNotification(
  tenantId: string,
  reminder: LessonReminder,
): Promise<void> {
  await createNotification(tenantId, {
    title: "Ders Hatırlatması",
    body: `${REMINDER_OFFSET_MIN} dakika sonra ${reminder.className} sınıfında ${reminder.subject} dersiniz var (${reminder.startTime}).`,
    audience: reminder.teacherUid,
    channel: "in_app",
    createdBy: "system",
    createdByName: "Otomatik Hatırlatma",
  });
}
