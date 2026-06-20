/**
 * Birebir mesajlaşma — veli/öğrenci ↔ öğretmen.
 *
 * Mesajlar kök `directMessages` koleksiyonunda tutulur (tenant recursive
 * kuralı gölgelemesin). Erişim katılımcı bazlıdır: yalnızca `participants`
 * dizisindeki kullanıcılar okur/yazar (Firestore kuralları).
 */

import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

const MESSAGES = "directMessages";

/** İki kullanıcı için kararlı konuşma kimliği. */
export function conversationId(a: string, b: string): string {
  return [a, b].sort().join("__");
}

export interface DirectMessage {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  createdAt: Date | null;
}

export interface SendMessageInput {
  tenantId: string;
  senderUid: string;
  senderName: string;
  recipientUid: string;
  text: string;
}

export async function sendMessage(input: SendMessageInput): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, MESSAGES), {
    conversationId: conversationId(input.senderUid, input.recipientUid),
    participants: [input.senderUid, input.recipientUid],
    senderUid: input.senderUid,
    senderName: input.senderName,
    recipientUid: input.recipientUid,
    text: input.text,
    tenantId: input.tenantId,
    createdAt: serverTimestamp(),
  });
}

/**
 * İki kullanıcı arasındaki mesajları döner (eski → yeni).
 * Tek eşitlik sorgusu + istemci sıralaması (composite index gerekmez).
 */
export async function listConversation(
  myUid: string,
  otherUid: string,
): Promise<DirectMessage[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(
      collection(db, MESSAGES),
      where("conversationId", "==", conversationId(myUid, otherUid)),
    ),
  );
  const items = snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toDate?: () => Date } | null | undefined;
    return {
      id: d.id,
      senderUid: String(data.senderUid ?? ""),
      senderName: String(data.senderName ?? ""),
      text: String(data.text ?? ""),
      createdAt: ts?.toDate ? ts.toDate() : null,
    };
  });
  items.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));
  return items;
}
