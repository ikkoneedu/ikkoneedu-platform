import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/shared/LogoMark";
import { PrimaryButton } from "@/components/shared/PrimaryButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { productName } from "@/lib/constants";
import type { PublicSchool } from "@/lib/tenant/tenant-config";

interface SchoolPublicShellProps {
  school: PublicSchool;
  children: ReactNode;
}

/**
 * Halka açık okul sayfası kabuğu (/school/[slug]).
 * Okul markalı header + footer; okul portalına giriş bağlantısı tenant slug'ı taşır.
 */
export function SchoolPublicShell({ school, children }: SchoolPublicShellProps) {
  return (
    <div className="mesh-bg min-h-screen w-full overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-overlay/10 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={`/school/${school.slug}`} className="flex items-center gap-2.5">
            <LogoMark size={30} />
            <span className="truncate text-sm font-semibold tracking-tight text-content sm:text-base">
              {school.schoolName}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link href={`/login?school=${school.slug}`}>
              <PrimaryButton size="sm">Okul Portalına Giriş</PrimaryButton>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>

      <footer className="border-t border-overlay/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <LogoMark size={22} />
            <span className="font-medium text-content">{productName}</span>
          </div>
          <p>© {new Date().getFullYear()} {school.schoolName}</p>
        </div>
      </footer>
    </div>
  );
}
