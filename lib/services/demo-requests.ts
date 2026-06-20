/**
 * Demo talep servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

import { collection, getDocs, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { createDocument, type CreateResult } from "@/lib/services/firestore-helpers";
import { tenantDemoRequests } from "@/lib/firebase/collections";

/** Demo talepleri platform düzeyinde toplanır (henüz bir tenant'a bağlı değildir). */
const DEMO_TENANT_ID = "platform";

export interface DemoRequestInput {
  institution: string;
  fullName: string;
  role?: string;
  phone: string;
  email: string;
  city?: string;
  institutionType?: string;
  studentCount?: string;
  message?: string;
}

export async function createDemoRequest(
  data: DemoRequestInput,
): Promise<CreateResult> {
  return createDocument(tenantDemoRequests(DEMO_TENANT_ID), {
    ...data,
    type: "demo_request",
    status: "new",
  });
}

export interface DemoRequestRecord {
  id: string;
  institution: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  studentCount: string;
  message: string;
}

/** Platform düzeyindeki demo taleplerini listeler (yalnızca SUPER_ADMIN). */
export async function listDemoRequests(): Promise<DemoRequestRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantDemoRequests(DEMO_TENANT_ID))),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      institution: String(data.institution ?? ""),
      fullName: String(data.fullName ?? ""),
      phone: String(data.phone ?? ""),
      email: String(data.email ?? ""),
      city: String(data.city ?? ""),
      studentCount: String(data.studentCount ?? ""),
      message: String(data.message ?? ""),
    };
  });
}
