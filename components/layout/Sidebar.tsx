"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/LogoMark";
import { navigationItems, type NavigationItem } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import { useT } from "@/components/i18n/LocaleProvider";
import { canRoleAccess } from "@/lib/auth/route-config";
import { useTenantModules } from "@/components/modules/useTenantModules";
import type { ModuleStatus } from "@/lib/modules/module-catalog";

/** Menü öğesi için modül durum rozeti stili (yalnız bilgilendirici). */
const BADGE_STYLE: Partial<Record<ModuleStatus, string>> = {
  comingSoon: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  pilot: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  aiReady: "border-accent/30 bg-accent/10 text-accent",
  locked: "border-overlay/15 bg-overlay/[0.05] text-muted",
};

interface SidebarProps {
  /** Menü öğeleri (varsayılan: genel navigasyon). */
  items?: NavigationItem[];
  /** Aktif menü öğesini açıkça belirler (rota yoksa kullanılır). */
  activeId?: string;
  /** Marka altında gösterilen alt başlık. */
  subtitle?: string;
  /** Menü altındaki ek alan (birincil eylem, yardımcı bağlantılar vb.). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Masaüstü kenar çubuğu navigasyonu.
 * Cam efektli yüzey üzerinde marka ve ana menüyü barındırır.
 * Mobilde gizlenir; küçük ekranlarda MobileBottomNav kullanılır.
 */
export function Sidebar({
  items = navigationItems,
  activeId,
  subtitle,
  footer,
  className = "",
}: SidebarProps) {
  const pathname = usePathname();
  const { profile, firebaseReady } = useAuth();
  const t = useT();
  const { ready: modulesReady, statusOf } = useTenantModules();

  // Rol-duyarlı menü: oturum açıkken kullanıcının erişemediği öğeler gizlenir.
  // Mock Mod'da (Firebase yok) veya profil yokken tüm öğeler gösterilir.
  const visibleItems =
    firebaseReady && profile
      ? items.filter((item) => canRoleAccess(profile.role, item.href))
      : items;

  const isItemActive = (item: NavigationItem) => {
    if (activeId) return item.id === activeId;
    if (item.href === "#") return false;
    return item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);
  };

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-40 hidden h-screen w-64 shrink-0 flex-col",
        "border-r border-overlay/10 bg-overlay/[0.02] px-4 py-6 backdrop-blur-xl lg:flex",
        className,
      ].join(" ")}
    >
      <div className="px-2">
        <Logo size={32} />
        {subtitle && (
          <span className="mt-1 block pl-[42px] text-xs text-muted">
            {subtitle}
          </span>
        )}
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = isItemActive(item);
          const Icon = item.icon;

          // Modül durum rozeti — yalnız bilgilendirici; öğe ASLA gizlenmez.
          // "live" ve veri hazır değilken rozet gösterilmez (gürültü olmasın).
          const status =
            modulesReady && item.moduleId ? statusOf(item.moduleId) : null;
          const badge = status && status !== "live" ? BADGE_STYLE[status] : null;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "border-r-2 border-accent bg-accent/10 font-semibold text-accent"
                  : "text-muted hover:bg-overlay/[0.04] hover:text-content",
              ].join(" ")}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="flex-1 truncate">{t(item.labelKey)}</span>
              {badge && status && (
                <span
                  className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${badge}`}
                >
                  {t(`modules.status.${status}`)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        {footer ?? (
          <div className="rounded-xl border border-overlay/10 bg-navy/30 p-4 text-xs text-muted">
            Yapay zeka destekli eğitim işletim sistemi
          </div>
        )}
      </div>
    </aside>
  );
}
