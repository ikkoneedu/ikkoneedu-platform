/**
 * Merkezi route koruma yapılandırması.
 *
 * Halka açık (public) ve korumalı (protected) route ayrımının tek doğruluk
 * kaynağıdır. Şu an gerçek kimlik doğrulama YOKTUR; bu yapı `middleware.ts`,
 * `robots.ts` ve ileride Firebase Auth tarafından kullanılmak üzere hazırdır.
 *
 * Firebase Auth bağlandığında: middleware oturum çerezini/claim'leri okuyup
 * `getRequiredRoles(pathname)` ile rol kontrolü yapacak, yetkisizleri
 * `/login`e yönlendirecektir.
 */

import { ROLES, type Role } from "@/lib/auth/role-constants";

/** Kimlik doğrulama gerektirmeyen tam yollar. */
export const PUBLIC_ROUTES: string[] = [
  "/",
  "/features",
  "/pricing",
  "/demo",
  "/founder-school",
  "/mobile-app",
  "/login",
  "/register",
  "/code-login",
  "/profile",
  "/school-select",
  "/scholarship-exam/apply",
  "/scholarship-exam/admission-card",
  "/scholarship-exam/results",
];

/** Kimlik doğrulama gerektirmeyen yol önekleri (alt sayfalar dahil). */
export const PUBLIC_PREFIXES: string[] = [
  "/school", // /school/[slug] ve /school/[slug]/scholarship/*
];

/**
 * Korumalı panel önekleri (ileride Firebase Auth ile korunacak).
 * NOT: `/scholarship-exam` yönetim kökü korumalıdır; ancak `/scholarship-exam/apply`
 * gibi halka açık alt yollar `PUBLIC_ROUTES` ile istisna tutulur.
 */
export const PROTECTED_PREFIXES: string[] = [
  "/admin",
  "/portal",
  "/teacher",
  "/parent",
  "/student",
  "/super-admin",
  "/settings",
  "/crm",
  "/messages",
  "/notifications",
  "/executive",
  "/saas-admin",
  "/counseling",
  "/finance",
  "/report-card-ai",
  "/scholarship-exam",
  "/ai-brain",
  "/scheduler-ai",
  "/exam-ai",
  "/admissions-ai",
  "/events",
  "/lunch-menu",
  "/bus-routes",
  "/lesson-plans",
  "/social-studio",
];

/** Okul yaşamı modülleri — tüm okul üyeleri erişir (personel oluşturur, herkes görür). */
const SCHOOL_LIFE_ROLES: Role[] = [
  ROLES.PARENT, ROLES.STUDENT, ROLES.TEACHER, ROLES.COORDINATOR,
  ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL, ROLES.SCHOOL_ADMIN, ROLES.FOUNDER,
  ROLES.PR, ROLES.SALES, ROLES.SUPPORT, ROLES.DRIVER, ROLES.SUPER_ADMIN,
];

/** Korumalı route → bu route'a erişebilecek roller. */
export const ROUTE_ROLES: Record<string, Role[]> = {
  "/admin": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL,
    ROLES.VICE_PRINCIPAL, ROLES.SUPER_ADMIN,
  ],
  // Okul kayıt yönetimi — koordinatör de erişebilir (daha spesifik prefix).
  "/admin/records": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL,
    ROLES.VICE_PRINCIPAL, ROLES.COORDINATOR, ROLES.SUPER_ADMIN,
  ],
  "/portal": [
    ROLES.PUBLIC, ROLES.PARENT, ROLES.STUDENT, ROLES.TEACHER,
    ROLES.SCHOOL_ADMIN, ROLES.SUPER_ADMIN,
  ],
  "/teacher": [
    ROLES.TEACHER, ROLES.COORDINATOR, ROLES.SCHOOL_ADMIN, ROLES.FOUNDER,
    ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL, ROLES.SUPER_ADMIN,
  ],
  "/parent": [ROLES.PARENT, ROLES.SUPER_ADMIN],
  "/student": [ROLES.STUDENT, ROLES.SUPER_ADMIN],
  // Okul yaşamı modülleri — tüm okul üyeleri erişir.
  "/events": SCHOOL_LIFE_ROLES,
  "/lunch-menu": SCHOOL_LIFE_ROLES,
  "/bus-routes": SCHOOL_LIFE_ROLES,
  "/lesson-plans": SCHOOL_LIFE_ROLES,
  "/super-admin": [ROLES.SUPER_ADMIN],
  "/saas-admin": [ROLES.SUPER_ADMIN],
  "/settings": [ROLES.SUPER_ADMIN, ROLES.FOUNDER, ROLES.SCHOOL_ADMIN],
  "/executive": [
    ROLES.SUPER_ADMIN, ROLES.FOUNDER, ROLES.SCHOOL_ADMIN,
    ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
  ],
  // Finans/ekonomik panel — Müdür (PRINCIPAL) ve yardımcısı HARİÇ.
  "/finance": [ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.SUPER_ADMIN],
  "/crm": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL,
    ROLES.PR, ROLES.SALES, ROLES.SUPER_ADMIN,
  ],
  // Rehberlik (PDR) — HASSAS. Yalnızca yönetim + koordinatör (rehberlik).
  // Sıradan ÖĞRETMEN tüm öğrencilerin psikolojik danışma notlarını göremez.
  "/counseling": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL,
    ROLES.VICE_PRINCIPAL, ROLES.COORDINATOR, ROLES.SUPER_ADMIN,
  ],
  "/messages": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
    ROLES.COORDINATOR, ROLES.TEACHER, ROLES.PARENT, ROLES.STUDENT,
    ROLES.SUPPORT, ROLES.SUPER_ADMIN,
  ],
  "/notifications": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
    ROLES.COORDINATOR, ROLES.TEACHER, ROLES.PARENT, ROLES.STUDENT,
    ROLES.SUPPORT, ROLES.SUPER_ADMIN,
  ],
  "/report-card-ai": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
    ROLES.COORDINATOR, ROLES.TEACHER, ROLES.SUPER_ADMIN,
  ],
  // Bursluluk yönetim kökü — halka açık alt yollar (apply/results/admission-card)
  // PUBLIC_ROUTES'ta istisna tutulur; bu roller yalnızca /scholarship-exam kökü içindir.
  "/scholarship-exam": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
    ROLES.PR, ROLES.SALES, ROLES.SUPER_ADMIN,
  ],
  "/ai-brain": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.SUPER_ADMIN,
  ],
  "/scheduler-ai": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
    ROLES.COORDINATOR, ROLES.SUPER_ADMIN,
  ],
  "/exam-ai": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
    ROLES.COORDINATOR, ROLES.TEACHER, ROLES.SUPER_ADMIN,
  ],
  "/admissions-ai": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
    ROLES.COORDINATOR, ROLES.PR, ROLES.SALES, ROLES.SUPER_ADMIN,
  ],
  // Sosyal Medya AI Stüdyo — tanıtım/yönetim. Demo taslak (gerçek AI sonraki faz).
  "/social-studio": [
    ROLES.SCHOOL_ADMIN, ROLES.FOUNDER, ROLES.PRINCIPAL, ROLES.VICE_PRINCIPAL,
    ROLES.PR, ROLES.SALES, ROLES.SUPER_ADMIN,
  ],
};

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Verilen yol halka açık mı? */
export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

/** Verilen yol korumalı mı? (Public istisnalar önceliklidir.) */
export function isProtectedRoute(pathname: string): boolean {
  if (isPublicRoute(pathname)) return false;
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

/**
 * Verilen yol için gerekli roller. EN SPESİFİK (en uzun) eşleşen önek kazanır
 * (ör. `/admin/records`, `/admin`'den önce gelir). Eşleşme yoksa boş dizi.
 */
export function getRequiredRoles(pathname: string): Role[] {
  let best: { prefix: string; roles: Role[] } | null = null;
  for (const [prefix, roles] of Object.entries(ROUTE_ROLES)) {
    if (matchesPrefix(pathname, prefix)) {
      if (!best || prefix.length > best.prefix.length) {
        best = { prefix, roles };
      }
    }
  }
  return best ? best.roles : [];
}

/**
 * Bir rol verilen yola erişebilir mi? Rol-kapısı yoksa herkese açıktır.
 * Navigasyonu role göre filtrelemek için kullanılır (ör. müdüre finans gizleme).
 */
export function canRoleAccess(
  role: Role | null | undefined,
  pathname: string,
): boolean {
  const required = getRequiredRoles(pathname);
  if (required.length === 0) return true;
  if (!role) return false;
  return required.includes(role);
}
