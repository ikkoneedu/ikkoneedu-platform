/**
 * Demo talep servisi — Firestore'a yazmaya hazır.
 * Mock modda (env yok) gerçek yazma yapılmaz; başarı döner.
 */

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
