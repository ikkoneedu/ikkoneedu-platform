/**
 * Veli servisi — `tenants/{tenantId}/parents/{parentId}`.
 *
 * İlişki tutarlılığı: parent.linkedStudentIds ↔ student.parentIds (batch).
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
import { tenantParents, tenantStudents } from "@/lib/firebase/collections";
import {
  normalizeName,
  validateEmailOptional,
  validatePhoneOptional,
  toMillis,
  type RecordStatus,
} from "@/lib/services/people-validation";

const parentDoc = (tenantId: string, id: string) =>
  `${tenantParents(tenantId)}/${id}`;
const studentDoc = (tenantId: string, id: string) =>
  `${tenantStudents(tenantId)}/${id}`;

export interface ParentRecord {
  id: string;
  tenantId: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  linkedStudentIds: string[];
  status: string;
  /** Bağlı giriş hesabı (users/{uid}) — yoksa boş. */
  userId: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface CreateParentInput {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

function mapParent(id: string, data: Record<string, unknown>): ParentRecord {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    schoolId: String(data.schoolId ?? ""),
    firstName: String(data.firstName ?? ""),
    lastName: String(data.lastName ?? ""),
    fullName: String(data.fullName ?? ""),
    phone: String(data.phone ?? ""),
    email: String(data.email ?? ""),
    linkedStudentIds: Array.isArray(data.linkedStudentIds)
      ? (data.linkedStudentIds as string[])
      : [],
    status: String(data.status ?? "active"),
    userId: String(data.userId ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function listParents(tenantId: string): Promise<ParentRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(query(collection(db, tenantParents(tenantId))));
  return snap.docs
    .map((d) => mapParent(d.id, d.data()))
    .sort((a, b) => a.fullName.localeCompare(b.fullName, "tr"));
}

export async function getParent(
  tenantId: string,
  id: string,
): Promise<ParentRecord | null> {
  if (!isFirebaseConfigured() || !db) return null;
  const snap = await getDoc(doc(db, parentDoc(tenantId, id)));
  return snap.exists() ? mapParent(snap.id, snap.data()) : null;
}

export async function createParent(
  tenantId: string,
  schoolId: string,
  input: CreateParentInput,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const { firstName, lastName, fullName } = normalizeName(input.firstName, input.lastName);
  const email = validateEmailOptional(input.email);
  const phone = validatePhoneOptional(input.phone);
  const ref = doc(collection(db, tenantParents(tenantId)));
  await setDoc(ref, {
    tenantId,
    schoolId: schoolId || tenantId,
    firstName,
    lastName,
    fullName,
    phone,
    email,
    linkedStudentIds: [],
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export interface UpdateParentInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export async function updateParent(
  tenantId: string,
  id: string,
  patch: UpdateParentInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (patch.firstName !== undefined || patch.lastName !== undefined) {
    const current = await getParent(tenantId, id);
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
  await updateDoc(doc(db, parentDoc(tenantId, id)), data);
}

export async function deactivateParent(
  tenantId: string,
  id: string,
  status: RecordStatus = "inactive",
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, parentDoc(tenantId, id)), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** Veli ↔ öğrenci bağı kurar (iki taraflı, tek batch). */
export async function linkParentToStudent(
  tenantId: string,
  parentId: string,
  studentId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const batch = writeBatch(db);
  batch.update(doc(db, parentDoc(tenantId, parentId)), {
    linkedStudentIds: arrayUnion(studentId),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, studentDoc(tenantId, studentId)), {
    parentIds: arrayUnion(parentId),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}

/** Veli ↔ öğrenci bağını kaldırır (iki taraflı). */
export async function unlinkParentFromStudent(
  tenantId: string,
  parentId: string,
  studentId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const batch = writeBatch(db);
  batch.update(doc(db, parentDoc(tenantId, parentId)), {
    linkedStudentIds: arrayRemove(studentId),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, studentDoc(tenantId, studentId)), {
    parentIds: arrayRemove(parentId),
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}
