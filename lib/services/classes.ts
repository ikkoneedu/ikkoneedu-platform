/**
 * Okul sınıf yapısı servisi — kademe (grade) + şube (branch) modeli.
 *
 * Gerçek okul yapısı: her kademeden FARKLI sayıda şube olabilir.
 *   Örn. 1. sınıf 4 şube (1-A…1-D), 2. sınıf 5 şube (2-A…2-E),
 *        3. sınıf 4 şube, 4. sınıf 7 şube (4-A…4-G).
 *
 * Yönetici her kademe için şube sayısını girer; sistem şubeleri otomatik üretir.
 * Kayıtlar tenants/{tenantId}/classes altında (öğretmen sınıflarıyla aynı
 * koleksiyon, `kind:"structure"` ile ayrışır). Ders programı bu şubelere bağlanır.
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { tenantClasses, classDoc } from "@/lib/firebase/collections";

/** Şube harfleri (karışan harf yok, Türkçe sıralı: A, B, C, D…). */
export const BRANCH_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** "1" + 0 → "1-A", "4" + 6 → "4-G". */
export function branchName(grade: string, index: number): string {
  return `${grade}-${BRANCH_LETTERS[index] ?? String(index + 1)}`;
}

export interface SchoolClass {
  id: string;
  /** Kademe etiketi (ör. "1", "2", "Anasınıfı", "Hazırlık"). */
  gradeLevel: string;
  /** Şube harfi (ör. "A"). Yapı dışı (öğretmen) sınıflarda boş olabilir. */
  branch: string;
  /** Görünen ad (ör. "1-A"). */
  name: string;
  /** Yapı sınıfı mı (yönetici üretti) yoksa öğretmen sınıfı mı. */
  kind: "structure" | "teacher";
}

function mapClass(id: string, data: Record<string, unknown>): SchoolClass {
  return {
    id,
    gradeLevel: String(data.gradeLevel ?? ""),
    branch: String(data.branch ?? ""),
    name: String(data.name ?? ""),
    kind: data.kind === "structure" ? "structure" : "teacher",
  };
}

/** Okuldaki TÜM sınıfları listeler (yapı + öğretmen), kademe/şube sıralı. */
export async function listClasses(tenantId: string): Promise<SchoolClass[]> {
  if (!isFirebaseConfigured() || !db) return [];
  const snap = await getDocs(query(collection(db, tenantClasses(tenantId))));
  const items = snap.docs.map((d) => mapClass(d.id, d.data()));
  items.sort((a, b) =>
    a.gradeLevel !== b.gradeLevel
      ? a.gradeLevel.localeCompare(b.gradeLevel, "tr", { numeric: true })
      : a.branch.localeCompare(b.branch, "tr"),
  );
  return items;
}

/** Yalnızca yapı (yönetici) sınıfları — ders programı bunlara bağlanır. */
export async function listStructureClasses(
  tenantId: string,
): Promise<SchoolClass[]> {
  const all = await listClasses(tenantId);
  return all.filter((c) => c.kind === "structure");
}

/**
 * Bir kademe için şubeleri OTOMATİK üretir.
 * `grade="1", count=4` → 1-A, 1-B, 1-C, 1-D (var olanları atlar).
 * Var olan şube sayısı `count`'tan fazlaysa fazlalık silinmez (güvenli).
 */
export async function generateBranches(
  tenantId: string,
  grade: string,
  count: number,
): Promise<number> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const g = grade.trim();
  if (!g || count < 1) return 0;

  const existing = await listClasses(tenantId);
  const existingBranches = new Set(
    existing
      .filter((c) => c.kind === "structure" && c.gradeLevel === g)
      .map((c) => c.branch),
  );

  const batch = writeBatch(db);
  let created = 0;
  for (let i = 0; i < count && i < BRANCH_LETTERS.length; i += 1) {
    const branch = BRANCH_LETTERS[i];
    if (existingBranches.has(branch)) continue;
    const ref = doc(collection(db, tenantClasses(tenantId)));
    batch.set(ref, {
      name: branchName(g, i),
      gradeLevel: g,
      branch,
      kind: "structure",
      teacherUid: "",
      createdAt: serverTimestamp(),
    });
    created += 1;
  }
  if (created > 0) await batch.commit();
  return created;
}

/** Tek bir şube/sınıf ekler (manuel; örn. "Anasınıfı-A"). */
export async function addClass(
  tenantId: string,
  gradeLevel: string,
  branch: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  const g = gradeLevel.trim();
  const b = branch.trim().toUpperCase();
  if (!g) return;
  await addDoc(collection(db, tenantClasses(tenantId)), {
    name: b ? `${g}-${b}` : g,
    gradeLevel: g,
    branch: b,
    kind: "structure",
    teacherUid: "",
    createdAt: serverTimestamp(),
  });
}

/** Bir sınıfı siler. */
export async function deleteClass(
  tenantId: string,
  classId: string,
): Promise<void> {
  if (!isFirebaseConfigured() || !db) {
    throw new Error("Firebase yapılandırılmamış.");
  }
  await deleteDoc(doc(db, classDoc(tenantId, classId)));
}
