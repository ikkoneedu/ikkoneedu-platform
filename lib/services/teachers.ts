/**
 * Öğretmen servisi — `tenants/{tenantId}/teachers/{teacherId}`.
 *
 * NOT: Bu kayıt, öğretmenin OKUL PROFİLİDİR (kadro/branş/sınıf ataması). Giriş
 * yapan öğretmen hesabı ayrıca `users/{uid}` altındadır; bu kayıt onunla
 * `userUid` alanı üzerinden ilişkilendirilebilir (opsiyonel).
 *
 * İlişki tutarlılığı: teacher.classIds ↔ class.teacherIds (batch).
 * Tenant izole; yazma okul yönetimi. Soft delete (status).
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
  writeBatch,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantTeachers, classDoc } from "@/lib/firebase/collections";
import {
  normalizeName,
  validateEmailOptional,
  validatePhoneOptional,
  toMillis,
  type RecordStatus,
} from "@/lib/services/people-validation";

const teacherDoc = (tenantId: string, id: string) =>
  `${tenantTeachers(tenantId)}/${id}`;

export interface TeacherRecord {
  id: string;
  tenantId: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  branch: string;
  classIds: string[];
  status: string;
  /** Bağlı giriş hesabı (users/{uid}) — yoksa boş. */
  userId: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface CreateTeacherInput {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  branch?: string;
}

function mapTeacher(id: string, data: Record<string, unknown>): TeacherRecord {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    schoolId: String(data.schoolId ?? ""),
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    fullName: String(data.fullName ?? ""),
    phone: String(data.phone ?? ""),
    email: String(data.email ?? ""),
    branch: String(data.branch ?? ""),
    classIds: Array.isArray(data.classIds) ? (data.classIds as string[]) : [],
    status: String(data.status ?? "active"),
    userId: String(data.userId ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function listTeachers(tenantId: string): Promise<TeacherRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(query(collection(db, tenantTeachers(tenantId))));
  return snap.docs
    .map((d) => mapTeacher(d.id, d.data()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "tr"));
}

export async function getTeacher(
  tenantId: string,
  id: string,
): Promise<TeacherRecord | null> {
  if (!isFirebaseConfigured() || !db) return null;
  const snap = await getDoc(doc(db, teacherDoc(tenantId, id)));
  return snap.exists() ? mapTeacher(snap.id, snap.data()) : null;
}

export async function createTeacher(
  tenantId: string,
  schoolId: string,
  input: CreateTeacherInput,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const { firstName, lastName, fullName } = normalizeName(input.firstName, input.lastName);
  const email = validateEmailOptional(input.email);
  const phone = validatePhoneOptional(input.phone);
  const ref = doc(collection(db, tenantTeachers(tenantId)));
  await setDoc(ref, {
    tenantId,
    schoolId: schoolId || tenantId,
    firstName,
    lastName,
    fullName,
    phone,
    email,
    branch: (input.branch ?? "").trim(),
    classIds: [],
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export interface UpdateTeacherInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  branch?: string;
}

export async function updateTeacher(
  tenantId: string,
  id: string,
  patch: UpdateTeacherInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const current = await getTeacher(tenantId, id);
    const { firstName, lastName, fullName } = normalizeName(
      patch.firstName ?? current?.firstName ?? "",
      patch.lastName ?? current?.lastName ?? "",
    );
    data.firstName = firstName;
    data.lastName = lastName;
    data.fullName = fullName;
  }
  if (patch.email !== undefined) data.email = validateEmailOptional(patch.email);
  if (patch.phone !== undefined) data.phone = validatePhoneOptional(patch.phone);
  if (patch.branch !== undefined) data.branch = patch.branch.trim();
  await updateDoc(doc(db, teacherDoc(tenantId, id)), data);
}

export async function deactivateTeacher(
  tenantId: string,
  id: string,
  status: RecordStatus = "inactive",
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, teacherDoc(tenantId, id)), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** Öğretmeni bir sınıfa atar (iki taraflı, tek batch). */
export async function assignTeacherToClass(
  tenantId: string,
  teacherId: string,
  classId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const batch = writeBatch(db);
  batch.update(doc(db, teacherDoc(tenantId, teacherId)), {
    classIds: arrayUnion(classId),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, classDoc(tenantId, classId)), {
    teacherIds: arrayUnion(teacherId),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

/** Öğretmeni sınıftan çıkarır (iki taraflı). */
export async function removeTeacherFromClass(
  tenantId: string,
  teacherId: string,
  classId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const batch = writeBatch(db);
  batch.update(doc(db, teacherDoc(tenantId, teacherId)), {
    classIds: arrayRemove(classId),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, classDoc(tenantId, classId)), {
    teacherIds: arrayRemove(teacherId),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}
