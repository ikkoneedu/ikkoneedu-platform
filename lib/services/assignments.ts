/**
 * Ödev/Görev servisi — öğretmen sınıfa ödev verir, öğrenci/veli görür.
 *
 * Yazma: personel (Firestore kuralları). Okuma: tenant üyeleri.
 * Sınıf bazlı filtreleme istemci tarafında classId ile yapılır.
 */

import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

/** tenants/{tenantId}/assignments */
const assignmentsPath = (tenantId: string) => `tenants/${tenantId}/assignments`;

export interface AssignmentInput {
  tenantId: string;
  authorUid: string;
  authorName: string;
  title: string;
  description: string;
  dueDate?: string;
  classId?: string;
  className?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  authorName: string;
  classId: string;
  className: string;
  createdAt: Date | null;
}

export async function createAssignment(input: AssignmentInput): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, assignmentsPath(input.tenantId)), {
    title: input.title,
    description: input.description,
    dueDate: input.dueDate ?? "",
    classId: input.classId ?? "",
    className: input.className ?? "",
    authorUid: input.authorUid,
    authorName: input.authorName,
    createdAt: serverTimestamp(),
  });
}

/** Son ödevler (yeni → eski). İstemci classId'e göre filtreleyebilir. */
export async function listAssignments(
  tenantId: string,
  max = 30,
): Promise<Assignment[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, assignmentsPath(tenantId)),
      orderBy("createdAt", "desc"),
      limit(max),
    ),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toDate?: () => Date } | null | undefined;
    return {
      id: d.id,
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      dueDate: String(data.dueDate ?? ""),
      authorName: String(data.authorName ?? ""),
      classId: String(data.classId ?? ""),
      className: String(data.className ?? ""),
      createdAt: ts?.toDate ? ts.toDate() : null,
    };
  });
}
