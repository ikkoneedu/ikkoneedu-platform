/**
 * SaaS paket kataloğu (statik) — abonelik paketleri.
 *
 * Paketler kod içinde sabittir (Firestore'da `packages` koleksiyonu gerekmez);
 * tenant yalnızca `packageId` saklar. İleride fiyat/limit alanları eklenebilir.
 */

export const PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    description: "Küçük okullar için temel modüller.",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Büyüyen okullar için gelişmiş modüller.",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Kurumsal kampüsler için tam kapsam.",
  },
] as const;

export type PackageId = (typeof PACKAGES)[number]["id"];

export const PACKAGE_IDS = PACKAGES.map((p) => p.id) as PackageId[];

export const DEFAULT_PACKAGE_ID: PackageId = "starter";

export function packageLabel(id: string): string {
  return PACKAGES.find((p) => p.id === id)?.name ?? id;
}

export function isValidPackageId(id: string): id is PackageId {
  return PACKAGE_IDS.includes(id as PackageId);
}
