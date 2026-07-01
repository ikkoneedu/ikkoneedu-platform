/**
 * Kullanıcı silme/geri yükleme — İSTEMCİ servisi.
 *
 * Gerçek silme/geri yükleme DAİMA sunucu API'lerinden yapılır (Admin SDK):
 * `/api/admin/delete-user`, `/api/admin/restore-user`. Bu modül yalnızca
 * o rotaları çağırır + yedek listesini okur (Firestore kuralları okumayı
 * SUPER_ADMIN'e kısıtlar).
 */

import { collection, getDocs } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";

export interface DeletedUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  tenantId: string;
  deletedAt: number | null;
  deletedByName: string;
  restoredAt: number | null;
}

function toMillis(v: unknown): number | null {
  const ts = v as { toMillis?: () => number } | undefined;
  if (ts && typeof ts.toMillis === "function") return ts.toMillis();
  return typeof v === "number" ? v : null;
}

/** Süper admin — bir kullanıcıyı yedekleyerek siler. */
export async function deleteUserAccount(
  idToken: string,
  targetUid: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/admin/delete-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, targetUid }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return { ok: false, error: data.error ?? `HTTP ${res.status}` };
  return { ok: true };
}

/** Süper admin — yedekten bir kullanıcıyı geri yükler. */
export async function restoreUserAccount(
  idToken: string,
  targetUid: string,
): Promise<{ ok: boolean; email?: string; tempPassword?: string; error?: string }> {
  const res = await fetch("/api/admin/restore-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, targetUid }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return { ok: false, error: data.error ?? `HTTP ${res.status}` };
  return { ok: true, email: data.email, tempPassword: data.tempPassword };
}

/** Henüz geri yüklenmemiş silinen kullanıcıları listeler (yalnız SUPER_ADMIN okur). */
export async function listDeletedUsers(): Promise<DeletedUser[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(collection(db, "deletedUsers"));
  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        email: String(data.email ?? ""),
        displayName: String(data.displayName ?? ""),
        role: String(data.role ?? ""),
        tenantId: String(data.tenantId ?? ""),
        deletedAt: toMillis(data.deletedAt),
        deletedByName: String(data.deletedByName ?? ""),
        restoredAt: toMillis(data.restoredAt),
      } satisfies DeletedUser;
    })
    .filter((u) => u.restoredAt === null)
    .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0));
}
