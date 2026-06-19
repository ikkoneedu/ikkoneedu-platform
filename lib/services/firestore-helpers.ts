/**
 * Servis katmanı ortak yardımcıları.
 *
 * Tüm `create*` servisleri buradaki `createDocument` üzerinden çalışır:
 * - Firebase yapılandırılmamışsa (Mock Mod) Firestore'a yazmaz, başarı döner.
 * - Yapılandırılmışsa Firestore'a `addDoc` ile yazar.
 * - Hata durumunda `ok: false` ve hata mesajı döner.
 */

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

export interface CreateResult {
  /** İşlem başarılı mı (mock dahil)? */
  ok: boolean;
  /** Mock modda mı çalıştı (Firebase yapılandırılmamış)? */
  mock: boolean;
  /** Oluşturulan belge kimliği (mock'ta sentetik). */
  id: string | null;
  /** Hata oluştuysa kullanıcıya gösterilebilir mesaj. */
  error?: string;
}

function mockId(): string {
  return `mock_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Verilen koleksiyon yoluna belge oluşturur (mock veya gerçek).
 */
export async function createDocument(
  path: string,
  data: Record<string, unknown>,
): Promise<CreateResult> {
  // Mock Mod: env yoksa Firestore'a yazılmaz.
  if (!isFirebaseConfigured() || !db) {
    return { ok: true, mock: true, id: mockId() };
  }

  try {
    const ref = await addDoc(collection(db, path), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { ok: true, mock: false, id: ref.id };
  } catch (error) {
    return {
      ok: false,
      mock: false,
      id: null,
      error: error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.",
    };
  }
}
