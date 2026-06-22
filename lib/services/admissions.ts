/**
 * Kayıt Kabul (Admissions) servisi — aday öğrenci operasyon akışı.
 *
 *   tenants/{tenantId}/admissions/{admissionId}
 *   tenants/{tenantId}/admissionMeetings/{meetingId}
 *
 * Tenant izole; yazma yetkisi (admin/müdür/yrd./koordinatör/SALES/PR) Firestore
 * kurallarıyla zorlanır. AI yok; yalnızca operasyonel kayıt/güncelleme.
 *
 * GÜVENLİK: tenantId/schoolId çağıran tarafça doğrulanmış profilden geçilir.
 */

import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  tenantLeads,
  tenantScholarshipApplications,
  platformLeads,
} from "@/lib/firebase/collections";
import { toMillis } from "@/lib/services/people-validation";
import type { LeadRecord, PlatformLeadRecord } from "@/lib/services/leads";
import type { ScholarshipApplicationRecord } from "@/lib/services/scholarship-applications";

const admissionsPath = (t: string) => `tenants/${t}/admissions`;
const meetingsPath = (t: string) => `tenants/${t}/admissionMeetings`;
const admissionDoc = (t: string, id: string) => `${admissionsPath(t)}/${id}`;
const meetingDoc = (t: string, id: string) => `${meetingsPath(t)}/${id}`;

/* ----------------------------- Sabitler ---------------------------------- */

export const ADMISSION_SOURCES = [
  "demo_request",
  "platform_lead",
  "crm_lead",
  "scholarship",
  "manual",
  "website",
] as const;
export type AdmissionSource = (typeof ADMISSION_SOURCES)[number];

export const ADMISSION_STATUSES = [
  "new",
  "contacted",
  "meeting_scheduled",
  "interview_done",
  "offer_sent",
  "registered",
  "lost",
] as const;
export type AdmissionStatus = (typeof ADMISSION_STATUSES)[number];

export const ADMISSION_PRIORITIES = ["low", "normal", "high"] as const;
export type AdmissionPriority = (typeof ADMISSION_PRIORITIES)[number];

export const MEETING_TYPES = ["phone", "online", "in_person"] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const MEETING_STATUSES = ["scheduled", "completed", "cancelled", "no_show"] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export const SOURCE_LABELS: Record<string, string> = {
  demo_request: "Demo Talebi",
  platform_lead: "Platform Lead",
  crm_lead: "CRM Lead",
  scholarship: "Bursluluk",
  manual: "Manuel",
  website: "Web Sitesi",
};
export const ADMISSION_STATUS_LABELS: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime geçildi",
  meeting_scheduled: "Görüşme planlandı",
  interview_done: "Görüşme yapıldı",
  offer_sent: "Teklif gönderildi",
  registered: "Kayıt oldu",
  lost: "Kaybedildi",
};
export const PRIORITY_LABELS: Record<string, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
};
export const MEETING_TYPE_LABELS: Record<string, string> = {
  phone: "Telefon",
  online: "Online",
  in_person: "Yüz yüze",
};
export const MEETING_STATUS_LABELS: Record<string, string> = {
  scheduled: "Planlandı",
  completed: "Tamamlandı",
  cancelled: "İptal",
  no_show: "Gelmedi",
};

export function sourceLabel(s: string): string {
  return SOURCE_LABELS[s] ?? s;
}
export function admissionStatusLabel(s: string): string {
  return ADMISSION_STATUS_LABELS[s] ?? s;
}
export function priorityLabel(s: string): string {
  return PRIORITY_LABELS[s] ?? s;
}
export function meetingTypeLabel(s: string): string {
  return MEETING_TYPE_LABELS[s] ?? s;
}
export function meetingStatusLabel(s: string): string {
  return MEETING_STATUS_LABELS[s] ?? s;
}

/* ----------------------------- Tipler ------------------------------------ */

export interface AdmissionNote {
  text: string;
  author: string;
  at: number;
}

export interface AdmissionRecord {
  id: string;
  tenantId: string;
  schoolId: string;
  source: string;
  leadId: string;
  scholarshipApplicationNo: string;
  studentName: string;
  studentGrade: string;
  currentSchool: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  city: string;
  district: string;
  status: string;
  priority: string;
  assignedTo: string;
  notes: AdmissionNote[];
  meetingDate: string;
  /** Kesin kayıt sonrası oluşturulan kayıt kimlikleri (idempotency). */
  registeredStudentId: string;
  registeredParentId: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface CreateAdmissionInput {
  source: AdmissionSource;
  studentName: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  studentGrade?: string;
  currentSchool?: string;
  city?: string;
  district?: string;
  priority?: AdmissionPriority;
  assignedTo?: string;
  leadId?: string;
  scholarshipApplicationNo?: string;
}

function mapAdmission(id: string, data: Record<string, unknown>): AdmissionRecord {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    schoolId: String(data.schoolId ?? ""),
    source: String(data.source ?? "manual"),
    leadId: String(data.leadId ?? ""),
    scholarshipApplicationNo: String(data.scholarshipApplicationNo ?? ""),
    studentName: String(data.studentName ?? ""),
    studentGrade: String(data.studentGrade ?? ""),
    currentSchool: String(data.currentSchool ?? ""),
    parentName: String(data.parentName ?? ""),
    parentPhone: String(data.parentPhone ?? ""),
    parentEmail: String(data.parentEmail ?? ""),
    city: String(data.city ?? ""),
    district: String(data.district ?? ""),
    status: String(data.status ?? "new"),
    priority: String(data.priority ?? "normal"),
    assignedTo: String(data.assignedTo ?? ""),
    notes: Array.isArray(data.notes)
      ? (data.notes as Record<string, unknown>[]).map((n) => ({
          text: String(n.text ?? ""),
          author: String(n.author ?? ""),
          at: Number(n.at ?? 0),
        }))
      : [],
    meetingDate: String(data.meetingDate ?? ""),
    registeredStudentId: String(data.registeredStudentId ?? ""),
    registeredParentId: String(data.registeredParentId ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/* ----------------------------- CRUD -------------------------------------- */

export async function createAdmission(
  tenantId: string,
  schoolId: string,
  input: CreateAdmissionInput,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const studentName = input.studentName.trim();
  const parentName = input.parentName.trim();
  const parentPhone = input.parentPhone.trim();
  if (!studentName) throw new Error("Öğrenci adı zorunludur.");
  if (!parentName) throw new Error("Veli adı zorunludur.");
  if (!parentPhone) throw new Error("Veli telefonu zorunludur.");
  if (!ADMISSION_SOURCES.includes(input.source)) throw new Error("Geçersiz kaynak.");
  const priority = input.priority ?? "normal";
  if (!ADMISSION_PRIORITIES.includes(priority)) throw new Error("Geçersiz öncelik.");

  const ref = await addDoc(collection(db, admissionsPath(tenantId)), {
    tenantId,
    schoolId: schoolId || tenantId,
    source: input.source,
    leadId: input.leadId ?? "",
    scholarshipApplicationNo: input.scholarshipApplicationNo ?? "",
    studentName,
    studentGrade: (input.studentGrade ?? "").trim(),
    currentSchool: (input.currentSchool ?? "").trim(),
    parentName,
    parentPhone,
    parentEmail: (input.parentEmail ?? "").trim(),
    city: (input.city ?? "").trim(),
    district: (input.district ?? "").trim(),
    status: "new",
    priority,
    assignedTo: input.assignedTo ?? "",
    notes: [],
    meetingDate: "",
    registeredStudentId: "",
    registeredParentId: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listAdmissions(tenantId: string): Promise<AdmissionRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(query(collection(db, admissionsPath(tenantId))));
  return snap.docs
    .map((d) => mapAdmission(d.id, d.data()))
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}

export async function getAdmission(
  tenantId: string,
  id: string,
): Promise<AdmissionRecord | null> {
  if (!isFirebaseConfigured() || !db) return null;
  const snap = await getDoc(doc(db, admissionDoc(tenantId, id)));
  return snap.exists() ? mapAdmission(snap.id, snap.data()) : null;
}

export interface UpdateAdmissionInput {
  studentName?: string;
  studentGrade?: string;
  currentSchool?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  city?: string;
  district?: string;
  priority?: AdmissionPriority;
  assignedTo?: string;
  meetingDate?: string;
}

export async function updateAdmission(
  tenantId: string,
  id: string,
  patch: UpdateAdmissionInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const data: Record<string, unknown> = { updatedAt: serverTimestamp() };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) data[k] = typeof v === "string" ? v.trim() : v;
  }
  await updateDoc(doc(db, admissionDoc(tenantId, id)), data);
}

export async function updateAdmissionStatus(
  tenantId: string,
  id: string,
  status: AdmissionStatus,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  if (!ADMISSION_STATUSES.includes(status)) throw new Error("Geçersiz durum.");
  await updateDoc(doc(db, admissionDoc(tenantId, id)), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function addAdmissionNote(
  tenantId: string,
  id: string,
  text: string,
  author: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const note: AdmissionNote = { text: text.trim(), author, at: Date.now() };
  if (!note.text) return;
  await updateDoc(doc(db, admissionDoc(tenantId, id)), {
    notes: arrayUnion(note),
    updatedAt: serverTimestamp(),
  });
}

export async function assignAdmission(
  tenantId: string,
  id: string,
  assignedTo: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, admissionDoc(tenantId, id)), {
    assignedTo,
    updatedAt: serverTimestamp(),
  });
}

/** Kesin kayıt sonrası oluşturulan student/parent kimliklerini işler. */
export async function markAdmissionRegistered(
  tenantId: string,
  id: string,
  studentId: string,
  parentId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, admissionDoc(tenantId, id)), {
    registeredStudentId: studentId,
    registeredParentId: parentId,
    status: "registered",
    updatedAt: serverTimestamp(),
  });
}

/* ----------------------------- Görüşmeler -------------------------------- */

export interface AdmissionMeetingRecord {
  id: string;
  tenantId: string;
  schoolId: string;
  admissionId: string;
  title: string;
  parentName: string;
  parentPhone: string;
  meetingDate: string;
  meetingType: string;
  assignedTo: string;
  status: string;
  notes: string;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface ScheduleMeetingInput {
  admissionId: string;
  title: string;
  parentName: string;
  parentPhone: string;
  meetingDate: string;
  meetingType: MeetingType;
  assignedTo?: string;
  notes?: string;
}

function mapMeeting(id: string, data: Record<string, unknown>): AdmissionMeetingRecord {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    schoolId: String(data.schoolId ?? ""),
    admissionId: String(data.admissionId ?? ""),
    title: String(data.title ?? ""),
    parentName: String(data.parentName ?? ""),
    parentPhone: String(data.parentPhone ?? ""),
    meetingDate: String(data.meetingDate ?? ""),
    meetingType: String(data.meetingType ?? "phone"),
    assignedTo: String(data.assignedTo ?? ""),
    status: String(data.status ?? "scheduled"),
    notes: String(data.notes ?? ""),
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/**
 * Aday için görüşme planlar. Görüşme belgesi oluşturulur ve admission'ın
 * meetingDate + status (meeting_scheduled) alanları güncellenir (tek batch).
 */
export async function scheduleAdmissionMeeting(
  tenantId: string,
  schoolId: string,
  input: ScheduleMeetingInput,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  if (!input.meetingDate) throw new Error("Görüşme tarihi zorunludur.");
  if (!MEETING_TYPES.includes(input.meetingType)) throw new Error("Geçersiz görüşme türü.");

  const batch = writeBatch(db);
  const meetingRef = doc(collection(db, meetingsPath(tenantId)));
  batch.set(meetingRef, {
    tenantId,
    schoolId: schoolId || tenantId,
    admissionId: input.admissionId,
    title: input.title.trim() || "Aday görüşmesi",
    parentName: input.parentName,
    parentPhone: input.parentPhone,
    meetingDate: input.meetingDate,
    meetingType: input.meetingType,
    assignedTo: input.assignedTo ?? "",
    status: "scheduled",
    notes: (input.notes ?? "").trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, admissionDoc(tenantId, input.admissionId)), {
    meetingDate: input.meetingDate,
    status: "meeting_scheduled",
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
  return meetingRef.id;
}

export async function listAdmissionMeetings(
  tenantId: string,
  admissionId?: string,
): Promise<AdmissionMeetingRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const col = collection(db, meetingsPath(tenantId));
  const snap = admissionId
    ? await getDocs(query(col, where("admissionId", "==", admissionId)))
    : await getDocs(query(col));
  return snap.docs
    .map((d) => mapMeeting(d.id, d.data()))
    .sort((a, b) => a.meetingDate.localeCompare(b.meetingDate));
}

export async function updateAdmissionMeetingStatus(
  tenantId: string,
  meetingId: string,
  status: MeetingStatus,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  if (!MEETING_STATUSES.includes(status)) throw new Error("Geçersiz görüşme durumu.");
  await updateDoc(doc(db, meetingDoc(tenantId, meetingId)), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/* ----------------------- Lead / Bursluluk → Admission -------------------- */

/** Aynı leadId'den admission var mı? (tekrarı önler) */
async function admissionExistsForLead(tenantId: string, leadId: string): Promise<boolean> {
  if (!db || !leadId) return false;
  const snap = await getDocs(
    query(collection(db, admissionsPath(tenantId)), where("leadId", "==", leadId)),
  );
  return !snap.empty;
}

async function admissionExistsForScholarship(
  tenantId: string,
  applicationNo: string,
): Promise<boolean> {
  if (!db || !applicationNo) return false;
  const snap = await getDocs(
    query(
      collection(db, admissionsPath(tenantId)),
      where("scholarshipApplicationNo", "==", applicationNo),
    ),
  );
  return !snap.empty;
}

/**
 * Tenant içi CRM lead'inden aday oluşturur. Aynı lead'den ikinci kez
 * oluşturulmaz. Lead'e `convertedToAdmissionId` yazılır (best-effort).
 */
export async function createAdmissionFromLead(
  tenantId: string,
  schoolId: string,
  lead: LeadRecord,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  if (await admissionExistsForLead(tenantId, lead.id)) {
    throw new Error("Bu lead zaten adaya dönüştürülmüş.");
  }
  const admissionId = await createAdmission(tenantId, schoolId, {
    source: "crm_lead",
    leadId: lead.id,
    studentName: lead.fullName || "Aday öğrenci",
    parentName: lead.fullName || "Veli",
    parentPhone: lead.phone || "—",
    parentEmail: lead.email,
  });
  try {
    await updateDoc(doc(db, `${tenantLeads(tenantId)}/${lead.id}`), {
      convertedToAdmissionId: admissionId,
      updatedAt: serverTimestamp(),
    });
  } catch {
    /* lead güncellemesi başarısız olsa da admission oluşturuldu */
  }
  return admissionId;
}

/**
 * Platform satış lead'inden (kök platformLeads) aday oluşturur. Yalnızca
 * SUPER_ADMIN bağlamı (platformLeads okuma/yazma süper admin). Hedef tenant
 * çağıran tarafından seçilir. Aynı lead'den ikinci aday engellenir.
 */
export async function createAdmissionFromPlatformLead(
  tenantId: string,
  schoolId: string,
  lead: PlatformLeadRecord,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  if (await admissionExistsForLead(tenantId, lead.id)) {
    throw new Error("Bu platform lead'i zaten adaya dönüştürülmüş.");
  }
  const admissionId = await createAdmission(tenantId, schoolId, {
    source: "platform_lead",
    leadId: lead.id,
    studentName: lead.contactName || lead.institution || "Aday öğrenci",
    parentName: lead.contactName || "Veli",
    parentPhone: lead.phone || "—",
    parentEmail: lead.email,
    city: lead.city,
    currentSchool: lead.institution,
  });
  try {
    await updateDoc(doc(db, `${platformLeads()}/${lead.id}`), {
      convertedToAdmissionId: admissionId,
      updatedAt: serverTimestamp(),
    });
  } catch {
    /* platform lead güncellemesi başarısız olsa da admission oluşturuldu */
  }
  return admissionId;
}

/**
 * Bursluluk başvurusundan aday oluşturur. Aynı başvuru numarasından ikinci kez
 * oluşturulmaz. Başvuruya `convertedToAdmissionId` yazılır (best-effort).
 */
export async function createAdmissionFromScholarship(
  tenantId: string,
  schoolId: string,
  app: ScholarshipApplicationRecord,
): Promise<string> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  if (await admissionExistsForScholarship(tenantId, app.applicationNo)) {
    throw new Error("Bu başvuru zaten adaya dönüştürülmüş.");
  }
  const admissionId = await createAdmission(tenantId, schoolId, {
    source: "scholarship",
    scholarshipApplicationNo: app.applicationNo,
    studentName: app.studentName || "Aday öğrenci",
    parentName: app.parentName || "Veli",
    parentPhone: app.parentPhone || "—",
    parentEmail: app.parentEmail,
  });
  try {
    await updateDoc(
      doc(db, `${tenantScholarshipApplications(tenantId)}/${app.id}`),
      { convertedToAdmissionId: admissionId, updatedAt: serverTimestamp() },
    );
  } catch {
    /* başvuru güncellemesi başarısız olsa da admission oluşturuldu */
  }
  return admissionId;
}
