/**
 * Paket → modül çözümleyici (SAF MANTIK).
 *
 * Bir modülün bir tenant'ta açık olup olmadığını belirler:
 *   1. isCore modüller daima açık (paket gözetilmez).
 *   2. Paket seviyesi modülün minimumPackage seviyesine eşit/büyükse açık.
 *   3. tenant.modules override son sözü söyler (true: zorla aç, false: zorla kapat).
 *
 * `tenant.modules` alanı YOKSA güvenli biçimde pakete göre çözülür (geriye
 * dönük uyum: mevcut tenant'lar override tanımlamadan çalışır). Bu dosya
 * davranış değiştirmez; yalnızca türetilmiş erişim/durum bilgisi üretir.
 */

import { DEFAULT_PACKAGE_ID, type PackageId } from "@/lib/packages";
import {
  MODULE_CATALOG,
  getModule,
  type ModuleDefinition,
  type ModuleId,
  type ModuleStatus,
} from "@/lib/modules/module-catalog";

/** Paket yetki seviyeleri (büyük = daha kapsamlı). */
const PACKAGE_RANK: Record<PackageId, number> = {
  starter: 0,
  professional: 1,
  enterprise: 2,
};

function rankOf(packageId: string | undefined | null): number {
  if (packageId && packageId in PACKAGE_RANK) {
    return PACKAGE_RANK[packageId as PackageId];
  }
  return PACKAGE_RANK[DEFAULT_PACKAGE_ID];
}

/** Çözümleme için gereken minimal tenant şekli (TenantRecord ile uyumlu). */
export interface ModuleAccessTenant {
  packageId?: string | null;
  /** Opsiyonel override: moduleId → açık/kapalı. Yoksa pakete göre çözülür. */
  modules?: Record<string, boolean> | null;
}

/** Bir modülün erişim kararının kaynağı (şeffaflık/önizleme için). */
export type ModuleAccessSource =
  | "core" // temel modül, daima açık
  | "package" // paket kapsamında açık
  | "package-excluded" // paket kapsamı dışı (kapalı)
  | "override-on" // tenant override ile zorla açık
  | "override-off"; // tenant override ile zorla kapalı

export interface ModuleAccess {
  module: ModuleDefinition;
  included: boolean;
  source: ModuleAccessSource;
  /** Tenant için geçerli durum: kapalıysa "locked", açıksa modülün kendi durumu. */
  status: ModuleStatus;
}

/** Modül, verilen pakette (override hariç) yer alıyor mu? */
export function isModuleIncludedInPackage(
  moduleId: string,
  packageId: string | undefined | null,
): boolean {
  const mod = getModule(moduleId);
  if (!mod) return false;
  if (mod.isCore) return true;
  return rankOf(packageId) >= PACKAGE_RANK[mod.minimumPackage];
}

/** Verilen paketin içerdiği tüm modüller (override hariç, katalog sırası). */
export function getModulesForPackage(
  packageId: string | undefined | null,
): ModuleDefinition[] {
  return MODULE_CATALOG.filter((m) => isModuleIncludedInPackage(m.id, packageId));
}

/** Tek bir modül için tenant erişim kararını çözer (override dahil). */
export function resolveModuleAccess(
  mod: ModuleDefinition,
  tenant: ModuleAccessTenant | null | undefined,
): ModuleAccess {
  const override = tenant?.modules ?? null;
  const hasOverride =
    override != null && Object.prototype.hasOwnProperty.call(override, mod.id);

  let included: boolean;
  let source: ModuleAccessSource;

  if (mod.isCore) {
    // Temel modül override ile kapatılamaz (ürün bütünlüğü).
    included = true;
    source = "core";
  } else if (hasOverride) {
    included = override![mod.id] === true;
    source = included ? "override-on" : "override-off";
  } else {
    included = isModuleIncludedInPackage(mod.id, tenant?.packageId);
    source = included ? "package" : "package-excluded";
  }

  return {
    module: mod,
    included,
    source,
    status: included ? mod.status : "locked",
  };
}

/** Tenant'ın TÜM modül erişimini çözer (katalog sırası). */
export function resolveTenantModuleAccess(
  tenant: ModuleAccessTenant | null | undefined,
): ModuleAccess[] {
  return MODULE_CATALOG.map((m) => resolveModuleAccess(m, tenant));
}

/** Tenant için tek modülün geçerli durumunu döndürür (yoksa "locked"). */
export function getModuleStatusForTenant(
  moduleId: string,
  tenant: ModuleAccessTenant | null | undefined,
): ModuleStatus {
  const mod = getModule(moduleId);
  if (!mod) return "locked";
  return resolveModuleAccess(mod, tenant).status;
}

/** Tenant'ta modül kullanılabilir mi (açık + comingSoon değil)? */
export function isModuleUsableForTenant(
  moduleId: string,
  tenant: ModuleAccessTenant | null | undefined,
): boolean {
  const status = getModuleStatusForTenant(moduleId, tenant);
  return status !== "locked" && status !== "comingSoon";
}

/** Yalnızca tenant'ta açık (locked olmayan) modüller. */
export function getEnabledModulesForTenant(
  tenant: ModuleAccessTenant | null | undefined,
): ModuleId[] {
  return resolveTenantModuleAccess(tenant)
    .filter((a) => a.included)
    .map((a) => a.module.id);
}
