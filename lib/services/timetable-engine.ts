/**
 * Ders programı motoru (AI'sız, kurallı) — okul gerçeğine göre çakışmasız
 * otomatik yerleştirme.
 *
 * Akış:
 *   1) Yönetici her sınıfa SINIF ÖĞRETMENİ atar (`setClassTeacher`).
 *   2) Her sınıf için DERS havuzu tanımlar: ders adı + haftalık saat + öğretmen
 *      (`addClassLesson`). Branş dersleri kendi öğretmenini taşır.
 *   3) `generateTimetable` tüm okulu birlikte çözer; aynı öğretmen aynı saatte
 *      iki sınıfa düşmez (çakışma engellenir), dersler günlere DENGELİ yayılır,
 *      saat dilimleri okul ayarlarındaki giriş/çıkış/teneffüse göre üretilir.
 *   4) `applyGeneratedTimetable` sonucu scheduleEntries'e yazar (önce temizler).
 *
 * Yapay zeka kullanılmaz; bu deterministik bir zaman çizelgeleme algoritmasıdır.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { classDoc } from "@/lib/firebase/collections";

/** Ders havuzu koleksiyonu: tenants/{id}/classLessons */
const lessonsPath = (tenantId: string) => `tenants/${tenantId}/classLessons`;

const schedulePath = (tenantId: string) => `tenants/${tenantId}/scheduleEntries`;

/* -------------------------------------------------------------------------- */
/*  Sınıf öğretmeni                                                            */
/* -------------------------------------------------------------------------- */

/** Bir sınıfa sınıf öğretmeni atar (sınıf belgesine yazılır). */
export async function setClassTeacher(
  tenantId: string,
  classId: string,
  teacherUid: string,
  teacherName: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, classDoc(tenantId, classId)), {
    classTeacherUid: teacherUid,
    classTeacherName: teacherName,
    updatedAt: serverTimestamp(),
  });
}

/* -------------------------------------------------------------------------- */
/*  Ders havuzu (sınıf × ders × saat × öğretmen)                               */
/* -------------------------------------------------------------------------- */

export interface ClassLesson {
  id: string;
  classId: string;
  className: string;
  subject: string;
  weeklyHours: number;
  teacherUid: string;
  teacherName: string;
}

export async function listClassLessons(
  tenantId: string,
): Promise<ClassLesson[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, lessonsPath(tenantId))),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      classId: String(data.classId ?? ""),
      className: String(data.className ?? ""),
      subject: String(data.subject ?? ""),
      weeklyHours: Number(data.weeklyHours ?? 0),
      teacherUid: String(data.teacherUid ?? ""),
      teacherName: String(data.teacherName ?? ""),
    };
  });
}

export interface AddLessonInput {
  classId: string;
  className: string;
  subject: string;
  weeklyHours: number;
  teacherUid: string;
  teacherName: string;
}

export async function addClassLesson(
  tenantId: string,
  input: AddLessonInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, lessonsPath(tenantId)), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function deleteClassLesson(
  tenantId: string,
  lessonId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await deleteDoc(doc(db, `${lessonsPath(tenantId)}/${lessonId}`));
}

/* -------------------------------------------------------------------------- */
/*  Yerleştirme motoru (saf fonksiyon — test edilebilir, deterministik)       */
/* -------------------------------------------------------------------------- */

export interface GeneratedEntry {
  classId: string;
  className: string;
  day: number;
  slotIndex: number;
  startTime: string;
  subject: string;
  teacherUid: string;
  teacherName: string;
}

export interface Unplaced {
  className: string;
  subject: string;
  remaining: number;
}

export interface GenerateInput {
  /** Gün sayısı (ör. 5 = Pazartesi-Cuma). */
  dayCount: number;
  /** Ders saatleri (ayarlardan üretilmiş, sıralı). */
  slots: string[];
  /** Yapı sınıfları (yerleştirme sırası). */
  classes: { id: string; name: string }[];
  /** Tüm sınıfların ders havuzu. */
  lessons: ClassLesson[];
  /** Aynı dersin bir günde en fazla kaç saati (yumuşak; gerekirse aşılır). */
  maxPerDay?: number;
}

export interface GenerateResult {
  entries: GeneratedEntry[];
  unplaced: Unplaced[];
}

/**
 * Çakışmasız, dengeli haftalık program üretir (tüm okul birlikte çözülür).
 *
 * Kurallar:
 *  - Bir hücre (sınıf, gün, saat) yalnızca bir ders alır.
 *  - Aynı öğretmen aynı (gün, saat)'te iki sınıfa düşemez (çakışma yasak).
 *  - Aynı ders bir güne en fazla `maxPerDay` (vars. 2) kez konur; uygun yer
 *    yoksa bu kural yumuşatılır (kapasite varsa ders mutlaka yerleşir).
 *  - Dersler günlere mümkün olduğunca dengeli yayılır.
 */
export function generateTimetable(input: GenerateInput): GenerateResult {
  const { dayCount, slots, classes, lessons } = input;
  const maxPerDay = input.maxPerDay ?? 2;
  const slotCount = slots.length;

  const entries: GeneratedEntry[] = [];
  const unplaced: Unplaced[] = [];

  // Çakışma izleyicileri
  const teacherBusy = new Set<string>(); // `${day}-${slot}-${teacherUid}`
  const cellTaken = new Set<string>(); // `${classId}-${day}-${slot}`
  const subjectDay = new Map<string, number>(); // `${classId}-${day}-${subject}` → adet
  const dayFill = new Map<string, number>(); // `${classId}-${day}` → dolu hücre

  const sdKey = (c: string, d: number, s: string) => `${c}-${d}-${s}`;
  const dfKey = (c: string, d: number) => `${c}-${d}`;

  for (const cls of classes) {
    const classLessons = lessons.filter((l) => l.classId === cls.id);
    // Kalan saatleri takip et; en çok saati olanı önce yerleştir.
    const remaining = classLessons
      .filter((l) => l.weeklyHours > 0 && l.subject.trim())
      .map((l) => ({ ...l, left: l.weeklyHours }));

    let totalLeft = remaining.reduce((sum, l) => sum + l.left, 0);

    while (totalLeft > 0) {
      // En çok kalan saate sahip dersi seç (büyük blokları erken yerleştir).
      remaining.sort((a, b) => b.left - a.left);
      const lesson = remaining.find((l) => l.left > 0);
      if (!lesson) break;

      // Aday hücreler: boş + öğretmen müsait.
      type Cand = { day: number; slot: number; sCount: number; fill: number };
      const candidates: Cand[] = [];
      for (let day = 0; day < dayCount; day += 1) {
        for (let slot = 0; slot < slotCount; slot += 1) {
          if (cellTaken.has(`${cls.id}-${day}-${slot}`)) continue;
          if (
            lesson.teacherUid &&
            teacherBusy.has(`${day}-${slot}-${lesson.teacherUid}`)
          )
            continue;
          candidates.push({
            day,
            slot,
            sCount: subjectDay.get(sdKey(cls.id, day, lesson.subject)) ?? 0,
            fill: dayFill.get(dfKey(cls.id, day)) ?? 0,
          });
        }
      }

      if (candidates.length === 0) {
        unplaced.push({
          className: cls.name,
          subject: lesson.subject,
          remaining: lesson.left,
        });
        totalLeft -= lesson.left;
        lesson.left = 0;
        continue;
      }

      // Dengeli seçim: günde aynı ders azsa öncelik; sonra dolu hücre azsa
      // (yükü yaymak için); sonra erken gün/saat. Yumuşak günlük üst sınır:
      // sınırı aşmayan adaylar varsa onları tercih et.
      const underCap = candidates.filter((c) => c.sCount < maxPerDay);
      const pool = underCap.length > 0 ? underCap : candidates;
      pool.sort(
        (a, b) =>
          a.sCount - b.sCount || a.fill - b.fill || a.day - b.day || a.slot - b.slot,
      );
      const pick = pool[0];

      entries.push({
        classId: cls.id,
        className: cls.name,
        day: pick.day,
        slotIndex: pick.slot,
        startTime: slots[pick.slot],
        subject: lesson.subject,
        teacherUid: lesson.teacherUid,
        teacherName: lesson.teacherName,
      });

      cellTaken.add(`${cls.id}-${pick.day}-${pick.slot}`);
      if (lesson.teacherUid)
        teacherBusy.add(`${pick.day}-${pick.slot}-${lesson.teacherUid}`);
      subjectDay.set(
        sdKey(cls.id, pick.day, lesson.subject),
        (subjectDay.get(sdKey(cls.id, pick.day, lesson.subject)) ?? 0) + 1,
      );
      dayFill.set(
        dfKey(cls.id, pick.day),
        (dayFill.get(dfKey(cls.id, pick.day)) ?? 0) + 1,
      );
      lesson.left -= 1;
      totalLeft -= 1;
    }
  }

  return { entries, unplaced };
}

/* -------------------------------------------------------------------------- */
/*  Uygulama: üretilen programı Firestore'a yaz (önce ilgili sınıfları temizle)*/
/* -------------------------------------------------------------------------- */

/**
 * Üretilen programı `scheduleEntries`'e yazar. Verilen sınıfların eski
 * kayıtları önce silinir (yeniden üretim güvenli olsun diye).
 */
export async function applyGeneratedTimetable(
  tenantId: string,
  classIds: string[],
  entries: GeneratedEntry[],
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const database = db;
  const classIdSet = new Set(classIds);

  // 1) İlgili sınıfların mevcut kayıtlarını sil.
  const existing = await getDocs(
    query(collection(database, schedulePath(tenantId))),
  );
  const toDelete = existing.docs.filter((d) =>
    classIdSet.has(String(d.data().classId ?? "")),
  );

  // 2) Batch'lerle sil + yaz (her batch ≤ 450 işlem).
  let batch = writeBatch(database);
  let ops = 0;
  const flush = async () => {
    if (ops > 0) {
      await batch.commit();
      batch = writeBatch(database);
      ops = 0;
    }
  };

  for (const d of toDelete) {
    batch.delete(d.ref);
    ops += 1;
    if (ops >= 450) await flush();
  }

  for (const e of entries) {
    const ref = doc(collection(database, schedulePath(tenantId)));
    batch.set(ref, {
      classId: e.classId,
      className: e.className,
      day: e.day,
      startTime: e.startTime,
      subject: e.subject,
      teacherName: e.teacherName,
      teacherUid: e.teacherUid,
      createdAt: serverTimestamp(),
    });
    ops += 1;
    if (ops >= 450) await flush();
  }

  await flush();
}
