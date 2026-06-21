/**
 * Finans / ödeme servisi — `tenants/{tenantId}/payments`.
 *
 * Basit, muhasebe DEĞİL: öğrenci bazlı ödeme durumu takibi.
 * Durumlar: PENDING (bekliyor), PARTIAL (kısmi), PAID (ödendi), OVERDUE (gecikmiş).
 *
 * Yetki: okuma tenant üyesi (veli/öğrenci kendi okulunu görür), yazma okul
 * personeli (Firestore kuralları zorlar). Tenant izole.
 */

import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantPath, COLLECTIONS } from "@/lib/firebase/collections";

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";

export const PAYMENT_STATUSES: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID", "OVERDUE"];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  PARTIAL: "Kısmi Ödeme",
  PAID: "Ödendi",
  OVERDUE: "Gecikmiş",
};

export function paymentStatusLabel(s: string): string {
  return PAYMENT_STATUS_LABELS[s] ?? s;
}

const paymentsPath = (tenantId: string) =>
  tenantPath(tenantId, COLLECTIONS.PAYMENTS);

export interface PaymentRecord {
  id: string;
  studentName: string;
  /** Bağlı öğrenci uid (opsiyonel). */
  studentUid: string;
  grade: string;
  /** Toplam tutar (TL). */
  amount: number;
  /** Ödenen tutar (TL). */
  paidAmount: number;
  dueDate: string;
  status: PaymentStatus;
  note: string;
  createdAt: number | null;
}

export interface CreatePaymentInput {
  studentName: string;
  studentUid?: string;
  grade?: string;
  amount: number;
  dueDate?: string;
  note?: string;
}

const num = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
};

/** Tutara göre durumu türetir (gecikme hariç). */
function deriveStatus(amount: number, paid: number): PaymentStatus {
  if (paid <= 0) return "PENDING";
  if (paid >= amount) return "PAID";
  return "PARTIAL";
}

/** Yeni ödeme/tahakkuk kaydı oluşturur (personel). */
export async function createPayment(
  tenantId: string,
  input: CreatePaymentInput,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await addDoc(collection(db, paymentsPath(tenantId)), {
    studentName: input.studentName,
    studentUid: input.studentUid ?? "",
    grade: input.grade ?? "",
    amount: input.amount,
    paidAmount: 0,
    dueDate: input.dueDate ?? "",
    status: "PENDING",
    note: input.note ?? "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/** Tenant'taki ödemeleri listeler (tenant üyesi). */
export async function listPayments(tenantId: string): Promise<PaymentRecord[]> {
  if (!isFirebaseConfigured() || !db || !tenantId) return [];
  const snap = await getDocs(query(collection(db, paymentsPath(tenantId))));
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt as { toMillis?: () => number } | undefined;
    return {
      id: d.id,
      studentName: String(data.studentName ?? ""),
      studentUid: String(data.studentUid ?? ""),
      grade: String(data.grade ?? ""),
      amount: num(data.amount),
      paidAmount: num(data.paidAmount),
      dueDate: String(data.dueDate ?? ""),
      status: (String(data.status ?? "PENDING") as PaymentStatus),
      note: String(data.note ?? ""),
      createdAt: ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
}

/** Ödenen tutarı günceller; durumu otomatik türetir (gecikme korunur). */
export async function recordPayment(
  tenantId: string,
  paymentId: string,
  paidAmount: number,
  amount: number,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, `${paymentsPath(tenantId)}/${paymentId}`), {
    paidAmount,
    status: deriveStatus(amount, paidAmount),
    updatedAt: serverTimestamp(),
  });
}

/** Durumu doğrudan ayarlar (ör. OVERDUE işaretleme). */
export async function setPaymentStatus(
  tenantId: string,
  paymentId: string,
  status: PaymentStatus,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await updateDoc(doc(db, `${paymentsPath(tenantId)}/${paymentId}`), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export interface PaymentSummary {
  total: number;
  collected: number;
  outstanding: number;
  byStatus: Record<PaymentStatus, number>;
}

/** Liste üzerinden özet hesaplar (istemci tarafı). */
export function summarizePayments(rows: PaymentRecord[]): PaymentSummary {
  const byStatus: Record<PaymentStatus, number> = {
    PENDING: 0,
    PARTIAL: 0,
    PAID: 0,
    OVERDUE: 0,
  };
  let total = 0;
  let collected = 0;
  for (const r of rows) {
    total += r.amount;
    collected += r.paidAmount;
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
  }
  return { total, collected, outstanding: total - collected, byStatus };
}
