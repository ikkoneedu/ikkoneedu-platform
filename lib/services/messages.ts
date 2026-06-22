/**
 * Mesaj servisi — `tenants/{tenantId}/messages` (uygulama içi, FCM YOK).
 *
 * Erişim: yalnızca gönderen (senderId) ve alıcılar (recipientIds). Tenant
 * izolasyonu Firestore kurallarıyla zorlanır; bu servis yalnızca veri yazar/okur.
 *
 * Güvenlik notları:
 *  - `tenantId`/`senderId`/`senderRole` çağıran tarafından doğrulanmış profilden
 *    geçilmeli (istemci körü körüne kabul edilmez — kurallar da zorlar).
 *  - `deleted`/`archived` SOFT durumdur; belge gerçekten silinmez.
 *  - `readBy` yalnızca okuyan kullanıcının uid'i ile arrayUnion edilir.
 */

import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantMessages } from "@/lib/firebase/collections";

export const MESSAGE_STATUSES = ["sent", "archived", "deleted"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export interface MessageRecord {
  id: string;
  tenantId: string;
  schoolId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[];
  recipientRoles: string[];
  subject: string;
  body: string;
  status: string;
  readBy: string[];
  createdAt: number | null;
  updatedAt: number | null;
}

export interface SendMessageInput {
  tenantId: string;
  schoolId?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[];
  recipientRoles?: string[];
  subject: string;
  body: string;
}

function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  return ts && typeof ts.toMillis === "function" ? ts.toMillis() : null;
}

function mapMessage(id: string, data: Record<string, unknown>): MessageRecord {
  return {
    id,
    tenantId: String(data.tenantId ?? ""),
    schoolId: String(data.schoolId ?? ""),
    senderId: String(data.senderId ?? ""),
    senderName: String(data.senderName ?? ""),
    senderRole: String(data.senderRole ?? ""),
    recipientIds: Array.isArray(data.recipientIds)
      ? (data.recipientIds as string[])
      : [],
    recipientRoles: Array.isArray(data.recipientRoles)
      ? (data.recipientRoles as string[])
      : [],
    subject: String(data.subject ?? ""),
    body: String(data.body ?? ""),
    status: String(data.status ?? "sent"),
    readBy: Array.isArray(data.readBy) ? (data.readBy as string[]) : [],
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

/** Mesaj gönderir (status = sent). Oluşturulan belge kimliğini döner. */
export async function sendMessage(input: SendMessageInput): Promise<string | null> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  if (input.recipientIds.length === 0) {
    throw new Error("En az bir alıcı seçin.");
  }
  const ref = await addDoc(collection(db, tenantMessages(input.tenantId)), {
    tenantId: input.tenantId,
    schoolId: input.schoolId ?? input.tenantId,
    senderId: input.senderId,
    senderName: input.senderName,
    senderRole: input.senderRole,
    recipientIds: input.recipientIds,
    recipientRoles: input.recipientRoles ?? [],
    subject: input.subject,
    body: input.body,
    status: "sent",
    readBy: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export interface UserMessages {
  inbox: MessageRecord[];
  sent: MessageRecord[];
}

/**
 * Geçerli kullanıcının mesajlarını döner: gelen (alıcısı olduğu) + giden
 * (gönderdiği). İki ayrı eşitlik/array-contains sorgusu + istemci sıralaması.
 * `deleted` durumundakiler gizlenir (soft delete).
 */
export async function listMessagesForCurrentUser(
  tenantId: string,
  uid: string,
): Promise<UserMessages> {
  if (!isFirebaseConfigured() || !db || !tenantId || !uid) {
    return { inbox: [], sent: [] };
  }
  const col = collection(db, tenantMessages(tenantId));
  const [inboxSnap, sentSnap] = await Promise.all([
    getDocs(query(col, where("recipientIds", "array-contains", uid))),
    getDocs(query(col, where("senderId", "==", uid))),
  ]);
  const sortDesc = (a: MessageRecord, b: MessageRecord) =>
    (b.createdAt ?? 0) - (a.createdAt ?? 0);
  const inbox = inboxSnap.docs
    .map((d) => mapMessage(d.id, d.data()))
    .filter((m) => m.status !== "deleted")
    .sort(sortDesc);
  const sent = sentSnap.docs
    .map((d) => mapMessage(d.id, d.data()))
    .filter((m) => m.status !== "deleted")
    .sort(sortDesc);
  return { inbox, sent };
}

/** Mesajı okuyan kullanıcının uid'ini readBy'a ekler (yalnızca kendisi). */
export async function markMessageRead(
  tenantId: string,
  messageId: string,
  uid: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await updateDoc(doc(db, `${tenantMessages(tenantId)}/${messageId}`), {
    readBy: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });
}

/** Mesaj durumunu değiştirir (archived/deleted — SOFT; gerçek silme yok). */
export async function setMessageStatus(
  tenantId: string,
  messageId: string,
  status: MessageStatus,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) return;
  await updateDoc(doc(db, `${tenantMessages(tenantId)}/${messageId}`), {
    status,
    updatedAt: serverTimestamp(),
  });
}
