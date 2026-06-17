"use client";

import { Bell, Search } from "lucide-react";
import { Logo } from "@/components/shared/LogoMark";

interface TopbarProps {
  /** Sayfa başlığı (opsiyonel). */
  title?: string;
  className?: string;
}

/**
 * Üst çubuk.
 * Mobilde marka, masaüstünde sayfa başlığı; arama ve bildirim eylemleri içerir.
 */
export function Topbar({ title, className = "" }: TopbarProps) {
  return (
    <header
      className={[
        "sticky top-0 z-30 flex h-16 items-center justify-between gap-4",
        "border-b border-white/10 bg-background/70 px-4 backdrop-blur-xl sm:px-6",
        className,
      ].join(" ")}
    >
      {/* Mobilde logo, masaüstünde başlık */}
      <div className="flex items-center">
        <div className="lg:hidden">
          <Logo size={28} />
        </div>
        {title && (
          <h1 className="hidden text-lg font-semibold tracking-tight text-content lg:block">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Ara"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition-colors hover:bg-white/[0.08] hover:text-content"
        >
          <Search size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Bildirimler"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-muted transition-colors hover:bg-white/[0.08] hover:text-content"
        >
          <Bell size={18} aria-hidden="true" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand" />
        </button>
        <div
          aria-hidden="true"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-navy text-xs font-semibold text-content"
        >
          IK
        </div>
      </div>
    </header>
  );
}
