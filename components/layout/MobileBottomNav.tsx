"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavigationItems, type NavigationItem } from "@/lib/constants";
import { useT } from "@/components/i18n/LocaleProvider";

interface MobileBottomNavProps {
  /** Gösterilecek öğeler (varsayılan: genel mobil navigasyon). */
  items?: NavigationItem[];
  /** Aktif öğeyi açıkça belirler (rota yoksa kullanılır). */
  activeId?: string;
  className?: string;
}

/**
 * Mobil alt navigasyon çubuğu.
 * Küçük ekranlarda öncelikli menü öğelerine hızlı erişim sağlar.
 * Masaüstünde gizlenir; o boyutta Sidebar kullanılır.
 */
export function MobileBottomNav({
  items = mobileNavigationItems,
  activeId,
  className = "",
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const t = useT();

  const isItemActive = (item: NavigationItem) => {
    if (activeId) return item.id === activeId;
    if (item.href === "#") return false;
    return item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  };

  return (
    <nav
      className={[
        "fixed inset-x-0 bottom-0 z-40 flex items-center justify-around",
        "border-t border-overlay/10 bg-background/80 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden",
        className,
      ].join(" ")}
    >
      {items.map((item) => {
        const isActive = isItemActive(item);
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors",
              isActive
                ? "text-accent"
                : item.highlight
                  ? "text-emerald-300"
                  : "text-muted hover:text-content",
            ].join(" ")}
          >
            <Icon size={20} aria-hidden="true" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
