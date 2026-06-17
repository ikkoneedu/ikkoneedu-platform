"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/shared/LogoMark";
import { navigationItems } from "@/lib/constants";

interface SidebarProps {
  className?: string;
}

/**
 * Masaüstü kenar çubuğu navigasyonu.
 * Cam efektli yüzey üzerinde marka ve ana menüyü barındırır.
 * Mobilde gizlenir; küçük ekranlarda MobileBottomNav kullanılır.
 */
export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "hidden h-screen w-64 shrink-0 flex-col border-r border-white/10",
        "bg-white/[0.02] px-4 py-6 backdrop-blur-xl lg:flex",
        className,
      ].join(" ")}
    >
      <div className="px-2">
        <Logo size={32} />
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/[0.06] text-content"
                  : "text-muted hover:bg-white/[0.04] hover:text-content",
              ].join(" ")}
            >
              <Icon size={18} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-navy/30 p-4 text-xs text-muted">
        Yapay zeka destekli eğitim işletim sistemi
      </div>
    </aside>
  );
}
