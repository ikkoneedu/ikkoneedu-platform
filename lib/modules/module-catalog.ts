/**
 * Modül kataloğu (statik) — ürünün satılabilir modüllerinin tek doğruluk kaynağı.
 *
 * SAF VERİ + SAF MANTIK: bu dosya hiçbir şey render etmez ve davranış değiştirmez.
 * Paket→modül çözümlemesi `lib/modules/resolver.ts` içindedir. Görsel etiketler
 * i18n sözlüğünde (`lib/i18n/dict/modules.ts`) `modules.<id>.{name,short,sales}`
 * anahtarlarıyla tutulur.
 *
 * Modüller kod içinde sabittir (Firestore'da `modules` koleksiyonu gerekmez);
 * tenant yalnızca paket (packageId) ve opsiyonel modül override saklar.
 */

import type { Role } from "@/lib/auth/role-constants";
import type { PackageId } from "@/lib/packages";

/** Modül kimlikleri — kod içinde tip güvenli referans için. */
export type ModuleId =
  | "admissions"
  | "socialStudio"
  | "events"
  | "certificates"
  | "exams"
  | "hiring"
  | "parentCommunication"
  | "website"
  | "reports"
  | "finance"
  | "counseling"
  | "messages"
  | "notifications"
  | "aiBrain"
  | "schedulerAi"
  | "examAi"
  | "reportCardAi";

/** Modül kategorileri (gruplama / pricing düzeni için). */
export type ModuleCategory =
  | "growth"
  | "schoolLife"
  | "academic"
  | "operations"
  | "communication"
  | "ai";

/**
 * Modül yaşam döngüsü durumu:
 * - live: gerçek, kullanılabilir
 * - pilot: gerçek ama sınırlı/erken
 * - comingSoon: henüz yok (satış vitrininde "Yakında")
 * - aiReady: AI altyapısı hazır, demo-safe (gerçek AI sonraki faz)
 * - locked: pakette yok (çözümleme sonrası türetilir; katalogda statik kullanılmaz)
 */
export type ModuleStatus = "live" | "pilot" | "comingSoon" | "aiReady" | "locked";

export interface ModuleDefinition {
  id: ModuleId;
  /** i18n anahtarı: modules.<id>.name */
  nameKey: string;
  /** i18n anahtarı: modules.<id>.short */
  shortDescriptionKey: string;
  /** i18n anahtarı: modules.<id>.sales */
  salesLabelKey: string;
  /** İlişkili uygulama rotası (varsa). comingSoon modüllerde henüz olmayabilir. */
  route?: string;
  category: ModuleCategory;
  /** Modüle erişebilen roller (UX filtresi; gerçek yetki Firestore + RoleGuard). */
  requiredRoles: Role[];
  /** Modülü içeren en düşük paket. isCore=true ise paket gözetilmez. */
  minimumPackage: PackageId;
  /** Katalog durumu (pakette varsayılan davranış; tenant override değiştirebilir). */
  status: Exclude<ModuleStatus, "locked">;
  /** Temel modül — her pakette daima açık (paket gözetilmez). */
  isCore: boolean;
  /** Hassas veri (PDR/finans gibi) — ek rol kısıtı ve uyarı için işaret. */
  isSensitive: boolean;
}

// Rol kısayolları (okunabilirlik) — gerçek izinler route-config + Firestore'da.
const MGMT: Role[] = [
  "SUPER_ADMIN",
  "FOUNDER",
  "SCHOOL_ADMIN",
  "PRINCIPAL",
  "VICE_PRINCIPAL",
];
const MGMT_PLUS_COORD: Role[] = [...MGMT, "COORDINATOR"];
const STAFF: Role[] = [...MGMT_PLUS_COORD, "TEACHER"];
const EVERYONE: Role[] = [...STAFF, "PARENT", "STUDENT"];
const GROWTH_ROLES: Role[] = [...MGMT, "PR", "SALES"];

function mk(
  id: ModuleId,
  category: ModuleCategory,
  minimumPackage: PackageId,
  status: ModuleDefinition["status"],
  requiredRoles: Role[],
  opts: { route?: string; isCore?: boolean; isSensitive?: boolean } = {},
): ModuleDefinition {
  return {
    id,
    nameKey: `modules.${id}.name`,
    shortDescriptionKey: `modules.${id}.short`,
    salesLabelKey: `modules.${id}.sales`,
    route: opts.route,
    category,
    requiredRoles,
    minimumPackage,
    status,
    isCore: opts.isCore ?? false,
    isSensitive: opts.isSensitive ?? false,
  };
}

/** Modül kataloğu — sıralama satış vitrini düzenini de belirler. */
export const MODULE_CATALOG: ModuleDefinition[] = [
  // İletişim — temel (her pakette)
  mk("messages", "communication", "starter", "live", EVERYONE, {
    route: "/messages",
    isCore: true,
  }),
  mk("notifications", "communication", "starter", "live", EVERYONE, {
    route: "/notifications",
    isCore: true,
  }),
  mk("parentCommunication", "communication", "starter", "live", STAFF, {
    route: "/messages",
  }),

  // Okul yaşamı
  mk("events", "schoolLife", "starter", "live", EVERYONE, { route: "/events" }),
  mk("certificates", "schoolLife", "starter", "pilot", STAFF, {
    route: "/certificates",
  }),

  // Büyüme & tanıtım
  mk("website", "growth", "starter", "live", MGMT, { route: "/school" }),
  mk("admissions", "growth", "professional", "live", GROWTH_ROLES, { route: "/crm" }),
  mk("socialStudio", "growth", "starter", "aiReady", GROWTH_ROLES, {
    route: "/social-studio",
  }),
  mk("hiring", "growth", "starter", "aiReady", MGMT, { route: "/hiring" }),

  // Akademik
  mk("exams", "academic", "professional", "pilot", MGMT_PLUS_COORD, {
    route: "/scholarship-exam",
  }),
  mk("counseling", "academic", "professional", "live", MGMT_PLUS_COORD, {
    route: "/counseling",
    isSensitive: true,
  }),

  // Operasyon & yönetim
  mk("reports", "operations", "professional", "live", MGMT, { route: "/executive" }),
  mk("finance", "operations", "professional", "live", MGMT, {
    route: "/finance",
    isSensitive: true,
  }),

  // Yapay zekâ
  mk("aiBrain", "ai", "enterprise", "aiReady", MGMT_PLUS_COORD, { route: "/ai-brain" }),
  mk("schedulerAi", "ai", "enterprise", "aiReady", MGMT_PLUS_COORD, {
    route: "/scheduler-ai",
  }),
  mk("examAi", "ai", "enterprise", "aiReady", MGMT_PLUS_COORD, { route: "/exam-ai" }),
  mk("reportCardAi", "ai", "enterprise", "aiReady", STAFF, {
    route: "/report-card-ai",
  }),
];

export const MODULE_IDS = MODULE_CATALOG.map((m) => m.id);

const BY_ID = new Map<ModuleId, ModuleDefinition>(
  MODULE_CATALOG.map((m) => [m.id, m]),
);

/** Kimliğe göre modül tanımı (yoksa undefined). */
export function getModule(id: string): ModuleDefinition | undefined {
  return BY_ID.get(id as ModuleId);
}

export function isValidModuleId(id: string): id is ModuleId {
  return BY_ID.has(id as ModuleId);
}

/** Kategoriye göre modüller (katalog sırasını korur). */
export function getModulesByCategory(category: ModuleCategory): ModuleDefinition[] {
  return MODULE_CATALOG.filter((m) => m.category === category);
}
