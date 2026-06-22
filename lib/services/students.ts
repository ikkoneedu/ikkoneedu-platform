/**
 * Öğrenci servisi — `tenants/{tenantId}/students/{studentId}`.
 *
 * Tenant izole; yazma okul yönetimi (Firestore kuralları). İlişki tutarlılığı
 * (student.classId ↔ class.studentIds, student.parentIds ↔ parent.linkedStudentIds)
 * batch write ile korunur.
 *
 * Güvenlik: tenantId/schoolId çağıran tarafça doğrulanmış profilden geçilir.
 * Gerçek silme yok; `status` ile soft delete (deactivateStudent).
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantStudents, classDoc } from "@/lib/firebase/collections";
import { normalizeName, toMillis, type RecordStatus } from "@/lib/services/people-validation";

const studentDoc = (tenantId: string, id: string) =>
  `${tenantStudents(tenantId)}/${id}`;

export interface StudentRecord {
  id: string;
  tenantId: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  studentNo: string;
  grade: string;
  classId: string;
  parentIds: string[];
  status: string;
  /** Bağlı giriş hesabı (users/{uid}) — yoksa boş. */
  userId: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface CreateStudentInput {
  firstName: string;
  lastName: string;
  studentNo?: string;
  grade?: string;
  classId?: string;
}

function mapStudent(id: string, data: Record<string, unknown>): StudentRecord {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    schoolId: String(data.schoolId ?? ""),
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    fullName: String(data.fullName ?? ""),
    studentNo: String(data.studentNo ?? ""),
    grade: String(data.grade ?? ""),
    classId: String(data.classId ?? ""),
    parentIds: Array.isArray(data.parentIds) ? (data.parentIds as string[]) : [],
    status: String(data.status ?? "active"),
    userId: String(data.userId ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/** Tenant'taki öğrenciler (ada göre sıralı). */
export async function listStudents(tenantId: string): Promise<StudentRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(query(collection(db, tenantStudents(tenantId))));
  return snap.docs
    .map((d) => mapStudent(d.id, d.data()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "tr"));
}

export async function getStudent(
  tenantId: string,
  id: string,
): Promise<StudentRecord | null> {
  if (!isFirebaseConfigured() || !db) return null;
  const snap = await getDoc(doc(db, studentDoc(tenantId, id)));
  return snap.exists() ? mapStudent(snap.id, snap.data()) : null;
}

/** studentNo tenant içinde benzersiz mi? (boşsa serbest) */
async function studentNoTaken(tenantId: string, studentNo: string): Promise<boolean> {
  if (!db || !studentNo) return false;
  const snap = await getDocs(
    query(collection(db, tenantStudents(tenantId)), where("studentNo", "==", studentNo)),
  );
  return !snap.empty;
}

export async function createStudent(
  tenantId: string,
  schoolId: string,
  input: CreateStudentInput,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const { firstName, lastName, fullName } = normalizeName(input.firstName, input.lastName);
  const studentNo = (input.studentNo ?? "").trim();
  if (studentNo && (await studentNoTaken(tenantId, studentNo))) {
    throw new Error(`"${studentNo}" öğrenci numarası zaten kullanımda.`);
  }
  const ref = doc(collection(db, tenantStudents(tenantId)));
  await setDoc(ref, {
    tenantId,
    schoolId: schoolId || tenantId,
    firstName,
    lastName,
    fullName,
    studentNo,
    grade: (input.grade ?? "").trim(),
    classId: "",
    parentIds: [],
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (input.classId) {
    await assignStudentToClass(tenantId, ref.id, input.classId);
  }
  return ref.id;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  studentNo?: string;
  grade?: string;
}

export async function updateStudent(
  tenantId: string,
  id: string,
  patch: UpdateStudentInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const current = await getStudent(tenantId, id);
    const { firstName, lastName, fullName } = normalizeName(
      patch.firstName ?? current?.firstName ?? "",
      patch.lastName ?? current?.lastName ?? "",
    );
    data.firstName = firstName;
    data.lastName = lastName;
    data.fullName = fullName;
  }
  if (patch.studentNo !== undefined) {
    const sn = patch.studentNo.trim();
    if (sn && (await studentNoTaken(tenantId, sn))) {
      const current = await getStudent(tenantId, id);
      if (current?.studentNo !== sn) {
        throw new Error(`"${sn}" öğrenci numarası zaten kullanımda.`);
      }
    }
    data.studentNo = sn;
  }
  if (patch.grade !== undefined) data.grade = patch.grade.trim();
  await updateDoc(doc(db, studentDoc(tenantId, id)), data);
}

/** Soft delete — status = inactive. */
export async function deactivateStudent(
  tenantId: string,
  id: string,
  status: RecordStatus = "inactive",
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, studentDoc(tenantId, id)), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Öğrenciyi bir sınıfa atar. İlişki tutarlı: eski sınıftan çıkar, yeni sınıfa
 * ekle, öğrencinin classId'sini güncelle (tek batch).
 */
export async function assignStudentToClass(
  tenantId: string,
  studentId: string,
  classId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const current = await getStudent(tenantId, studentId);
  const oldClassId = current?.classId ?? "";
  if (oldClassId === classId) return;

  const batch = writeBatch(db);
  batch.update(doc(db, studentDoc(tenantId, studentId)), {
    classId,
    updatedAt: serverTimestamp(),
  });
  if (oldClassId) {
    batch.update(doc(db, classDoc(tenantId, oldClassId)), {
      studentIds: arrayRemove(studentId),
      updatedAt: serverTimestamp(),
    });
  }
  batch.update(doc(db, classDoc(tenantId, classId)), {
    studentIds: arrayUnion(studentId),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

/** Öğrenciyi sınıfından çıkarır (iki taraflı). */
export async function removeStudentFromClass(
  tenantId: string,
  studentId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const current = await getStudent(tenantId, studentId);
  const oldClassId = current?.classId ?? "";
  if (!oldClassId) return;

  const batch = writeBatch(db);
  batch.update(doc(db, studentDoc(tenantId, studentId)), {
    classId: "",
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, classDoc(tenantId, oldClassId)), {
    studentIds: arrayRemove(studentId),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}
