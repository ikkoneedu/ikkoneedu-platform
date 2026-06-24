/**
 * Ödev teslim takibi — öğrenci ödevi "teslim ettim" işaretler, öğretmen kaç
 * öğrencinin teslim ettiğini görür. `tenants/{tenantId}/assignmentSubmissions`.
 *
 * Belge kimliği deterministiktir (`${assignmentId}__${studentUid}`) — her öğrenci
 * bir ödev için tek kayıt tutar (mükerrer engellenir). Yetki Firestore kurallarıyla
 * zorlanır: öğrenci yalnız kendi kaydını oluşturur/günceller; personel hepsini okur.
 * Tenant izole.
 */

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

/** tenants/{tenantId}/assignmentSubmissions */
const submissionsPath = (tenantId: string) =>
  `tenants/${tenantId}/assignmentSubmissions`;

const submissionId = (assignmentId: string, studentUid: string) =>
  `${assignmentId}__${studentUid}`;

export type SubmissionStatus = "submitted" | "withdrawn";

export interface SubmissionRecord {
  id: string;
  assignmentId: string;
  studentUid: string;
  studentName: string;
  status: SubmissionStatus;
}

function mapRow(id: string, data: Record<string, unknown>): SubmissionRecord {
  return {
    id,
    assignmentId: String(data.assignmentId ?? ""),
    studentUid: String(data.studentUid ?? ""),
    studentName: String(data.studentName ?? ""),
    status: (String(data.status ?? "submitted") as SubmissionStatus),
  };
}

/** Öğrenci: ödevi teslim ettim olarak işaretler (deterministik kimlik). */
export async function markSubmitted(
  tenantId: string,
  assignmentId: string,
  studentUid: string,
  studentName: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await setDoc(
    doc(db, `${submissionsPath(tenantId)}/${submissionId(assignmentId, studentUid)}`),
    {
      assignmentId,
      studentUid,
      studentName,
      status: "submitted",
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/** Öğrenci: teslimi geri alır (status 'withdrawn'). */
export async function withdrawSubmission(
  tenantId: string,
  assignmentId: string,
  studentUid: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await updateDoc(
    doc(db, `${submissionsPath(tenantId)}/${submissionId(assignmentId, studentUid)}`),
    { status: "withdrawn", updatedAt: serverTimestamp() },
  );
}

/** Öğrenci: yalnızca kendi teslimleri. */
export async function listMySubmissions(
  tenantId: string,
  studentUid: string,
): Promise<SubmissionRecord[]> {
  if (!isFirebaseConfigured() || !db || !studentUid) return [];
  const snap = await getDocs(
    query(collection(db, submissionsPath(tenantId)), where("studentUid", "==", studentUid)),
  );
  return snap.docs.map((d) => mapRow(d.id, d.data()));
}

/** Personel: tenant'taki tüm teslimler (ödev başına sayım için). */
export async function listAllSubmissions(
  tenantId: string,
): Promise<SubmissionRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(collection(db, submissionsPath(tenantId)));
  return snap.docs.map((d) => mapRow(d.id, d.data()));
}
