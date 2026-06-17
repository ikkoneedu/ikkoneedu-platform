"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mobileNavigationItems } from "@/lib/constants";

interface MobileBottomNavProps {
  className?: string;
}

/**
 * Mobil alt navigasyon çubuğu.
 * Küçük ekranlarda öncelikli menü öğelerine hızlı erişim sağlar.
 * Masaüstünde gizlenir; o boyutta Sidebar kullanılır.
 */
export function MobileBottomNav({ className = "" }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={[
        "fixed inset-x-0 bottom-0 z-40 flex items-center justify-around",
        "border-t border-white/10 bg-background/80 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-xl lg:hidden",
        className,
      ].join(" ")}
    >
      {mobileNavigationItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={[
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[11px] font-medium transition-colors",
              isActive ? "text-content" : "text-muted hover:text-content",
            ].join(" ")}
          >
            <Icon size={20} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
