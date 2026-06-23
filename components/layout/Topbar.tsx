"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Logo } from "@/components/shared/LogoMark";
import { UserMenu } from "@/components/layout/UserMenu";

interface TopbarLink {
  id: string;
  label: string;
  href: string;
}

interface TopbarProps {
  /** Sayfa başlığı (opsiyonel, masaüstünde gösterilir). */
  title?: string;
  /** Marka adının yanında gösterilen orta bağlantılar. */
  centerLinks?: readonly TopbarLink[];
  /** Sağ taraftaki eylem alanı (varsayılan: arama, bildirim, profil). */
  actions?: ReactNode;
  className?: string;
}

function DefaultActions() {
  return (
    <>
      <Link
        href="/coming-soon"
        aria-label="Ara (yakında)"
        title="Arama yakında"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition-colors hover:bg-white/[0.08] hover:text-content"
      >
        <Search size={18} aria-hidden="true" />
      </Link>
      <Link
        href="/notifications"
        aria-label="Bildirimler"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition-colors hover:bg-white/[0.08] hover:text-content"
      >
        <Bell size={18} aria-hidden="true" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand" />
      </Link>
      <UserMenu />
    </>
  );
}

/**
 * Üst çubuk.
 * Mobilde marka, masaüstünde sayfa başlığı veya orta bağlantılar gösterir.
 * Sağ tarafta yapılandırılabilir eylem alanı bulunur.
 */
export function Topbar({ title, centerLinks, actions, className = "" }: TopbarProps) {
  return (
    <header
      className={[
        "sticky top-0 z-30 flex h-16 items-center justify-between gap-4",
        "border-b border-white/10 bg-background/70 px-4 backdrop-blur-xl sm:px-6",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-6">
        <div className="lg:hidden">
          <Logo size={28} />
        </div>

        {title && (
          <span className="hidden text-lg font-semibold tracking-tight text-content lg:block">
            {title}
          </span>
        )}

        {centerLinks && centerLinks.length > 0 && (
          <nav className="hidden items-center gap-5 lg:flex">
            {centerLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="text-sm font-medium text-muted transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-2">{actions ?? <DefaultActions />}</div>
    </header>
  );
}
