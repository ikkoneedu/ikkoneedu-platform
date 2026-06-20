/**
 * Not/Karne servisi — öğretmen öğrenciye not girer; öğrenci/veli görür.
 *
 * Kayıtlar kök `studentRecords/{studentUid}` belgesinde tutulur (gizlilik için
 * tenant recursive kuralı dışında). Erişim: öğrencinin kendisi, bağlı velisi,
 * ve aynı tenant personeli (Firestore kuralları).
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

export interface GradeEntry {
  subject: string;
  score: string;
  note: string;
  byName: string;
  date: string;
}

export interface AddGradeInput {
  tenantId: string;
  studentUid: string;
  subject: string;
  score: string;
  note?: string;
  byName: string;
}

export async function addGrade(input: AddGradeInput): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const entry: GradeEntry = {
    subject: input.subject,
    score: input.score,
    note: input.note ?? "",
    byName: input.byName,
    date: new Date().toISOString().slice(0, 10),
  };
  await setDoc(
    doc(db, STUDENT_RECORDS, input.studentUid),
    {
      tenantId: input.tenantId,
      studentUid: input.studentUid,
      grades: arrayUnion(entry),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Bir öğrencinin notlarını döner (yeni → eski). */
export async function getStudentGrades(studentUid: string): Promise<GradeEntry[]> {
  if (!isFirebaseConfigured() || !db) return [];
  try {
    const snap = await getDoc(doc(db, STUDENT_RECORDS, studentUid));
    if (!snap.exists()) return [];
    const grades = (snap.data().grades ?? []) as GradeEntry[];
    return [...grades].reverse();
  } catch {
    return [];
  }
}
