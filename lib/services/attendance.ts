/**
 * Yoklama servisi — öğretmen yoklama girer; öğrenci/veli görür.
 *
 * Kayıtlar mevcut güvenli `studentRecords/{studentUid}` belgesine `attendance`
 * dizisi olarak yazılır (notlarla aynı erişim kuralları: öğrenci/bağlı veli/
 * personel okur, personel yazar). Yeni kural gerekmez.
 */

import {
  arrayUnion,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

const STUDENT_RECORDS = "studentRecords";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "Geldi",
  absent: "Gelmedi",
  late: "Geç Kaldı",
  excused: "İzinli",
};

export interface AttendanceEntry {
  date: string;
  status: AttendanceStatus;
  byName: string;
}

export interface MarkAttendanceInput {
  tenantId: string;
  studentUid: string;
  date: string;
  status: AttendanceStatus;
  byName: string;
}

export async function markAttendance(input: MarkAttendanceInput): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const entry: AttendanceEntry = {
    date: input.date,
    status: input.status,
    byName: input.byName,
  };
  await setDoc(
    doc(db, STUDENT_RECORDS, input.studentUid),
    {
      tenantId: input.tenantId,
      studentUid: input.studentUid,
      attendance: arrayUnion(entry),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Bir öğrencinin yoklama kayıtları (yeni → eski). */
export async function getAttendance(
  studentUid: string,
): Promise<AttendanceEntry[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDoc(doc(db, STUDENT_RECORDS, studentUid));
    if (!snap.exists()) return [];
    const list = (snap.data().attendance ?? []) as AttendanceEntry[];
    return [...list].reverse();
  } catch {
    return [];
  }
}
