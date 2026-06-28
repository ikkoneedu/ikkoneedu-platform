/**
 * Geç-giriş uyarıları — sunucu (Admin SDK) oluşturur; yönetim sebebini sorar,
 * personel yanıtlar. Yol: tenants/{tid}/staffAlerts/{date_uid}.
 */

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantPath } from "@/lib/firebase/collections";

const COLLECTION = "staffAlerts";

export type AlertStatus = "open" | "asked" | "answered";

export interface StaffAlert {
  id: string;
  uid: string;
  name: string;
  department: string;
  phone: string;
  date: string;
  lateMinutes: number;
  checkIn: number | null;
  status: AlertStatus;
  question: string;
  answer: string;
}

function path(tenantId: string): string {
  return tenantPath(tenantId, COLLECTION as never);
}

function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  if (ts && typeof ts.toMillis === "function") return ts.toMillis();
  return typeof v === "number" ? v : null;
}

function mapAlert(id: string, data: Record<string, unknown>): StaffAlert {
  return {
    id,
    uid: String(data.uid ?? ""),
    name: String(data.name ?? ""),
    department: String(data.department ?? ""),
    phone: String(data.phone ?? ""),
    date: String(data.date ?? ""),
    lateMinutes: Number(data.lateMinutes ?? 0) || 0,
    checkIn: toMillis(data.checkIn),
    status: (String(data.status ?? "open") as AlertStatus),
    question: String(data.question ?? ""),
    answer: String(data.answer ?? ""),
  };
}

/** Tüm geç-giriş uyarıları (yönetim). Tarihe göre yeni→eski. */
export async function listStaffAlerts(tenantId: string): Promise<StaffAlert[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(collection(db, path(tenantId)));
  return snap.docs
    .map((d) => mapAlert(d.id, d.data()))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Personelin KENDİSİNE sorulan uyarılar (yanıt bekleyen/yanıtlanan). */
export async function listMyAlerts(tenantId: string, uid: string): Promise<StaffAlert[]> {
  if (!isFirebaseConfigured() || !db) return [];
  let snap;
  try {
    snap = await getDocs(query(collection(db, path(tenantId)), where("uid", "==", uid)));
  } catch {
    return [];
  }
  return snap.docs
    .map((d) => mapAlert(d.id, d.data()))
    .filter((a) => a.status !== "open")
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** Yönetim sebebini sorar (soru + durum 'asked'). */
export async function askAlertReason(
  tenantId: string,
  id: string,
  question: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) throw new Error("Firebase yapılandırılmamış.");
  await updateDoc(doc(db, `${path(tenantId)}/${id}`), {
    question,
    status: "asked",
    updatedAt: serverTimestamp(),
  });
}

/** Personel yanıtlar (yanıt + durum 'answered'). */
export async function answerAlert(
  tenantId: string,
  id: string,
  answer: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) throw new Error("Firebase yapılandırılmamış.");
  await updateDoc(doc(db, `${path(tenantId)}/${id}`), {
    answer,
    status: "answered",
    updatedAt: serverTimestamp(),
  });
}
