/**
 * Demo talep servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

import { collection, getDocs, query } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { createDocument, type CreateResult } from "@/lib/services/firestore-helpers";
import {
  tenantDemoRequests,
  platformDemoRequests,
} from "@/lib/firebase/collections";

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
  // Platform düzeyi (kök) koleksiyon — bir okula bağlı değildir.
  return createDocument(platformDemoRequests(), {
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
    query(collection(db, platformDemoRequests())),
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

/* -------------------------------------------------------------------------- */
/*  Okula özel aday/iletişim talepleri (belirli bir tenant'a yazılır)         */
/* -------------------------------------------------------------------------- */

export interface SchoolInquiryInput {
  schoolName: string;
  fullName: string;
  phone: string;
  email: string;
  /** İlgilenilen sınıf/kademe (opsiyonel). */
  grade?: string;
  message?: string;
}

/**
 * Aday velinin belirli bir okula gönderdiği bilgi/iletişim talebi.
 * `tenants/{tenantId}/demoRequests` altına yazılır (anonim/halka açık oluşturma);
 * okul personeli bunu CRM gelen kutusunda görür.
 */
export async function createSchoolInquiry(
  tenantId: string,
  data: SchoolInquiryInput,
): Promise<CreateResult> {
  return createDocument(tenantDemoRequests(tenantId), {
    ...data,
    institution: data.schoolName,
    type: "school_inquiry",
    status: "new",
  });
}

export interface SchoolInquiryRecord {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  grade: string;
  message: string;
  type: string;
  status: string;
  createdAt: number | null;
}

/** Bir okulun aldığı aday/iletişim taleplerini listeler (tenant üyesi). */
export async function listSchoolInquiries(
  tenantId: string,
): Promise<SchoolInquiryRecord[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(
    query(collection(db, tenantDemoRequests(tenantId))),
  );
  return snap.docs.map((d) => {
    const data = d.data();
    const ts = data.createdAt;
    return {
      id: d.id,
      fullName: String(data.fullName ?? ""),
      phone: String(data.phone ?? ""),
      email: String(data.email ?? ""),
      grade: String(data.grade ?? ""),
      message: String(data.message ?? ""),
      type: String(data.type ?? "school_inquiry"),
      status: String(data.status ?? "new"),
      createdAt:
        ts && typeof ts.toMillis === "function" ? ts.toMillis() : null,
    };
  });
}
